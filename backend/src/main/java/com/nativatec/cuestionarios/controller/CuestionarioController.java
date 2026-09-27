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
@CrossOrigin(origins = "http://localhost:5173")
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

    // 2.1 Obtener cuestionario por código de acceso o ID para que los alumnos puedan resolverlo
    @GetMapping("/resolver/{param}")
    public ResponseEntity<Cuestionario> obtenerParaResolver(@PathVariable String param) {
        if (param == null || param.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        String valor = param.trim();

        // 1. Buscar primero por código de acceso
        java.util.Optional<Cuestionario> porCodigo = cuestionarioService.obtenerPorCodigoAcceso(valor.toUpperCase());
        if (porCodigo.isPresent()) {
            return ResponseEntity.ok(porCodigo.get());
        }

        // 2. Si no, intentar buscar por UUID
        try {
            UUID uuid = UUID.fromString(valor);
            return cuestionarioService.obtenerPorId(uuid)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 2.2 Obtener cuestionario por código de acceso explícito
    @GetMapping("/codigo/{codigoAcceso}")
    public ResponseEntity<Cuestionario> obtenerPorCodigoAcceso(@PathVariable String codigoAcceso) {
        return cuestionarioService.obtenerPorCodigoAcceso(codigoAcceso.toUpperCase().trim())
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
        if (userDetails != null) {
            cuestionario.setCreadoPor(userDetails.getUsuario());
        }

        Cuestionario nuevoCuestionario = cuestionarioService.guardarCuestionario(cuestionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCuestionario);
    }

    // 3.1 Actualizar un cuestionario (PUT: /api/cuestionarios/{id}) - Solo PROFESOR y ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMIN')")
    public ResponseEntity<Cuestionario> actualizarCuestionario(
            @PathVariable UUID id,
            @RequestBody Cuestionario cuestionarioModificado) {

        return cuestionarioService.actualizarCuestionario(id, cuestionarioModificado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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
