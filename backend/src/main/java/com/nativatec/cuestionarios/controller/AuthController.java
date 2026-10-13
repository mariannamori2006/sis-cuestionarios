package com.nativatec.cuestionarios.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nativatec.cuestionarios.dto.GoogleAuthRequest;
import com.nativatec.cuestionarios.dto.LoginRequest;
import com.nativatec.cuestionarios.dto.RegisterRequest;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.UsuarioRepository;
import com.nativatec.cuestionarios.security.JwtTokenProvider;
import com.nativatec.cuestionarios.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Value("${google.client.id:}")
    private String googleClientId;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // Buscamos al usuario en la base de datos usando el email del request
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Preparamos la respuesta incluyendo nombre, apellido, correo y rol
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", jwt);
        response.put("tokenType", "Bearer");
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido() != null ? usuario.getApellido() : "");
        response.put("email", usuario.getEmail());
        response.put("rol", usuario.getRol().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es requerido"));
        }
        if (usuarioRepository.findByEmail(registerRequest.getEmail().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico ya está registrado en el sistema"));
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(registerRequest.getNombre() != null ? registerRequest.getNombre().trim() : "");
        usuario.setApellido(registerRequest.getApellido() != null ? registerRequest.getApellido().trim() : "");
        usuario.setEmail(registerRequest.getEmail().trim());
        usuario.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));

        if (registerRequest.getRol() != null && !registerRequest.getRol().trim().isEmpty()) {
            try {
                usuario.setRol(Usuario.RolUsuario.valueOf(registerRequest.getRol().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                usuario.setRol(Usuario.RolUsuario.PROFESOR);
            }
        } else {
            usuario.setRol(Usuario.RolUsuario.PROFESOR);
        }

        usuario.setActivo(true);
        Usuario savedUsuario = usuarioRepository.save(usuario);

        // Autenticar directamente para retornar token de sesión inmediata
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail().trim(),
                        registerRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", jwt);
        response.put("tokenType", "Bearer");
        response.put("nombre", savedUsuario.getNombre());
        response.put("apellido", savedUsuario.getApellido() != null ? savedUsuario.getApellido() : "");
        response.put("email", savedUsuario.getEmail());
        response.put("rol", savedUsuario.getRol().name());
        response.put("message", "Cuenta creada exitosamente");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleAuthRequest googleRequest) {
        if (googleRequest.getIdToken() == null || googleRequest.getIdToken().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El token de Google es requerido"));
        }

        try {
            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance());

            if (googleClientId != null && !googleClientId.trim().isEmpty()) {
                verifierBuilder.setAudience(Collections.singletonList(googleClientId.trim()));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(googleRequest.getIdToken());

            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token de Google inválido o expirado"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No se pudo obtener el correo de Google"));
            }

            String givenName = (String) payload.get("given_name");
            String familyName = (String) payload.get("family_name");
            String name = (String) payload.get("name");

            Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(email.trim());
            Usuario usuario;
            boolean esNuevoRegistro = false;

            if (usuarioExistente.isPresent()) {
                usuario = usuarioExistente.get();
                if (!Boolean.TRUE.equals(usuario.getActivo())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "La cuenta se encuentra desactivada. Contacta al administrador."));
                }
            } else {
                usuario = new Usuario();
                usuario.setEmail(email.trim());
                String finalNombre = givenName != null && !givenName.trim().isEmpty()
                        ? givenName.trim()
                        : (name != null && !name.trim().isEmpty() ? name.trim() : "Profesor");
                usuario.setNombre(finalNombre);
                usuario.setApellido(familyName != null ? familyName.trim() : "");

                if (googleRequest.getRol() != null && !googleRequest.getRol().trim().isEmpty()) {
                    try {
                        usuario.setRol(Usuario.RolUsuario.valueOf(googleRequest.getRol().trim().toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        usuario.setRol(Usuario.RolUsuario.PROFESOR);
                    }
                } else {
                    usuario.setRol(Usuario.RolUsuario.PROFESOR);
                }

                usuario.setActivo(true);
                usuario.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                usuario = usuarioRepository.save(usuario);
                esNuevoRegistro = true;

                // Enviar correo de bienvenida al profesor registrado
                emailService.enviarCorreoBienvenida(usuario.getEmail(), usuario.getNombre());
            }

            String jwt = tokenProvider.generateTokenFromEmail(usuario.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            response.put("nombre", usuario.getNombre());
            response.put("apellido", usuario.getApellido() != null ? usuario.getApellido() : "");
            response.put("email", usuario.getEmail());
            response.put("rol", usuario.getRol().name());
            response.put("message", esNuevoRegistro
                    ? "Cuenta creada con Google exitosamente. Se ha enviado un correo informativo a tu cuenta."
                    : "Inicio de sesión con Google exitoso.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al procesar la autenticación con Google: " + e.getMessage()));
        }
    }
}