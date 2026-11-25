package com.nativatec.cuestionarios.dto.v3;

import com.nativatec.cuestionarios.entity.EventoSeguridad.TipoEventoSeguridad;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import com.nativatec.cuestionarios.entity.Pregunta.TipoPregunta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class EvaluacionPublicaDtos {

    private EvaluacionPublicaDtos() {
    }

    public record ValidarCodigoRequest(
            String codigoNumerico,
            String slugPublico
    ) {
    }

    public record SeccionDisponibleItem(
            UUID id,
            String nombre
    ) {
    }

    public record ValidacionCodigoResponse(
            UUID sesionId,
            String codigoNumerico,
            String tituloEvaluacion,
            String descripcion,
            String cursoNombre,
            String docenteNombre,
            Integer tiempoLimiteMinutos,
            Integer totalPreguntas,
            Integer limiteIntentos,
            Boolean modoSeguro,
            Integer limiteAdvertencias,
            Boolean pedirSeccion,
            UUID seccionFijaId,
            String seccionFijaNombre,
            List<SeccionDisponibleItem> seccionesDisponibles
    ) {
    }

    public record IniciarIntentoRequest(
            String codigoNumerico,
            String nombres,
            String apellidos,
            UUID seccionId,
            String seccionTexto,
            String deviceToken
    ) {
    }

    public record OpcionAlumnoItem(
            UUID id,
            String texto,
            Integer orden
    ) {
    }

    public record PreguntaAlumnoItem(
            UUID id,
            Integer orden,
            String enunciado,
            TipoPregunta tipo,
            Double puntos,
            String imagenUrl,
            Boolean requerida,
            List<OpcionAlumnoItem> opciones
    ) {
    }

    public record RespuestaGuardadaItem(
            UUID preguntaId,
            List<UUID> opcionIds,
            String respuestaTexto
    ) {
    }

    public record IntentoIniciadoResponse(
            UUID intentoId,
            UUID sesionId,
            String deviceToken,
            Integer numeroIntento,
            Boolean reanudado,
            String nombres,
            String apellidos,
            String seccion,
            String tituloEvaluacion,
            String cursoNombre,
            Integer tiempoLimiteMinutos,
            Boolean modoSeguro,
            Integer limiteAdvertencias,
            Integer advertenciasActuales,
            LocalDateTime fechaInicio,
            LocalDateTime fechaLimiteEntrega,
            List<PreguntaAlumnoItem> preguntas,
            List<RespuestaGuardadaItem> respuestasGuardadas
    ) {
    }

    public record GuardarAvanceRequest(
            String deviceToken,
            UUID preguntaId,
            List<UUID> opcionIds,
            String respuestaTexto
    ) {
    }

    public record GuardarAvanceResponse(
            UUID intentoId,
            UUID preguntaId,
            LocalDateTime ultimaActividad,
            int totalRespondidas
    ) {
    }

    public record RegistrarEventoSeguridadRequest(
            String deviceToken,
            TipoEventoSeguridad tipoEvento,
            String detalle
    ) {
    }

    public record EventoSeguridadResponse(
            UUID intentoId,
            Integer totalAdvertencias,
            Integer limiteAdvertencias,
            Boolean intentoAnulado,
            EstadoIntento estadoIntento
    ) {
    }

    public record EntregarIntentoRequest(
            String deviceToken,
            Boolean expiradoPorTiempo,
            List<GuardarAvanceRequest> respuestasPendientes
    ) {
    }

    public record RetroalimentacionItem(
            UUID preguntaId,
            Integer orden,
            String enunciado,
            List<String> tusRespuestas,
            String tuRespuestaTexto,
            List<String> respuestasCorrectas,
            Boolean esCorrecta,
            Boolean requiereRevision,
            BigDecimal puntosObtenidos,
            BigDecimal puntosAsignados,
            String explicacion
    ) {
    }

    public record ResultadoEntregaResponse(
            UUID intentoId,
            EstadoIntento estado,
            String nombres,
            String apellidos,
            String seccion,
            String tituloEvaluacion,
            Integer duracionSegundos,
            Boolean mostrarNota,
            Boolean mostrarRetroalimentacion,
            BigDecimal puntajeObtenido,
            BigDecimal puntajeMaximo,
            BigDecimal notaFinal,
            BigDecimal escalaNota,
            Boolean aprobado,
            Boolean tienePendientesRevision,
            LocalDateTime fechaEntrega,
            List<RetroalimentacionItem> retroalimentacion
    ) {
    }
}

