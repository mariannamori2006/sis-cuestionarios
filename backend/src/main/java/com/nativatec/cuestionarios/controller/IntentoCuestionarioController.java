package com.nativatec.cuestionarios.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nativatec.cuestionarios.entity.DetalleIntento;
import com.nativatec.cuestionarios.entity.IntentoCuestionario;
import com.nativatec.cuestionarios.service.IntentoCuestionarioService;

@RestController
@RequestMapping("/api/intentos")
public class IntentoCuestionarioController {

    @Autowired
    private IntentoCuestionarioService intentoService;

    // Iniciar nuevo intento (POST: /api/intentos/iniciar)
    @PostMapping("/iniciar")
    public ResponseEntity<IntentoCuestionario> iniciarIntento(@RequestBody IntentoCuestionario intento) {
        IntentoCuestionario nuevoIntento = intentoService.iniciarIntento(intento);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoIntento);
    }

    // Finalizar intento y nviar respuesta a calificar (POST:
    // /api/intentos/{id}/finalizar)
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<IntentoCuestionario> finalizarIntento(
            @PathVariable UUID id,
            @RequestBody List<DetalleIntento> respuestas) {
        IntentoCuestionario intentoCalificado = intentoService.finalizarIntento(id, respuestas);
        return ResponseEntity.ok(intentoCalificado);
    }
}
