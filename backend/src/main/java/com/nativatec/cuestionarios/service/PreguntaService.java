package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nativatec.cuestionarios.entity.Pregunta;
import com.nativatec.cuestionarios.repository.PreguntaRepository;

@Service
public class PreguntaService {

    @Autowired
    private PreguntaRepository preguntaRepository;

    // Listar todas las preguntas
    public List<Pregunta> obtenerTodas() {
        return preguntaRepository.findAll();
    }

    // Buscar pregunta por ID
    public Optional<Pregunta> obtenerPorId(UUID id) {
        return preguntaRepository.findById(id);
    }

    // Guardar o actualizar pregunta
    public Pregunta guardarPregunta(Pregunta pregunta) {
        return preguntaRepository.save(pregunta);
    }

    // Eliminar pregunta
    public void eliminarPregunta(UUID id) {
        preguntaRepository.deleteById(id);
    }

}
