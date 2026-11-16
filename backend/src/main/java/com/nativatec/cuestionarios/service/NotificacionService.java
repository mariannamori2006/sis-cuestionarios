package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.dto.NotificacionDTO;
import com.nativatec.cuestionarios.entity.Notificacion;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public List<NotificacionDTO> obtenerNotificacionesUsuario(UUID usuarioId) {
        return notificacionRepository.findTop25ByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(UUID usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidoFalse(usuarioId);
    }

    @Transactional
    public NotificacionDTO marcarComoLeida(UUID notificacionId, UUID usuarioId) {
        Notificacion notif = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        if (!notif.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("No tienes permiso para modificar esta notificación.");
        }

        notif.setLeido(true);
        notificacionRepository.save(notif);
        return convertirADTO(notif);
    }

    @Transactional
    public void marcarTodasComoLeidas(UUID usuarioId) {
        notificacionRepository.marcarTodasComoLeidas(usuarioId);
    }

    @Transactional
    public void eliminarNotificacion(UUID notificacionId, UUID usuarioId) {
        Notificacion notif = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        if (!notif.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("No tienes permiso para eliminar esta notificación.");
        }

        notificacionRepository.delete(notif);
    }

    @Transactional
    public Notificacion crearNotificacion(Usuario usuario, String tipo, String titulo, String mensaje, UUID cuestionarioId, UUID intentoId, String enlace) {
        if (usuario == null) return null;
        Notificacion nueva = new Notificacion(usuario, titulo, mensaje, tipo, cuestionarioId, intentoId, enlace);
        return notificacionRepository.save(nueva);
    }

    private NotificacionDTO convertirADTO(Notificacion n) {
        return new NotificacionDTO(
                n.getId(),
                n.getTitulo(),
                n.getMensaje(),
                n.getTipo(),
                n.getLeido(),
                n.getCuestionarioId(),
                n.getIntentoId(),
                n.getEnlace(),
                n.getCreatedAt()
        );
    }
}

