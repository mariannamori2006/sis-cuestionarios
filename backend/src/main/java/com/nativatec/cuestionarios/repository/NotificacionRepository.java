package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, UUID> {

    List<Notificacion> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);

    List<Notificacion> findTop25ByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);

    long countByUsuarioIdAndLeidoFalse(UUID usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leido = true WHERE n.usuario.id = :usuarioId AND n.leido = false")
    void marcarTodasComoLeidas(@Param("usuarioId") UUID usuarioId);
}

