package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.entity.Pregunta;
import com.nativatec.cuestionarios.repository.CuestionarioRepository;
import com.nativatec.cuestionarios.repository.PreguntaRepository;

@Service
public class PreguntaService {

    @Autowired
    private PreguntaRepository preguntaRepository;

    @Autowired
    private CuestionarioRepository cuestionarioRepository;

    // Listar todas las preguntas
    public List<Pregunta> obtenerTodas() {
        return preguntaRepository.findAll();
    }

    // Listar todas las preguntas de un cuestionario con su ID
    public List<Pregunta> obtenerPorCuestionarioId(UUID cuestionarioId) {
        return preguntaRepository.findByCuestionarioId(cuestionarioId);
    }

    // Buscar pregunta por ID
    public Optional<Pregunta> obtenerPorId(UUID id) {
        return preguntaRepository.findById(id);
    }

    // Guardar o actualizar pregunta
    public Pregunta guardarPregunta(Pregunta pregunta) {
        if (pregunta.getCuestionario() != null && pregunta.getCuestionario().getId() != null) {
            Cuestionario cuestionario = cuestionarioRepository.findById(pregunta.getCuestionario().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Cuestionario no encontrado con ID: " + pregunta.getCuestionario().getId()));
            pregunta.setCuestionario(cuestionario);
        }
        return preguntaRepository.save(pregunta);
    }

    // Eliminar pregunta
    public void eliminarPregunta(UUID id) {
        preguntaRepository.deleteById(id);
    }

}
