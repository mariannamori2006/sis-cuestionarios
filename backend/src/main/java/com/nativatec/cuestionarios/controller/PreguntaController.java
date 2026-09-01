package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.Pregunta;
import com.nativatec.cuestionarios.service.PreguntaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/preguntas")
public class PreguntaController {

    @Autowired
    private PreguntaService preguntaService;

    // Obtener todas las preguntas (GET: /api/preguntas)
    @GetMapping
    public ResponseEntity<List<Pregunta>> obtenerTodas() {
        List<Pregunta> preguntas = preguntaService.obtenerTodas();
        return ResponseEntity.ok(preguntas);
    }

    // Obtener una pregunta por ID (GET: /api/preguntas/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Pregunta> obtenerPorId(@PathVariable UUID id) {
        return preguntaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Creaer una pregunta
    @PostMapping
    public ResponseEntity<Pregunta> guardarPregunta(@RequestBody Pregunta pregunta) {
        Pregunta nuevaPregunta = preguntaService.guardarPregunta(pregunta);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaPregunta);
    }

    // Eliminar pregunta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPregunta(@PathVariable UUID id) {
        if (preguntaService.obtenerPorId(id).isPresent()) {
            preguntaService.eliminarPregunta(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
