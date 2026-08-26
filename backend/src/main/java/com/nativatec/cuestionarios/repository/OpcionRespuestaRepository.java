package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.OpcionRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OpcionRespuestaRepository extends JpaRepository<OpcionRespuesta, UUID>{
    
}
