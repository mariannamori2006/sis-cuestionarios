package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CursoRepository extends JpaRepository<Curso, UUID> {

    List<Curso> findByDocenteIdAndActivoTrueOrderByNombreAsc(UUID docenteId);

    List<Curso> findByDocenteIdOrderByCreatedAtDesc(UUID docenteId);

    boolean existsByDocenteIdAndNombreIgnoreCase(UUID docenteId, String nombre);
}

