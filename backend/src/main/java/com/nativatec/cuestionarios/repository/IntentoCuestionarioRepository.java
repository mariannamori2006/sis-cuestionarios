package com.nativatec.cuestionarios.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.IntentoCuestionario;

@Repository
public interface IntentoCuestionarioRepository extends JpaRepository<IntentoCuestionario, UUID> {
    
}
