package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.LoginRequest;
import com.nativatec.cuestionarios.dto.RegisterRequest;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.UsuarioRepository;
import com.nativatec.cuestionarios.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
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
}