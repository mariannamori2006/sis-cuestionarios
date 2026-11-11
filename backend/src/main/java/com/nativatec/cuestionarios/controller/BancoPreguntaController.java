package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.BancoPregunta;
import com.nativatec.cuestionarios.entity.DificultadPregunta;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.BancoPreguntaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banco-preguntas")
@CrossOrigin(originPatterns = "*")
public class BancoPreguntaController {

    @Autowired
    private BancoPreguntaService bancoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<List<BancoPregunta>> listar(
            @RequestParam(required = false) String materia,
            @RequestParam(required = false) DificultadPregunta dificultad,
            @RequestParam(required = false) String buscar,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID profesorId = null;
        if (userDetails != null && userDetails.getUsuario() != null && userDetails.getUsuario().getRol() == Usuario.RolUsuario.PROFESOR) {
            profesorId = userDetails.getUsuario().getId();
        }

        List<BancoPregunta> lista = bancoService.listarPreguntas(profesorId, materia, dificultad, buscar);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/materias")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<List<String>> obtenerMaterias(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID profesorId = null;
        if (userDetails != null && userDetails.getUsuario() != null && userDetails.getUsuario().getRol() == Usuario.RolUsuario.PROFESOR) {
            profesorId = userDetails.getUsuario().getId();
        }
        return ResponseEntity.ok(bancoService.obtenerMateriasDisponibles(profesorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<BancoPregunta> obtenerPorId(@PathVariable UUID id) {
        return bancoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<BancoPregunta> crear(
            @RequestBody BancoPregunta pregunta,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID profesorId = null;
        if (userDetails != null && userDetails.getUsuario() != null) {
            profesorId = userDetails.getUsuario().getId();
        }

        BancoPregunta creada = bancoService.crearPregunta(pregunta, profesorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<BancoPregunta> actualizar(
            @PathVariable UUID id,
            @RequestBody BancoPregunta pregunta,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID profesorId = null;
        if (userDetails != null && userDetails.getUsuario() != null) {
            profesorId = userDetails.getUsuario().getId();
        }

        BancoPregunta actualizada = bancoService.actualizarPregunta(id, pregunta, profesorId);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        bancoService.eliminarPregunta(id);
        return ResponseEntity.noContent().build();
    }
}

