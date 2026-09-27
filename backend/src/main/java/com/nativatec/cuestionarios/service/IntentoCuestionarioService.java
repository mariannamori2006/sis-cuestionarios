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

                Pregunta preguntaItem = null;
                if (item.getPreguntaId() != null) {
                    preguntaItem = preguntaRepository.findById(item.getPreguntaId()).orElse(null);
                    if (preguntaItem != null) {
                        detalle.setPregunta(preguntaItem);
                    }
                }

                if (item.getOpcionSeleccionadaId() != null) {
                    OpcionRespuesta opcion = opcionRespuestaRepository.findById(item.getOpcionSeleccionadaId()).orElse(null);
                    if (opcion != null) {
                        detalle.setOpcionSeleccionada(opcion);
                        if (Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                            aciertos++;
                        }
                    }
                } else if (item.getRespuestaTexto() != null && !item.getRespuestaTexto().trim().isEmpty()) {
                    String textoAlumno = item.getRespuestaTexto().trim();
                    detalle.setRespuestaTexto(textoAlumno);

                    if (preguntaItem != null && preguntaItem.getOpciones() != null) {
                        for (OpcionRespuesta opc : preguntaItem.getOpciones()) {
                            if (Boolean.TRUE.equals(opc.getEsCorrecta()) && opc.getTextoOpcion() != null) {
                                if (opc.getTextoOpcion().trim().equalsIgnoreCase(textoAlumno)) {
                                    aciertos++;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (item.getRespuestaTexto() != null && detalle.getRespuestaTexto() == null) {
                    detalle.setRespuestaTexto(item.getRespuestaTexto().trim());
                }

                detalleRepository.save(detalle);
            }
        }

        // Verificar si el cuestionario contiene preguntas escritas que requieran calificación manual
        boolean tienePreguntasEscritas = false;
        if (cuestionario.getPreguntas() != null) {
            for (Pregunta p : cuestionario.getPreguntas()) {
                if (p.getTipo() == Pregunta.TipoPregunta.RESPUESTA_CORTA) {
                    tienePreguntasEscritas = true;
                    break;
                }
            }
        }

        // Si contiene preguntas de respuesta escrita, la nota queda pendiente para revisión del profesor
        if (tienePreguntasEscritas) {
            intento.setCalificacion(null);
            intentoRepository.save(intento);

            return new ResultadoEvaluacionDTO(
                    intento.getId(),
                    null,
                    "Pendiente de revisión",
                    aciertos,
                    totalPreguntas,
                    "¡Tus respuestas han sido enviadas con éxito! Al incluir preguntas escritas, tu profesor revisará y calificará tu examen.",
                    true
            );
        }

        // Calificación automática cuando son únicamente preguntas cerradas (Opción múltiple / Verdadero-Falso)
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
                mensaje,
                false
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

    // Obtener información completa para el modal de auditoría
    @Transactional(readOnly = true)
    public AuditoriaCuestionarioDTO obtenerAuditoriaCuestionario(UUID cuestionarioId) {
        Cuestionario cuestionario = cuestionarioRepository.findById(cuestionarioId)
                .orElseThrow(() -> new RuntimeException("Cuestionario no encontrado con ID: " + cuestionarioId));

        // Extraer materia si está en formato "[Materia] Descripción"
        String titulo = cuestionario.getTitulo();
        String materia = "General";
        if (cuestionario.getDescripcion() != null) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("^\\[(.*?)\\]").matcher(cuestionario.getDescripcion());
            if (matcher.find()) {
                materia = matcher.group(1);
            }
        }

        List<IntentoCuestionario> intentos = intentoRepository.findByCuestionarioId(cuestionarioId);
        // Ordenar los más recientes primero
        intentos.sort((a, b) -> {
            LocalDateTime fa = a.getFechaFin() != null ? a.getFechaFin() : a.getFechaInicio();
            LocalDateTime fb = b.getFechaFin() != null ? b.getFechaFin() : b.getFechaInicio();
            if (fa == null && fb == null) return 0;
            if (fa == null) return 1;
            if (fb == null) return -1;
            return fb.compareTo(fa);
        });

        List<AuditoriaIntentoItemDTO> items = new java.util.ArrayList<>();
        double sumaNotas = 0.0;
        int notasValidas = 0;

        java.time.format.DateTimeFormatter formatoFecha = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        java.time.format.DateTimeFormatter formatoHora = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

        for (IntentoCuestionario intento : intentos) {
            String nombreAlumno = "Alumno Anónimo";
            if (intento.getUsuario() != null && intento.getUsuario().getNombre() != null && !intento.getUsuario().getNombre().trim().isEmpty()) {
                nombreAlumno = intento.getUsuario().getNombre().trim();
            } else if (intento.getNombreInvitado() != null && !intento.getNombreInvitado().trim().isEmpty()) {
                nombreAlumno = intento.getNombreInvitado().trim();
            } else if (intento.getUsuario() != null && intento.getUsuario().getEmail() != null) {
                nombreAlumno = intento.getUsuario().getEmail().split("@")[0];
            }

            // Calcular iniciales (ej. Valentina Torres -> VT)
            String iniciales = "AL";
            String[] partes = nombreAlumno.trim().split("\\s+");
            if (partes.length >= 2) {
                iniciales = (partes[0].substring(0, 1) + partes[1].substring(0, 1)).toUpperCase();
            } else if (nombreAlumno.length() >= 2) {
                iniciales = nombreAlumno.substring(0, 2).toUpperCase();
            } else if (nombreAlumno.length() == 1) {
                iniciales = nombreAlumno.toUpperCase();
            }

            LocalDateTime fechaHora = intento.getFechaFin() != null ? intento.getFechaFin() : (intento.getFechaInicio() != null ? intento.getFechaInicio() : intento.getCreatedAt());
            String strFecha = fechaHora != null ? fechaHora.format(formatoFecha) : "2026-09-27";
            String strHora = fechaHora != null ? fechaHora.format(formatoHora) : "00:00";

            Double calificacion = intento.getCalificacion();
            String notaTexto;
            if (calificacion != null) {
                sumaNotas += calificacion;
                notasValidas++;
                if (calificacion % 1 == 0) {
                    notaTexto = String.format("%.0f/20", calificacion);
                } else {
                    notaTexto = String.format("%.1f/20", calificacion);
                }
            } else {
                notaTexto = "Pendiente";
            }

            // Cargar detalles de respuestas
            List<DetalleIntento> detallesDb = detalleRepository.findByIntentoId(intento.getId());
            List<AuditoriaDetalleItemDTO> detallesDTO = new java.util.ArrayList<>();
            boolean tieneEscritas = false;

            for (DetalleIntento det : detallesDb) {
                Pregunta p = det.getPregunta();
                UUID pId = p != null ? p.getId() : null;
                String enunciado = p != null ? p.getTextoPregunta() : "Pregunta";
                String tipoPregunta = p != null && p.getTipo() != null ? p.getTipo().name() : "OPCION_MULTIPLE";
                Integer orden = p != null ? p.getOrden() : 1;
                boolean esEscrita = p != null && p.getTipo() == Pregunta.TipoPregunta.RESPUESTA_CORTA;
                if (esEscrita) tieneEscritas = true;

                String respuestaAlumno = "";
                if (det.getOpcionSeleccionada() != null) {
                    respuestaAlumno = det.getOpcionSeleccionada().getTextoOpcion();
                } else if (det.getRespuestaTexto() != null) {
                    respuestaAlumno = det.getRespuestaTexto();
                }

                String respuestaCorrecta = "";
                Boolean esCorrecta = null;

                if (p != null && p.getOpciones() != null) {
                    for (OpcionRespuesta opc : p.getOpciones()) {
                        if (Boolean.TRUE.equals(opc.getEsCorrecta())) {
                            respuestaCorrecta = opc.getTextoOpcion();
                            break;
                        }
                    }
                }

                if (det.getOpcionSeleccionada() != null) {
                    esCorrecta = Boolean.TRUE.equals(det.getOpcionSeleccionada().getEsCorrecta());
                } else if (esEscrita) {
                    esCorrecta = null; // Requiere revisión del profesor
                } else if (!respuestaCorrecta.isEmpty()) {
                    esCorrecta = respuestaCorrecta.equalsIgnoreCase(respuestaAlumno.trim());
                }

                detallesDTO.add(new AuditoriaDetalleItemDTO(
                        pId, enunciado, tipoPregunta, orden, respuestaAlumno, respuestaCorrecta, esCorrecta, esEscrita
                ));
            }

            items.add(new AuditoriaIntentoItemDTO(
                    intento.getId(),
                    nombreAlumno,
                    iniciales,
                    calificacion,
                    notaTexto,
                    strFecha,
                    strHora,
                    tieneEscritas,
                    detallesDTO
            ));
        }

        double promedio = notasValidas > 0 ? Math.round((sumaNotas / notasValidas) * 10.0) / 10.0 : 0.0;

        return new AuditoriaCuestionarioDTO(
                cuestionario.getId(),
                titulo,
                materia,
                intentos.size(),
                promedio,
                items
        );
    }

    // Calificar manualmente un intento (asignar nota desde la auditoría)
    @Transactional
    public IntentoCuestionario calificarManualmente(UUID intentoId, Double calificacion) {
        IntentoCuestionario intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new RuntimeException("Intento no encontrado con ID: " + intentoId));
        if (calificacion != null) {
            double notaAcotada = Math.max(0.0, Math.min(20.0, Math.round(calificacion * 10.0) / 10.0));
            intento.setCalificacion(notaAcotada);
        } else {
            intento.setCalificacion(null);
        }
        intento.setUpdatedAt(LocalDateTime.now());
        return intentoRepository.save(intento);
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