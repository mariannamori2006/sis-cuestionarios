package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.IntentoEvaluacion;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntentoEvaluacionRepository extends JpaRepository<IntentoEvaluacion, UUID> {

    List<IntentoEvaluacion> findBySesionIdOrderByApellidosAscNombresAscNumeroIntentoAsc(UUID sesionId);

    List<IntentoEvaluacion> findBySesionIdAndEsIntentoOficialTrueOrderByApellidosAscNombresAsc(UUID sesionId);

    List<IntentoEvaluacion> findBySesionIdAndNombreNormalizadoOrderByNumeroIntentoAsc(UUID sesionId, String nombreNormalizado);

    Optional<IntentoEvaluacion> findFirstBySesionIdAndDeviceTokenAndEstadoOrderByFechaInicioDesc(
            UUID sesionId,
            String deviceToken,
            EstadoIntento estado
    );

    long countBySesionIdAndNombreNormalizado(UUID sesionId, String nombreNormalizado);

    long countBySesionIdAndEstado(UUID sesionId, EstadoIntento estado);

    List<IntentoEvaluacion> findByCuestionarioIdAndEsIntentoOficialTrue(UUID cuestionarioId);
}

