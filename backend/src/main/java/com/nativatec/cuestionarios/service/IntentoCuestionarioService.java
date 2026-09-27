package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.dto.*;
import com.nativatec.cuestionarios.entity.*;
import com.nativatec.cuestionarios.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class IntentoCuestionarioService {

    @Autowired
    private IntentoCuestionarioRepository intentoRepository;

    @Autowired
    private DetalleIntentoRepository detalleRepository;

    @Autowired
    private OpcionRespuestaRepository opcionRespuestaRepository;

    @Autowired
    private CuestionarioRepository cuestionarioRepository;

    @Autowired
    private PreguntaRepository preguntaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public IntentoCuestionario iniciarIntento(IntentoCuestionario intento) {
        if (intento.getCuestionario() != null && intento.getCuestionario().getId() != null) {
            Cuestionario cuestionarioDb = cuestionarioRepository.findById(intento.getCuestionario().getId())
                    .orElseThrow(() -> new RuntimeException("Cuestionario no encontrado"));
            intento.setCuestionario(cuestionarioDb);
        }
        return intentoRepository.save(intento);
    }

    @Transactional
    public IntentoCuestionario finalizarIntento(UUID intentoId, List<DetalleIntento> respuestas) {
        IntentoCuestionario intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new RuntimeException("Intento no encontrado"));

        int totalPreguntas = respuestas.size();
        int respuestasCorrectas = 0;

        for (DetalleIntento detalle : respuestas) {
            detalle.setIntento(intento);
            detalleRepository.save(detalle);

            if (detalle.getOpcionSeleccionada() != null) {
                OpcionRespuesta opcion = opcionRespuestaRepository.findById(detalle.getOpcionSeleccionada().getId())
                        .orElse(null);

                if (opcion != null && Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                    respuestasCorrectas++;
                }
            }
        }

        double calificacionFinal = totalPreguntas > 0 ? ((double) respuestasCorrectas / totalPreguntas) * 20 : 0.0;

        intento.setCalificacion(calificacionFinal);
        intento.setFechaFin(LocalDateTime.now());

        return intentoRepository.save(intento);
    }

    // Procesar y guardar el intento completo desde el formulario de examen del alumno
    @Transactional
    public ResultadoEvaluacionDTO procesarYGuardarIntento(ResponderCuestionarioDTO dto) {
        if (dto.getCuestionarioId() == null) {
            throw new IllegalArgumentException("El ID del cuestionario es obligatorio.");
        }

        Cuestionario cuestionario = cuestionarioRepository.findById(dto.getCuestionarioId())
                .orElseThrow(() -> new RuntimeException("Cuestionario no encontrado"));

        IntentoCuestionario intento = new IntentoCuestionario();
        intento.setCuestionario(cuestionario);
        intento.setNombreInvitado(dto.getNombreParticipante() != null ? dto.getNombreParticipante().trim() : "Anónimo");

        if (dto.getUsuarioId() != null) {
            usuarioRepository.findById(dto.getUsuarioId()).ifPresent(intento::setUsuario);
        }

        intento.setFechaInicio(LocalDateTime.now());
        intento.setFechaFin(LocalDateTime.now());

        // Calificar respuestas
        int totalPreguntas = cuestionario.getPreguntas() != null ? cuestionario.getPreguntas().size() : 0;
        int aciertos = 0;

        // Guardamos el intento primero para obtener su ID generado
        intento = intentoRepository.save(intento);

        if (dto.getRespuestas() != null && !dto.getRespuestas().isEmpty()) {
            for (ResponderCuestionarioDTO.RespuestaItemDTO item : dto.getRespuestas()) {
                DetalleIntento detalle = new DetalleIntento();
                detalle.setIntento(intento);

                if (item.getPreguntaId() != null) {
                    preguntaRepository.findById(item.getPreguntaId()).ifPresent(detalle::setPregunta);
                }

                if (item.getOpcionSeleccionadaId() != null) {
                    OpcionRespuesta opcion = opcionRespuestaRepository.findById(item.getOpcionSeleccionadaId()).orElse(null);
                    if (opcion != null) {
                        detalle.setOpcionSeleccionada(opcion);
                        if (Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                            aciertos++;
                        }
                    }
                }

                detalle.setRespuestaTexto(item.getRespuestaTexto());
                detalleRepository.save(detalle);
            }
        }

        double calificacionFinal = 0.0;
        if (totalPreguntas > 0) {
            calificacionFinal = Math.round(((double) aciertos / totalPreguntas * 20.0) * 10.0) / 10.0;
        } else if (aciertos > 0) {
            calificacionFinal = 20.0;
        }

        intento.setCalificacion(calificacionFinal);
        intentoRepository.save(intento);

        String mensaje = calificacionFinal >= 11.0
                ? String.format("¡Excelente trabajo! Obtuviste %d de %d aciertos.", aciertos, totalPreguntas)
                : String.format("Has completado el cuestionario con %d de %d aciertos. ¡Sigue practicando!", aciertos, totalPreguntas);

        String notaFormateada = String.format("%.1f / 20", calificacionFinal);

        return new ResultadoEvaluacionDTO(
                intento.getId(),
                calificacionFinal,
                notaFormateada,
                aciertos,
                totalPreguntas,
                mensaje
        );
    }

    // Obtener estadísticas globales calculadas directamente desde PostgreSQL
    public EstadisticasDashboardDTO obtenerEstadisticasGenerales() {
        Double avg = intentoRepository.obtenerPromedioGeneral();
        Double promedioCalculado = (avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0;

        Long totalCuestionarios = cuestionarioRepository.count();
        Long totalRespuestas = intentoRepository.contarTotalRespuestas();
        Long alumnosUnicos = intentoRepository.contarAlumnosUnicos();

        if (totalRespuestas == null) totalRespuestas = 0L;
        if (alumnosUnicos == null) alumnosUnicos = 0L;

        return new EstadisticasDashboardDTO(promedioCalculado, totalCuestionarios, totalRespuestas, alumnosUnicos);
    }

    // Obtener intentos por id de cuestionario
    public List<IntentoCuestionario> obtenerIntentosPorCuestionario(UUID cuestionarioId) {
        return intentoRepository.findByCuestionarioId(cuestionarioId);
    }

    // Detalles del intento
    public List<DetalleIntento> obtenerDetallesPorIntento(UUID intentoId) {
        if (!intentoRepository.existsById(intentoId)) {
            throw new RuntimeException("Intento no encontrado con ID: " + intentoId);
        }
        return detalleRepository.findByIntentoId(intentoId);
    }
}