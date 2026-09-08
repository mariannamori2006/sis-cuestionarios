package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.OpcionRespuesta;
import com.nativatec.cuestionarios.entity.Pregunta;
import com.nativatec.cuestionarios.repository.PreguntaRepository;
import com.nativatec.cuestionarios.service.OpcionRespuestaService;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
public class OpcionRespuestaController {

    @Autowired // conectar con el service OpcionRespuestaService
    private OpcionRespuestaService opcionRespuestaService;

    @Autowired
    private PreguntaRepository preguntaRepository;

    // Obtener todas las opciones
    @GetMapping("/opciones")
    public ResponseEntity<List<OpcionRespuesta>> obtenerTodas() {
        List<OpcionRespuesta> opciones = opcionRespuestaService.obtenerTodas();
        return ResponseEntity.ok(opciones);
    }

    // Obtener todas las opcciones por el ID de una pregunta
    // (GET:/api/opciones/pregunta/{preguntaId})
    @GetMapping("/opciones/preguntas/{preguntaId}")
    public ResponseEntity<List<OpcionRespuesta>> obtenerOpcionesPorPregunta(@PathVariable UUID preguntaId) {
        List<OpcionRespuesta> opciones = opcionRespuestaService.obtenerPorPreguntaId(preguntaId);
        return ResponseEntity.ok(opciones);
    }

    // Obtener por D (GET: /api/opciones/{id})
    @GetMapping("/opciones/{id}")
    public ResponseEntity<OpcionRespuesta> obtenerPorId(@PathVariable UUID id) {
        return opcionRespuestaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Crear una opcion vinculada a una pregunta (POST:
    // /api/preguntas/{preguntaId}/opciones)
    @PostMapping("/preguntas/{preguntaId}/opciones")
    public ResponseEntity<OpcionRespuesta> agregarOpcionPregunta(
            @PathVariable UUID preguntaId,
            @RequestBody OpcionRespuesta opcion) {

        Pregunta pregunta = preguntaRepository.findById(preguntaId)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

        opcion.setPregunta(pregunta);
        OpcionRespuesta nuevaOpcion = opcionRespuestaService.guardarOpcion(opcion);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaOpcion);

    }

    @PostMapping("/preguntas/{preguntaId}/opciones/batch")
    public ResponseEntity<List<OpcionRespuesta>> agregarMultiplesOpciones(
            @PathVariable UUID preguntaId,
            @org.springframework.web.bind.annotation.RequestBody List<OpcionRespuesta> opciones) {

        Pregunta pregunta = preguntaRepository.findById(preguntaId)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

        for (OpcionRespuesta opcion : opciones) {
            opcion.setPregunta(pregunta);
        }

        List<OpcionRespuesta> nuevasOpciones = opcionRespuestaService.guardarTodas(opciones);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevasOpciones);
    }

    // Eliminar opcion (DELETE: /api/opciones({id})
    @DeleteMapping("/opciones/{id}")
    public ResponseEntity<Void> eliminarOpcion(@PathVariable UUID id) {
        if (opcionRespuestaService.obtenerPorId(id).isPresent()) {
            opcionRespuestaService.eliminarOpcion(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
