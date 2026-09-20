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

    // Buscar cuestionario por código de acceso
    public Optional<Cuestionario> obtenerPorCodigoAcceso(String codigoAcceso) {
        return cuestionarioRepository.findByCodigoAcceso(codigoAcceso);
    }

    // Crear o actualizar un cuestionario
    public Cuestionario guardarCuestionario(Cuestionario cuestionario) {
        if (cuestionario.getPreguntas() != null) {
            int orden = 1;
            for (com.nativatec.cuestionarios.entity.Pregunta p : cuestionario.getPreguntas()) {
                p.setCuestionario(cuestionario);
                if (p.getOrden() == null) {
                    p.setOrden(orden++);
                }
                if (p.getOpciones() != null) {
                    for (com.nativatec.cuestionarios.entity.OpcionRespuesta o : p.getOpciones()) {
                        o.setPregunta(p);
                    }
                }
            }
        }
        return cuestionarioRepository.save(cuestionario);
    }

    // Eliminar cuestinario
    public void eliminarCuestionario(UUID id) {
        cuestionarioRepository.deleteById(id);
    }

}
