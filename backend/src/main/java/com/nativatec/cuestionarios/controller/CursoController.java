package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.dto.v3.CursoDtos.*;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.CursoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v3/cursos")
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasAnyRole('PROFESOR', 'DOCENTE', 'ADMIN')")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    public ResponseEntity<List<CursoResponse>> listarCursos(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "true") boolean soloActivos) {
        return ResponseEntity.ok(cursoService.listarCursosDocente(userDetails.getUsuario().getId(), soloActivos));
    }

    @PostMapping
    public ResponseEntity<CursoResponse> crearCurso(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CrearCursoRequest request) {
        CursoResponse creado = cursoService.crearCurso(userDetails.getUsuario().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{cursoId}")
    public ResponseEntity<CursoResponse> actualizarCurso(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ActualizarCursoRequest request) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        return ResponseEntity.ok(cursoService.actualizarCurso(cursoId, userDetails.getUsuario().getId(), esAdmin, request));
    }

    @PostMapping("/{cursoId}/secciones")
    public ResponseEntity<SeccionResponse> agregarSeccion(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CrearSeccionRequest request) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        SeccionResponse creada = cursoService.agregarSeccion(cursoId, userDetails.getUsuario().getId(), esAdmin, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @DeleteMapping("/{cursoId}/secciones/{seccionId}")
    public ResponseEntity<Void> desactivarSeccion(
            @PathVariable UUID cursoId,
            @PathVariable UUID seccionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean esAdmin = userDetails.getUsuario().getRol() == Usuario.RolUsuario.ADMIN;
        cursoService.desactivarSeccion(cursoId, seccionId, userDetails.getUsuario().getId(), esAdmin);
        return ResponseEntity.noContent().build();
    }
}

