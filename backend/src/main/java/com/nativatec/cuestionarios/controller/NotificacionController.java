package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.NotificacionDTO;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(originPatterns = "*")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    // Obtener las notificaciones del usuario autenticado (GET /api/notificaciones)
    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> obtenerMisNotificaciones(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUsuario() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<NotificacionDTO> lista = notificacionService.obtenerNotificacionesUsuario(userDetails.getUsuario().getId());
        return ResponseEntity.ok(lista);
    }

    // Obtener la cantidad de notificaciones no leídas (GET /api/notificaciones/no-leidas/count)
    @GetMapping("/no-leidas/count")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUsuario() == null) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
        long count = notificacionService.contarNoLeidas(userDetails.getUsuario().getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Marcar una notificación individual como leída (PUT /api/notificaciones/{id}/leer)
    @PutMapping("/{id}/leer")
    public ResponseEntity<NotificacionDTO> marcarComoLeida(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUsuario() == null) {
            return ResponseEntity.status(401).build();
        }
        NotificacionDTO actualizada = notificacionService.marcarComoLeida(id, userDetails.getUsuario().getId());
        return ResponseEntity.ok(actualizada);
    }

    // Marcar todas las notificaciones como leídas (PUT /api/notificaciones/marcar-todas-leidas)
    @PutMapping("/marcar-todas-leidas")
    public ResponseEntity<Map<String, String>> marcarTodasComoLeidas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUsuario() == null) {
            return ResponseEntity.status(401).build();
        }
        notificacionService.marcarTodasComoLeidas(userDetails.getUsuario().getId());
        return ResponseEntity.ok(Map.of("mensaje", "Todas las notificaciones fueron marcadas como leídas."));
    }

    // Eliminar una notificación (DELETE /api/notificaciones/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarNotificacion(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUsuario() == null) {
            return ResponseEntity.status(401).build();
        }
        notificacionService.eliminarNotificacion(id, userDetails.getUsuario().getId());
        return ResponseEntity.ok(Map.of("mensaje", "Notificación eliminada exitosamente."));
    }
}

