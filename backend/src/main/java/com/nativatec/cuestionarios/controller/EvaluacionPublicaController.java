package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.v3.EvaluacionPublicaDtos.*;
import com.nativatec.cuestionarios.service.EvaluacionPublicaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v3/public/evaluaciones")
@CrossOrigin(originPatterns = "*")
public class EvaluacionPublicaController {

    private final EvaluacionPublicaService evaluacionPublicaService;

    public EvaluacionPublicaController(EvaluacionPublicaService evaluacionPublicaService) {
        this.evaluacionPublicaService = evaluacionPublicaService;
    }

    /**
     * Paso 1 del alumno: tras abrir el link o QR, ingresa el código numérico de 6 dígitos.
     */
    @PostMapping("/validar-codigo")
    public ResponseEntity<ValidacionCodigoResponse> validarCodigo(@RequestBody ValidarCodigoRequest request) {
        return ResponseEntity.ok(evaluacionPublicaService.validarCodigo(request));
    }

    /**
     * Paso 2 del alumno: ingresa sus nombres y apellidos (y sección si aplica) e inicia o reanuda el intento.
     */
    @PostMapping("/iniciar-intento")
    public ResponseEntity<IntentoIniciadoResponse> iniciarIntento(@RequestBody IniciarIntentoRequest request) {
        IntentoIniciadoResponse iniciado = evaluacionPublicaService.iniciarIntento(request);
        HttpStatus status = Boolean.TRUE.equals(iniciado.reanudado()) ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(iniciado);
    }

    /**
     * Autoguardado por pregunta en servidor mientras resuelve la evaluación.
     */
    @PutMapping("/intentos/{intentoId}/avance")
    public ResponseEntity<GuardarAvanceResponse> guardarAvance(
            @PathVariable UUID intentoId,
            @RequestBody GuardarAvanceRequest request) {
        return ResponseEntity.ok(evaluacionPublicaService.guardarAvance(intentoId, request));
    }

    /**
     * Registro de eventos de modo seguro (cambio de pestaña, pérdida de foco, etc.).
     */
    @PostMapping("/intentos/{intentoId}/evento-seguridad")
    public ResponseEntity<EventoSeguridadResponse> registrarEventoSeguridad(
            @PathVariable UUID intentoId,
            @RequestBody RegistrarEventoSeguridadRequest request) {
        return ResponseEntity.ok(evaluacionPublicaService.registrarEventoSeguridad(intentoId, request));
    }

    /**
     * Paso final: entrega de la evaluación y cálculo automático de nota.
     */
    @PostMapping("/intentos/{intentoId}/entregar")
    public ResponseEntity<ResultadoEntregaResponse> entregarIntento(
            @PathVariable UUID intentoId,
            @RequestBody(required = false) EntregarIntentoRequest request) {
        return ResponseEntity.ok(evaluacionPublicaService.entregarIntento(intentoId, request));
    }
}

