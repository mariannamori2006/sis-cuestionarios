package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.repository.CuestionarioRepository;

@Service
public class CuestionarioService {

    @Autowired
    private CuestionarioRepository cuestionarioRepository;

    // Listar todos los cuestionarios
    public List<Cuestionario> obtenerTodos() {
        return cuestionarioRepository.findAll();
    }

    // Buscar cuestionario por id
    public Optional<Cuestionario> obtenerPorId(UUID id) {
        return cuestionarioRepository.findById(id);
    }

    // Crear o actualizar un cuestionario
    public Cuestionario guardarCuestionario(Cuestionario cuestionario) {
        return cuestionarioRepository.save(cuestionario);
    }

    // Eliminar cuestinario
    public void eliminarCuestionario(UUID id) {
        cuestionarioRepository.deleteById(id);
    }

}
