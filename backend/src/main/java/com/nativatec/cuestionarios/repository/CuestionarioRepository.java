package com.nativatec.cuestionarios.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.Cuestionario;

@Repository
public interface CuestionarioRepository extends JpaRepository<Cuestionario, UUID>{
    
}
