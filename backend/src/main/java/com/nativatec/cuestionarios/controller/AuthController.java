package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.LoginRequest;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.UsuarioRepository;
import com.nativatec.cuestionarios.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository; // Inyectamos el repositorio

    public AuthController(AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioRepository = usuarioRepository;
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

        // Preparamos la respuesta incluyendo el nombre y el correo reales de la base de
        // datos
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", jwt);
        response.put("tokenType", "Bearer");
        response.put("nombre", usuario.getNombre());
        response.put("email", usuario.getEmail());
        response.put("rol", usuario.getRol().name());

        return ResponseEntity.ok(response);
    }
}