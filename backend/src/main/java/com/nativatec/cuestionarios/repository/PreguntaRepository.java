package com.nativatec.cuestionarios.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.Pregunta;

@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, UUID> {
    
}
