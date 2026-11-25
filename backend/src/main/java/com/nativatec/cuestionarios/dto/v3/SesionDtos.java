package com.nativatec.cuestionarios.dto.v3;

import com.nativatec.cuestionarios.entity.EventoSeguridad.TipoEventoSeguridad;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import com.nativatec.cuestionarios.entity.SesionEvaluacion.EstadoSesion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class SesionDtos {

    private SesionDtos() {
    }

    public record CrearSesionRequest(
            UUID cuestionarioId,
            UUID seccionId,
            String tituloSesion,
            String slugPublico,
            Boolean permitirNuevosIngresos,
            Boolean pedirSeccion,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            Integer tiempoLimiteOverride
    ) {
    }

    public record ActualizarEstadoSesionRequest(
            EstadoSesion estado,
            Boolean permitirNuevosIngresos
    ) {
    }

    public record SesionResumenResponse(
            UUID id,
            UUID cuestionarioId,
            String cuestionarioTitulo,
            String cursoNombre,
            UUID seccionId,
            String seccionNombre,
            String tituloSesion,
            String codigoNumerico,
            String slugPublico,
            EstadoSesion estado,
            Boolean permitirNuevosIngresos,
            Boolean pedirSeccion,
            Integer tiempoLimiteMinutos,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            long totalEnProgreso,
            long totalEntregados,
            LocalDateTime createdAt
    ) {
    }

    public record MonitorIntentoItem(
            UUID intentoId,
            String apellidos,
            String nombres,
            String seccion,
            Integer numeroIntento,
            EstadoIntento estado,
            int preguntasRespondidas,
            int totalPreguntas,
            Integer totalAdvertencias,
            LocalDateTime fechaInicio,
            LocalDateTime ultimaActividad,
            LocalDateTime fechaEntrega,
            Integer duracionSegundos,
            BigDecimal notaFinal
    ) {
    }

    public record MonitorEnVivoResponse(
            UUID sesionId,
            String tituloSesion,
            String codigoNumerico,
            EstadoSesion estadoSesion,
            Boolean permitirNuevosIngresos,
            int totalPreguntas,
            long enProgreso,
            long entregados,
            long expirados,
            long anulados,
            List<MonitorIntentoItem> alumnos
    ) {
    }

    public record ActaFilaResponse(
            UUID intentoId,
            String apellidos,
            String nombres,
            String seccion,
            Integer numeroIntento,
            EstadoIntento estado,
            BigDecimal puntajeObtenido,
            BigDecimal puntajeMaximo,
            BigDecimal notaFinal,
            BigDecimal escalaNota,
            Boolean aprobado,
            Boolean requiereRevisionManual,
            Boolean notaEditadaManual,
            Integer duracionSegundos,
            Integer totalAdvertencias,
            LocalDateTime fechaInicio,
            LocalDateTime fechaEntrega,
            String observacionDocente
    ) {
    }

    public record EstadisticaPreguntaSesion(
            UUID preguntaId,
            Integer orden,
            String enunciado,
            String tipo,
            long totalRespuestas,
            long respuestasCorrectas,
            double tasaAciertos
    ) {
    }

    public record ActaSesionResponse(
            UUID sesionId,
            String tituloSesion,
            String cuestionarioTitulo,
            String cursoNombre,
            String codigoNumerico,
            BigDecimal escalaNota,
            BigDecimal notaAprobatoria,
            int totalAlumnosOficiales,
            int aprobados,
            int desaprobados,
            BigDecimal promedioGeneral,
            List<ActaFilaResponse> acta,
            List<EstadisticaPreguntaSesion> analisisPreguntas
    ) {
    }

    public record EventoSeguridadItem(
            UUID id,
            TipoEventoSeguridad tipoEvento,
            String detalle,
            LocalDateTime occurredAt
    ) {
    }

    public record DetalleRespuestaDocente(
            UUID respuestaId,
            UUID preguntaId,
            Integer orden,
            String enunciado,
            String tipo,
            List<UUID> opcionesSeleccionadasIds,
            List<String> opcionesSeleccionadasTexto,
            List<String> opcionesCorrectasTexto,
            String respuestaTexto,
            Boolean esCorrecta,
            Boolean requiereRevision,
            BigDecimal puntosAsignados,
            BigDecimal puntosObtenidos
    ) {
    }

    public record DetalleIntentoDocenteResponse(
            UUID intentoId,
            String apellidos,
            String nombres,
            String seccion,
            EstadoIntento estado,
            BigDecimal puntajeObtenido,
            BigDecimal puntajeMaximo,
            BigDecimal notaFinal,
            BigDecimal escalaNota,
            Boolean aprobado,
            Integer duracionSegundos,
            Integer totalAdvertencias,
            String observacionDocente,
            List<DetalleRespuestaDocente> respuestas,
            List<EventoSeguridadItem> eventosSeguridad
    ) {
    }

    public record CalificarRespuestaManualRequest(
            UUID preguntaId,
            BigDecimal puntosObtenidos,
            Boolean esCorrecta
    ) {
    }

    public record AjustarCalificacionIntentoRequest(
            BigDecimal notaFinal,
            String observacionDocente,
            List<CalificarRespuestaManualRequest> respuestasAjustadas
    ) {
    }
}

