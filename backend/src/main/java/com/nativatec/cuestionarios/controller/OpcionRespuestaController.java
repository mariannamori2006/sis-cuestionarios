package com.nativatec.cuestionarios.controller;

import com.nativatec.cuestionarios.entity.OpcionRespuesta;
import com.nativatec.cuestionarios.service.OpcionRespuestaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/opciones")
public class OpcionRespuestaController {

    @Autowired // conectar con el service OpcionRespuestaService
    private OpcionRespuestaService opcionRespuestaService;

    // Obtener todas las opciones
    @GetMapping
    public ResponseEntity<List<OpcionRespuesta>> obtenerTodas() {
        List<OpcionRespuesta> opciones = opcionRespuestaService.obtenerTodas();
        return ResponseEntity.ok(opciones);
    }

    // Obtener por D (GET: /api/opciones/{id})
    @GetMapping("/{id}")
    public ResponseEntity<OpcionRespuesta> obtenerPorId(@PathVariable UUID id) {
        return opcionRespuestaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Crear una opcion (POST: /api/opciones)
    @PostMapping
    public ResponseEntity<OpcionRespuesta> guardarOpcion(@RequestBody OpcionRespuesta opcion) {
        OpcionRespuesta nuevaOpcion = opcionRespuestaService.guardarOpcion(opcion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaOpcion);
    }

    // Eliminar opcion (DELETE: /api/opciones({id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOpcion(@PathVariable UUID id) {
        if (opcionRespuestaService.obtenerPorId(id).isPresent()) {
            opcionRespuestaService.eliminarOpcion(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
