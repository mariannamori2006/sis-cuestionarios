package com.nativatec.cuestionarios.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nativatec.cuestionarios.dto.EstadisticasDashboardDTO;
import com.nativatec.cuestionarios.dto.ResponderCuestionarioDTO;
import com.nativatec.cuestionarios.dto.ResultadoEvaluacionDTO;
import com.nativatec.cuestionarios.entity.DetalleIntento;
import com.nativatec.cuestionarios.entity.IntentoCuestionario;
import com.nativatec.cuestionarios.service.IntentoCuestionarioService;

@RestController
@RequestMapping("/api/intentos")
@CrossOrigin(origins = "http://localhost:5173")
public class IntentoCuestionarioController {

    @Autowired
    private IntentoCuestionarioService intentoService;

    // Obtener estadísticas globales calculadas desde la base de datos (GET: /api/intentos/estadisticas)
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasDashboardDTO> obtenerEstadisticasGenerales() {
        EstadisticasDashboardDTO estadisticas = intentoService.obtenerEstadisticasGenerales();
        return ResponseEntity.ok(estadisticas);
    }

    // Responder y guardar evaluación completa desde el portal de alumnos (POST: /api/intentos/responder)
    @PostMapping("/responder")
    public ResponseEntity<ResultadoEvaluacionDTO> responderCuestionario(@RequestBody ResponderCuestionarioDTO dto) {
        ResultadoEvaluacionDTO resultado = intentoService.procesarYGuardarIntento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    // Iniciar nuevo intento (POST: /api/intentos)
    @PostMapping
    public ResponseEntity<IntentoCuestionario> iniciarIntento(@RequestBody IntentoCuestionario intento) {
        IntentoCuestionario nuevoIntento = intentoService.iniciarIntento(intento);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoIntento);
    }

    // Finalizar intento y enviar respuesta a calificar (POST: /api/intentos/{intentoId}/finalizar)
    @PostMapping("/{intentoId}/finalizar")
    public ResponseEntity<IntentoCuestionario> finalizarIntento(
            @PathVariable UUID intentoId,
            @RequestBody List<DetalleIntento> respuestas) {
        IntentoCuestionario intentoCalificado = intentoService.finalizarIntento(intentoId, respuestas);
        return ResponseEntity.ok(intentoCalificado);
    }

    // Listar todos los intentos de un cuestionario (GET: /api/intentos/cuestionarios/{cuestionarioId})
    @GetMapping("/cuestionarios/{cuestionarioId}")
    public ResponseEntity<List<IntentoCuestionario>> obtenerIntentosPorCuestionario(@PathVariable UUID cuestionarioId) {
        List<IntentoCuestionario> intentos = intentoService.obtenerIntentosPorCuestionario(cuestionarioId);
        return ResponseEntity.ok(intentos);
    }

    // Obtener detalles del intento (GET: /api/intentos/{intentoId}/detalles)
    @GetMapping("/{intentoId}/detalles")
    public ResponseEntity<List<DetalleIntento>> obtenerDetallesIntento(@PathVariable UUID intentoId) {
        List<DetalleIntento> detalles = intentoService.obtenerDetallesPorIntento(intentoId);
        return ResponseEntity.ok(detalles);
    }
}
