package com.nativatec.cuestionarios.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.IntentoCuestionario;

@Repository
public interface IntentoCuestionarioRepository extends JpaRepository<IntentoCuestionario, UUID> {

    List<IntentoCuestionario> findByCuestionarioId(UUID cuestionarioId);

    @Query("SELECT AVG(i.calificacion) FROM IntentoCuestionario i WHERE i.calificacion IS NOT NULL")
    Double obtenerPromedioGeneral();

    @Query("SELECT COUNT(i) FROM IntentoCuestionario i")
    Long contarTotalRespuestas();

    @Query("SELECT COUNT(DISTINCT COALESCE(i.usuario.email, i.nombreInvitado)) FROM IntentoCuestionario i WHERE (i.usuario IS NOT NULL OR (i.nombreInvitado IS NOT NULL AND TRIM(i.nombreInvitado) <> ''))")
    Long contarAlumnosUnicos();

    @Query("SELECT AVG(i.calificacion) FROM IntentoCuestionario i WHERE i.cuestionario.id = :cuestionarioId AND i.calificacion IS NOT NULL")
    Double obtenerPromedioPorCuestionario(@Param("cuestionarioId") UUID cuestionarioId);

    @Query("SELECT COUNT(i) FROM IntentoCuestionario i WHERE i.cuestionario.id = :cuestionarioId")
    Long contarRespuestasPorCuestionario(@Param("cuestionarioId") UUID cuestionarioId);

    @Query("SELECT COUNT(DISTINCT COALESCE(i.usuario.email, i.nombreInvitado)) FROM IntentoCuestionario i WHERE i.cuestionario.id = :cuestionarioId AND (i.usuario IS NOT NULL OR (i.nombreInvitado IS NOT NULL AND TRIM(i.nombreInvitado) <> ''))")
    Long contarAlumnosUnicosPorCuestionario(@Param("cuestionarioId") UUID cuestionarioId);
}


