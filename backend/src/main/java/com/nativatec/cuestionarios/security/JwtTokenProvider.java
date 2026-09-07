package com.nativatec.cuestionarios.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Llave secreta para firmar el token
    private final SecretKey jwtSecret = io.jsonwebtoken.Jwts.SIG.HS256.key().build();

    // Tiempo de expiracion en milisegundos (24 h)
    private final int jwtExpirationMs = 86400000;

    public String generateToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();

        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(ahora)
                .expiration(fechaExpiracion)
                .signWith(jwtSecret)
                .compact();
    }

    public String obtenerEmailDelToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(jwtSecret)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validarToken(String token) {
        try {
            Jwts.parser().verifyWith(jwtSecret).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Token inválido, expirado o mal formado
            return false;
        }
    }
}
