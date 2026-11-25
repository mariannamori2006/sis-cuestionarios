package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.RespuestaIntento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RespuestaIntentoRepository extends JpaRepository<RespuestaIntento, UUID> {

    List<RespuestaIntento> findByIntentoId(UUID intentoId);

    Optional<RespuestaIntento> findByIntentoIdAndPreguntaId(UUID intentoId, UUID preguntaId);

    List<RespuestaIntento> findByPreguntaId(UUID preguntaId);
}

