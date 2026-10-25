package com.nativatec.cuestionarios.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.DetalleIntento;

@Repository
public interface DetalleIntentoRepository extends JpaRepository<DetalleIntento, UUID> {
    List<DetalleIntento> findByIntentoId(UUID intentoId);

    @Modifying
    @Query("UPDATE DetalleIntento d SET d.opcionSeleccionada = null WHERE d.opcionSeleccionada.id = :opcionId")
    void desvincularOpcionSeleccionada(@Param("opcionId") UUID opcionId);

    @Modifying
    @Query("UPDATE DetalleIntento d SET d.opcionSeleccionada = null WHERE d.opcionSeleccionada.id IN :opcionIds")
    void desvincularOpcionesSeleccionadas(@Param("opcionIds") List<UUID> opcionIds);

    @Modifying
    @Query("DELETE FROM DetalleIntento d WHERE d.pregunta.id = :preguntaId")
    void eliminarPorPreguntaId(@Param("preguntaId") UUID preguntaId);

    @Modifying
    @Query("DELETE FROM DetalleIntento d WHERE d.pregunta.id IN :preguntaIds")
    void eliminarPorPreguntasIds(@Param("preguntaIds") List<UUID> preguntaIds);
}
