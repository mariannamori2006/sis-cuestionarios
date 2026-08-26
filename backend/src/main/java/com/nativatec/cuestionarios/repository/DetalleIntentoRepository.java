package com.nativatec.cuestionarios.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nativatec.cuestionarios.entity.DetalleIntento;

@Repository
public interface DetalleIntentoRepository extends JpaRepository<DetalleIntento, UUID> {
    
}
