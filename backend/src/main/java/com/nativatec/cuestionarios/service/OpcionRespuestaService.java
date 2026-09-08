package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nativatec.cuestionarios.entity.OpcionRespuesta;
import com.nativatec.cuestionarios.entity.Pregunta;
import com.nativatec.cuestionarios.repository.OpcionRespuestaRepository;
import com.nativatec.cuestionarios.repository.PreguntaRepository;

@Service
public class OpcionRespuestaService {

    @Autowired
    private OpcionRespuestaRepository opcionRespuestaRepository;

    @Autowired
    private PreguntaRepository preguntaRepository;

    // Listar todas las opciones
    public List<OpcionRespuesta> obtenerTodas() {
        return opcionRespuestaRepository.findAll();
    }

    // Listar las opciones de una pregunta
    public List<OpcionRespuesta> obtenerPorPreguntaId(UUID preguntaId) {
        return opcionRespuestaRepository.findByPreguntaId(preguntaId);
    }

    // Buscar opcion por ID
    public Optional<OpcionRespuesta> obtenerPorId(UUID id) {
        return opcionRespuestaRepository.findById(id);
    }

    // Guardar o actualizar una opcion
    public OpcionRespuesta guardarOpcion(OpcionRespuesta opcion) {
        if (opcion.getPregunta() != null && opcion.getPregunta().getId() != null) {
            Pregunta pregunta = preguntaRepository.findById(opcion.getPregunta().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Pregunta no encontrada con ID: " + opcion.getPregunta().getId()));
            opcion.setPregunta(pregunta);
        }
        return opcionRespuestaRepository.save(opcion);
    }

    // Guardar multipes opciones a la vez
    public List<OpcionRespuesta> guardarTodas(List<OpcionRespuesta> opciones) {
        for (OpcionRespuesta opcion : opciones) {
            if (opcion.getPregunta() != null && opcion.getPregunta().getId() != null) {
                Pregunta pregunta = preguntaRepository.findById(opcion.getPregunta().getId())
                        .orElseThrow(() -> new RuntimeException(
                                "Pregunta no encontrada con ID: " + opcion.getPregunta().getId()));
                opcion.setPregunta(pregunta);
            }
        }
        return opcionRespuestaRepository.saveAll(opciones);
    }

    // Eliminar una opcion
    public void eliminarOpcion(UUID id) {
        opcionRespuestaRepository.deleteById(id);
    }
}