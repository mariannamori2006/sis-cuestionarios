package com.nativatec.cuestionarios.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nativatec.cuestionarios.dto.GoogleAuthRequest;
import com.nativatec.cuestionarios.dto.LoginRequest;
import com.nativatec.cuestionarios.dto.RegisterRequest;
import com.nativatec.cuestionarios.dto.VerificarCodigoRequest;
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

        // Validación estricta de formato, descarte de dominios temporales y verificación de registros MX / @senati.pe
        try {
            com.nativatec.cuestionarios.util.EmailValidatorUtil.validarCorreoExistente(registerRequest.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        String emailLimpio = registerRequest.getEmail().trim().toLowerCase();
        Optional<Usuario> existenteOpt = usuarioRepository.findByEmail(emailLimpio);

        Usuario usuario;
        if (existenteOpt.isPresent()) {
            Usuario existente = existenteOpt.get();
            if (Boolean.TRUE.equals(existente.getActivo())) {
                return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico ya está registrado y activo en el sistema"));
            }
            // Si la cuenta estaba pendiente de verificación, reutilizar el registro
            usuario = existente;
            usuario.setNombre(registerRequest.getNombre() != null ? registerRequest.getNombre().trim() : usuario.getNombre());
            usuario.setApellido(registerRequest.getApellido() != null ? registerRequest.getApellido().trim() : usuario.getApellido());
            usuario.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        } else {
            usuario = new Usuario();
            usuario.setNombre(registerRequest.getNombre() != null ? registerRequest.getNombre().trim() : "");
            usuario.setApellido(registerRequest.getApellido() != null ? registerRequest.getApellido().trim() : "");
            usuario.setEmail(emailLimpio);
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
        }

        // Generar código OTP de 6 dígitos
        String codigoOTP = String.format("%06d", new java.util.Random().nextInt(1000000));
        usuario.setActivo(false); // La cuenta permanece inactiva hasta que verifique el código
        usuario.setCodigoVerificacion(codigoOTP);
        usuario.setCodigoExpiracion(java.time.LocalDateTime.now().plusMinutes(10));

        Usuario savedUsuario = usuarioRepository.save(usuario);

        // Enviar código de verificación de 6 dígitos al correo del usuario
        emailService.enviarCodigoVerificacion(savedUsuario.getEmail(), savedUsuario.getNombre(), codigoOTP);

        // Responder indicando que se requiere validación por código
        Map<String, Object> response = new HashMap<>();
        response.put("requiereVerificacion", true);
        response.put("email", savedUsuario.getEmail());
        response.put("message", "Hemos enviado un código de verificación de 6 dígitos a tu correo.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody VerificarCodigoRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es requerido"));
        }
        if (request.getCodigo() == null || request.getCodigo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El código de verificación es requerido"));
        }

        String email = request.getEmail().trim().toLowerCase();
        String codigoIngresado = request.getCodigo().trim();

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuario no encontrado"));
        }

        // Si ya está activo, iniciar sesión directamente
        if (Boolean.TRUE.equals(usuario.getActivo())) {
            String jwt = tokenProvider.generateTokenFromEmail(usuario.getEmail());
            Map<String, Object> resp = new HashMap<>();
            resp.put("accessToken", jwt);
            resp.put("tokenType", "Bearer");
            resp.put("nombre", usuario.getNombre());
            resp.put("apellido", usuario.getApellido() != null ? usuario.getApellido() : "");
            resp.put("email", usuario.getEmail());
            resp.put("rol", usuario.getRol().name());
            resp.put("message", "La cuenta ya se encuentra verificada y activa.");
            return ResponseEntity.ok(resp);
        }

        // Validar expiración del código (10 minutos)
        if (usuario.getCodigoExpiracion() == null || usuario.getCodigoExpiracion().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "El código de verificación ha expirado. Por favor solicita uno nuevo."));
        }

        // Validar coincidencia del código
        if (usuario.getCodigoVerificacion() == null || !usuario.getCodigoVerificacion().trim().equals(codigoIngresado)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Código de verificación incorrecto. Revisa tu buzón de correo."));
        }

        // ACTIVAR LA CUENTA
        usuario.setActivo(true);
        usuario.setCodigoVerificacion(null);
        usuario.setCodigoExpiracion(null);
        usuario.setUpdatedAt(java.time.LocalDateTime.now());
        Usuario saved = usuarioRepository.save(usuario);

        // ENVIAR EL CORREO DE BIENVENIDA OFICIAL AHORA QUE ESTÁ VERIFICADO
        emailService.enviarCorreoBienvenida(saved.getEmail(), saved.getNombre());

        // Generar token JWT de sesión inmediata
        String jwt = tokenProvider.generateTokenFromEmail(saved.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", jwt);
        response.put("tokenType", "Bearer");
        response.put("nombre", saved.getNombre());
        response.put("apellido", saved.getApellido() != null ? saved.getApellido() : "");
        response.put("email", saved.getEmail());
        response.put("rol", saved.getRol().name());
        response.put("message", "¡Cuenta verificada y activada con éxito! Bienvenido(a).");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reenviar-codigo")
    public ResponseEntity<?> reenviarCodigo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es requerido"));
        }

        String emailLimpio = email.trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(emailLimpio).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuario no encontrado"));
        }

        if (Boolean.TRUE.equals(usuario.getActivo())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Esta cuenta ya está verificada y activa. Puedes iniciar sesión directamente."));
        }

        String nuevoCodigo = String.format("%06d", new java.util.Random().nextInt(1000000));
        usuario.setCodigoVerificacion(nuevoCodigo);
        usuario.setCodigoExpiracion(java.time.LocalDateTime.now().plusMinutes(10));
        usuarioRepository.save(usuario);

        emailService.enviarCodigoVerificacion(usuario.getEmail(), usuario.getNombre(), nuevoCodigo);

        return ResponseEntity.ok(Map.of("message", "Nuevo código de verificación enviado a tu correo electrónico"));
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