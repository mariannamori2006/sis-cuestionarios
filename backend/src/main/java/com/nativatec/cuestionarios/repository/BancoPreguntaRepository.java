package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.BancoPregunta;
import com.nativatec.cuestionarios.entity.DificultadPregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BancoPreguntaRepository extends JpaRepository<BancoPregunta, UUID> {

    List<BancoPregunta> findByCreadoPorIdOrderByCreatedAtDesc(UUID creadoPorId);

    @Query("SELECT b FROM BancoPregunta b WHERE " +
           "(:profesorId IS NULL OR b.creadoPor.id = :profesorId) AND " +
           "(:materia IS NULL OR :materia = '' OR LOWER(b.materia) = LOWER(:materia)) AND " +
           "(:dificultad IS NULL OR b.dificultad = :dificultad) AND " +
           "(:busqueda IS NULL OR :busqueda = '' OR LOWER(b.textoPregunta) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(b.tema) LIKE LOWER(CONCAT('%', :busqueda, '%'))) " +
           "ORDER BY b.createdAt DESC")
    List<BancoPregunta> filtrarBanco(
            @Param("profesorId") UUID profesorId,
            @Param("materia") String materia,
            @Param("dificultad") DificultadPregunta dificultad,
            @Param("busqueda") String busqueda
    );

    @Query("SELECT DISTINCT b.materia FROM BancoPregunta b WHERE (:profesorId IS NULL OR b.creadoPor.id = :profesorId) ORDER BY b.materia ASC")
    List<String> obtenerMateriasDisponibles(@Param("profesorId") UUID profesorId);
}

