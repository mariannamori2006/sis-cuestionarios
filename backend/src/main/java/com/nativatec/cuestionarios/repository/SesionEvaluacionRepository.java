package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.SesionEvaluacion;
import com.nativatec.cuestionarios.entity.SesionEvaluacion.EstadoSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SesionEvaluacionRepository extends JpaRepository<SesionEvaluacion, UUID> {

    Optional<SesionEvaluacion> findByCodigoNumericoAndEstadoIn(String codigoNumerico, Collection<EstadoSesion> estados);

    Optional<SesionEvaluacion> findBySlugPublico(String slugPublico);

    boolean existsByCodigoNumericoAndEstadoIn(String codigoNumerico, Collection<EstadoSesion> estados);

    List<SesionEvaluacion> findByCuestionarioIdOrderByCreatedAtDesc(UUID cuestionarioId);

    List<SesionEvaluacion> findByDocenteIdOrderByCreatedAtDesc(UUID docenteId);
}

