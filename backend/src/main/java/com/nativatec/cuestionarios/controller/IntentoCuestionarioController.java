package com.nativatec.cuestionarios.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.nativatec.cuestionarios.dto.EstadoDisponibilidadDTO;
import com.nativatec.cuestionarios.dto.EstadisticasDashboardDTO;
import com.nativatec.cuestionarios.dto.ResponderCuestionarioDTO;
import com.nativatec.cuestionarios.dto.ResultadoEvaluacionDTO;
import com.nativatec.cuestionarios.entity.DetalleIntento;
import com.nativatec.cuestionarios.entity.IntentoCuestionario;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.IntentoCuestionarioService;

@RestController
@RequestMapping("/api/intentos")
@CrossOrigin(origins = "http://localhost:5173")
public class IntentoCuestionarioController {

    @Autowired
    private IntentoCuestionarioService intentoService;

    // Obtener estadísticas calculadas desde la base de datos (GET: /api/intentos/estadisticas) - Filtrado por profesor
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasDashboardDTO> obtenerEstadisticasGenerales(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUsuario() != null && userDetails.getUsuario().getRol() == Usuario.RolUsuario.PROFESOR) {
            return ResponseEntity.ok(intentoService.obtenerEstadisticasPorProfesor(userDetails.getUsuario().getId()));
        }
        EstadisticasDashboardDTO estadisticas = intentoService.obtenerEstadisticasGenerales();
        return ResponseEntity.ok(estadisticas);
    }

    // Obtener estadísticas detalladas con distribución y resumen (GET: /api/intentos/estadisticas-detalladas) - Filtrado por profesor
    @GetMapping("/estadisticas-detalladas")
    public ResponseEntity<com.nativatec.cuestionarios.dto.EstadisticasDetalladasDTO> obtenerEstadisticasDetalladas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUsuario() != null && userDetails.getUsuario().getRol() == Usuario.RolUsuario.PROFESOR) {
            return ResponseEntity.ok(intentoService.obtenerEstadisticasDetalladasPorProfesor(userDetails.getUsuario().getId()));
        }
        com.nativatec.cuestionarios.dto.EstadisticasDetalladasDTO detalladas = intentoService.obtenerEstadisticasDetalladas();
        return ResponseEntity.ok(detalladas);
    }

    // Obtener actividad reciente para el panel principal (GET: /api/intentos/recientes) - Filtrado por profesor
    @GetMapping("/recientes")
    public ResponseEntity<List<com.nativatec.cuestionarios.dto.ActividadRecienteDTO>> obtenerActividadReciente(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUsuario() != null && userDetails.getUsuario().getRol() == Usuario.RolUsuario.PROFESOR) {
            return ResponseEntity.ok(intentoService.obtenerActividadRecientePorProfesor(userDetails.getUsuario().getId()));
        }
        List<com.nativatec.cuestionarios.dto.ActividadRecienteDTO> recientes = intentoService.obtenerActividadReciente();
        return ResponseEntity.ok(recientes);
    }

    // Verificar disponibilidad por fechas y límites de intentos (GET: /api/intentos/disponibilidad/{cuestionarioId})
    @GetMapping("/disponibilidad/{cuestionarioId}")
    public ResponseEntity<EstadoDisponibilidadDTO> verificarDisponibilidad(
            @PathVariable UUID cuestionarioId,
            @RequestParam(required = false) String participante) {
        EstadoDisponibilidadDTO disponibilidad = intentoService.verificarDisponibilidad(cuestionarioId, participante);
        return ResponseEntity.ok(disponibilidad);
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

    // Auditoría de resultados del cuestionario con datos completos (GET: /api/intentos/auditoria/{cuestionarioId})
    @GetMapping("/auditoria/{cuestionarioId}")
    public ResponseEntity<com.nativatec.cuestionarios.dto.AuditoriaCuestionarioDTO> obtenerAuditoria(@PathVariable UUID cuestionarioId) {
        com.nativatec.cuestionarios.dto.AuditoriaCuestionarioDTO auditoria = intentoService.obtenerAuditoriaCuestionario(cuestionarioId);
        return ResponseEntity.ok(auditoria);
    }

    // Rendimiento y tasa de aciertos por pregunta de un cuestionario (GET: /api/intentos/rendimiento-preguntas/{cuestionarioId})
    @GetMapping("/rendimiento-preguntas/{cuestionarioId}")
    public ResponseEntity<List<com.nativatec.cuestionarios.dto.RendimientoPreguntaDTO>> obtenerRendimientoPreguntasPorCuestionario(
            @PathVariable UUID cuestionarioId) {
        List<com.nativatec.cuestionarios.dto.RendimientoPreguntaDTO> rendimiento = intentoService.obtenerRendimientoPreguntasPorCuestionario(cuestionarioId);
        return ResponseEntity.ok(rendimiento);
    }

    // Calificar o actualizar nota de un intento (PUT: /api/intentos/{intentoId}/calificar)
    @PutMapping("/{intentoId}/calificar")
    public ResponseEntity<IntentoCuestionario> calificarIntento(
            @PathVariable UUID intentoId,
            @RequestBody com.nativatec.cuestionarios.dto.CalificarIntentoDTO dto) {
        IntentoCuestionario intentoActualizado = intentoService.calificarManualmente(intentoId, dto.getCalificacion());
        return ResponseEntity.ok(intentoActualizado);
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
