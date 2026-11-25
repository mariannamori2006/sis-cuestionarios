package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.EventoSeguridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventoSeguridadRepository extends JpaRepository<EventoSeguridad, UUID> {

    List<EventoSeguridad> findByIntentoIdOrderByOccurredAtAsc(UUID intentoId);

    long countByIntentoId(UUID intentoId);
}

