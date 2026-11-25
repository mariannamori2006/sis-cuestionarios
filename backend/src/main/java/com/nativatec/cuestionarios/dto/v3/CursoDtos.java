package com.nativatec.cuestionarios.dto.v3;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class CursoDtos {

    private CursoDtos() {
    }

    public record CrearCursoRequest(
            String nombre,
            String codigoCurso,
            String periodoAcademico,
            String colorHex,
            List<String> seccionesIniciales
    ) {
    }

    public record ActualizarCursoRequest(
            String nombre,
            String codigoCurso,
            String periodoAcademico,
            String colorHex,
            Boolean activo
    ) {
    }

    public record CrearSeccionRequest(
            String nombre
    ) {
    }

    public record SeccionResponse(
            UUID id,
            String nombre,
            Boolean activo
    ) {
    }

    public record CursoResponse(
            UUID id,
            String nombre,
            String codigoCurso,
            String periodoAcademico,
            String colorHex,
            Boolean activo,
            List<SeccionResponse> secciones,
            LocalDateTime createdAt
    ) {
    }
}

