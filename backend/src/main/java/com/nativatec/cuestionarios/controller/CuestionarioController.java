package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.security.CustomUserDetails;
import com.nativatec.cuestionarios.service.CuestionarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cuestionarios")
public class CuestionarioController {

    @Autowired
    private CuestionarioService cuestionarioService;

    // 1. Obtener todos los cuestionarios (GET: /api/cuestionarios) - Todos los
    // autenticados
    @GetMapping
    public ResponseEntity<List<Cuestionario>> obtenerTodos() {
        List<Cuestionario> cuestionarios = cuestionarioService.obtenerTodos();
        return ResponseEntity.ok(cuestionarios);
    }

    // 2. Obtener un cuestionario por ID (GET: /api/cuestionarios/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Cuestionario> obtenerPorId(@PathVariable UUID id) {
        return cuestionarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // 3. Crear un cuestionario (POST: /api/cuestionarios) - Solo PROFESOR y ADMIN
    @PostMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<Cuestionario> guardarCuestionario(
            @RequestBody Cuestionario cuestionario,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // Asignamos al usuario autenticado (Profesor o Admin) como creador
        cuestionario.setCreadoPor(userDetails.getUsuario());

        Cuestionario nuevoCuestionario = cuestionarioService.guardarCuestionario(cuestionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCuestionario);
    }

    // 4. Eliminar un cuestionario (DELETE: /api/cuestionarios/{id}) - Solo PROFESOR
    // y ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<Void> eliminarCuestionario(@PathVariable UUID id) {
        if (cuestionarioService.obtenerPorId(id).isPresent()) {
            cuestionarioService.eliminarCuestionario(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
