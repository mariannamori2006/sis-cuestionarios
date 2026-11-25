package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.v3.SesionDtos.*;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.SesionEvaluacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v3/sesiones")
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasAnyRole('PROFESOR', 'DOCENTE', 'ADMIN')")
public class SesionEvaluacionController {

    private final SesionEvaluacionService sesionService;

    public SesionEvaluacionController(SesionEvaluacionService sesionService) {
        this.sesionService = sesionService;
    }

    @GetMapping
    public ResponseEntity<List<SesionResumenResponse>> listarSesiones(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) UUID cuestionarioId) {
        return ResponseEntity.ok(sesionService.listarSesionesDocente(userDetails.getUsuario().getId(), cuestionarioId));
    }

    @PostMapping
    public ResponseEntity<SesionResumenResponse> crearSesion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CrearSesionRequest request) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        SesionResumenResponse creada = sesionService.crearSesion(userDetails.getUsuario().getId(), esAdmin, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PatchMapping("/{sesionId}/estado")
    public ResponseEntity<SesionResumenResponse> actualizarEstado(
            @PathVariable UUID sesionId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ActualizarEstadoSesionRequest request) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.actualizarEstadoSesion(sesionId, userDetails.getUsuario().getId(), esAdmin, request));
    }

    @PostMapping("/{sesionId}/regenerar-codigo")
    public ResponseEntity<SesionResumenResponse> regenerarCodigo(
            @PathVariable UUID sesionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.regenerarCodigoNumerico(sesionId, userDetails.getUsuario().getId(), esAdmin));
    }

    @GetMapping("/{sesionId}/monitor")
    public ResponseEntity<MonitorEnVivoResponse> obtenerMonitorEnVivo(
            @PathVariable UUID sesionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.obtenerMonitorEnVivo(sesionId, userDetails.getUsuario().getId(), esAdmin));
    }

    @GetMapping("/{sesionId}/acta")
    public ResponseEntity<ActaSesionResponse> obtenerActaSesion(
            @PathVariable UUID sesionId,
            @RequestParam(defaultValue = "true") boolean soloOficiales,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.obtenerActaSesion(sesionId, userDetails.getUsuario().getId(), esAdmin, soloOficiales));
    }

    @GetMapping("/intentos/{intentoId}")
    public ResponseEntity<DetalleIntentoDocenteResponse> obtenerDetalleIntento(
            @PathVariable UUID intentoId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.obtenerDetalleIntentoDocente(intentoId, userDetails.getUsuario().getId(), esAdmin));
    }

    @PutMapping("/intentos/{intentoId}/calificar")
    public ResponseEntity<DetalleIntentoDocenteResponse> ajustarCalificacionIntento(
            @PathVariable UUID intentoId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AjustarCalificacionIntentoRequest request) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(sesionService.ajustarCalificacionIntento(intentoId, userDetails.getUsuario().getId(), esAdmin, request));
    }
}

