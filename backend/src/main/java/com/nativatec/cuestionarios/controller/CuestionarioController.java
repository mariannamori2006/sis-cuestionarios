package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.service.CuestionarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cuestionarios")
public class CuestionarioController {

    @Autowired
    private CuestionarioService cuestionarioService;

    // 1. Obtener todos los cuestionarios (GET: /api/cuestionarios)
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

    // 3. Crear un cuestionario (POST: /api/cuestionarios)
    @PostMapping
    public ResponseEntity<Cuestionario> guardarCuestionario(@RequestBody Cuestionario cuestionario) {
        Cuestionario nuevoCuestionario = cuestionarioService.guardarCuestionario(cuestionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCuestionario);
    }

    // 4. Eliminar un cuestionario (DELETE: /api/cuestionarios/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCuestionario(@PathVariable UUID id) {
        if (cuestionarioService.obtenerPorId(id).isPresent()) {
            cuestionarioService.eliminarCuestionario(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}