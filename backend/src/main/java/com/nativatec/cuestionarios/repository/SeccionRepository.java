package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeccionRepository extends JpaRepository<Seccion, UUID> {

    List<Seccion> findByCursoIdAndActivoTrueOrderByNombreAsc(UUID cursoId);

    Optional<Seccion> findByCursoIdAndNombreIgnoreCase(UUID cursoId, String nombre);
}

