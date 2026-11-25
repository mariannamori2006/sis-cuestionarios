package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.dto.v3.SesionDtos.*;
import com.nativatec.cuestionarios.entity.*;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import com.nativatec.cuestionarios.entity.SesionEvaluacion.EstadoSesion;
import com.nativatec.cuestionarios.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.*;

@Service
public class SesionEvaluacionService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final List<EstadoSesion> ESTADOS_ACTIVOS = List.of(
            EstadoSesion.PROGRAMADA,
            EstadoSesion.ABIERTA,
            EstadoSesion.PAUSADA
    );

    private final SesionEvaluacionRepository sesionRepository;
    private final CuestionarioRepository cuestionarioRepository;
    private final SeccionRepository seccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final IntentoEvaluacionRepository intentoRepository;
    private final RespuestaIntentoRepository respuestaRepository;
    private final EventoSeguridadRepository eventoRepository;
    private final CalificacionV3Service calificacionService;

    public SesionEvaluacionService(
            SesionEvaluacionRepository sesionRepository,
            CuestionarioRepository cuestionarioRepository,
            SeccionRepository seccionRepository,
            UsuarioRepository usuarioRepository,
            IntentoEvaluacionRepository intentoRepository,
            RespuestaIntentoRepository respuestaRepository,
            EventoSeguridadRepository eventoRepository,
            CalificacionV3Service calificacionService) {
        this.sesionRepository = sesionRepository;
        this.cuestionarioRepository = cuestionarioRepository;
        this.seccionRepository = seccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.intentoRepository = intentoRepository;
        this.respuestaRepository = respuestaRepository;
        this.eventoRepository = eventoRepository;
        this.calificacionService = calificacionService;
    }

    @Transactional
    public SesionResumenResponse crearSesion(UUID docenteId, boolean esAdmin, CrearSesionRequest request) {
        if (request == null || request.cuestionarioId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el cuestionario.");
        }

        Cuestionario cuestionario = cuestionarioRepository.findById(request.cuestionarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuestionario no encontrado."));

        if (!esAdmin && !cuestionario.getCreadoPor().getId().equals(docenteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para abrir sesión de este cuestionario.");
        }

        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Docente no encontrado."));

        Seccion seccion = null;
        if (request.seccionId() != null) {
            seccion = seccionRepository.findById(request.seccionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sección no encontrada."));
            if (cuestionario.getCurso() != null && !seccion.getCurso().getId().equals(cuestionario.getCurso().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La sección no corresponde al curso del cuestionario.");
            }
        }

        String slug = request.slugPublico() != null && !request.slugPublico().trim().isEmpty()
                ? request.slugPublico().trim().toLowerCase(Locale.ROOT)
                : null;
        if (slug != null && sesionRepository.findBySlugPublico(slug).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El enlace corto indicado ya está en uso.");
        }

        SesionEvaluacion sesion = new SesionEvaluacion();
        sesion.setCuestionario(cuestionario);
        sesion.setDocente(docente);
        sesion.setSeccion(seccion);
        sesion.setTituloSesion(request.tituloSesion() != null && !request.tituloSesion().trim().isEmpty()
                ? request.tituloSesion().trim()
                : cuestionario.getTitulo() + (seccion != null ? " - " + seccion.getNombre() : ""));
        sesion.setCodigoNumerico(generarCodigoNumericoUnico());
        sesion.setSlugPublico(slug);
        sesion.setEstado(EstadoSesion.ABIERTA);
        sesion.setPermitirNuevosIngresos(request.permitirNuevosIngresos() != null ? request.permitirNuevosIngresos() : true);
        sesion.setPedirSeccion(request.pedirSeccion() != null ? request.pedirSeccion() : true);
        sesion.setFechaInicio(request.fechaInicio());
        sesion.setFechaFin(request.fechaFin());
        sesion.setTiempoLimiteOverride(request.tiempoLimiteOverride());

        return toResumen(sesionRepository.save(sesion));
    }

    @Transactional(readOnly = true)
    public List<SesionResumenResponse> listarSesionesDocente(UUID docenteId, UUID cuestionarioId) {
        List<SesionEvaluacion> sesiones = cuestionarioId != null
                ? sesionRepository.findByCuestionarioIdOrderByCreatedAtDesc(cuestionarioId)
                : sesionRepository.findByDocenteIdOrderByCreatedAtDesc(docenteId);
        return sesiones.stream().map(this::toResumen).toList();
    }

    @Transactional
    public SesionResumenResponse actualizarEstadoSesion(
            UUID sesionId,
            UUID solicitanteId,
            boolean esAdmin,
            ActualizarEstadoSesionRequest request) {
        SesionEvaluacion sesion = obtenerSesionConPermiso(sesionId, solicitanteId, esAdmin);
        if (request.estado() != null) {
            sesion.setEstado(request.estado());
            if (request.estado() == EstadoSesion.CERRADA) {
                sesion.setPermitirNuevosIngresos(false);
            }
        }
        if (request.permitirNuevosIngresos() != null) {
            sesion.setPermitirNuevosIngresos(request.permitirNuevosIngresos());
        }
        return toResumen(sesionRepository.save(sesion));
    }

    @Transactional
    public SesionResumenResponse regenerarCodigoNumerico(UUID sesionId, UUID solicitanteId, boolean esAdmin) {
        SesionEvaluacion sesion = obtenerSesionConPermiso(sesionId, solicitanteId, esAdmin);
        if (sesion.getEstado() == EstadoSesion.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes regenerar el código de una sesión cerrada.");
        }
        sesion.setCodigoNumerico(generarCodigoNumericoUnico());
        return toResumen(sesionRepository.save(sesion));
    }

    @Transactional(readOnly = true)
    public MonitorEnVivoResponse obtenerMonitorEnVivo(UUID sesionId, UUID solicitanteId, boolean esAdmin) {
        SesionEvaluacion sesion = obtenerSesionConPermiso(sesionId, solicitanteId, esAdmin);
        Cuestionario c = sesion.getCuestionario();
        int totalPreguntas = c.getPreguntas() != null ? c.getPreguntas().size() : 0;

        List<IntentoEvaluacion> intentos = intentoRepository
                .findBySesionIdOrderByApellidosAscNombresAscNumeroIntentoAsc(sesionId);

        long enProgreso = 0;
        long entregados = 0;
        long expirados = 0;
        long anulados = 0;

        List<MonitorIntentoItem> items = new ArrayList<>();
        for (IntentoEvaluacion i : intentos) {
            switch (i.getEstado()) {
                case EN_PROGRESO -> enProgreso++;
                case ENTREGADO -> entregados++;
                case EXPIRADO_TIEMPO -> expirados++;
                case ANULADO_INFRACCION -> anulados++;
            }
            int respondidas = respuestaRepository.findByIntentoId(i.getId()).size();
            String sec = i.getSeccion() != null ? i.getSeccion().getNombre() : i.getSeccionTexto();
            items.add(new MonitorIntentoItem(
                    i.getId(),
                    i.getApellidos(),
                    i.getNombres(),
                    sec,
                    i.getNumeroIntento(),
                    i.getEstado(),
                    respondidas,
                    totalPreguntas,
                    i.getTotalAdvertencias(),
                    i.getFechaInicio(),
                    i.getUltimaActividad(),
                    i.getFechaEntrega(),
                    i.getDuracionSegundos(),
                    i.getNotaFinal()
            ));
        }

        return new MonitorEnVivoResponse(
                sesion.getId(),
                sesion.getTituloSesion(),
                sesion.getCodigoNumerico(),
                sesion.getEstado(),
                sesion.getPermitirNuevosIngresos(),
                totalPreguntas,
                enProgreso,
                entregados,
                expirados,
                anulados,
                items
        );
    }

    @Transactional(readOnly = true)
    public ActaSesionResponse obtenerActaSesion(UUID sesionId, UUID solicitanteId, boolean esAdmin, boolean soloOficiales) {
        SesionEvaluacion sesion = obtenerSesionConPermiso(sesionId, solicitanteId, esAdmin);
        Cuestionario c = sesion.getCuestionario();

        List<IntentoEvaluacion> intentos = soloOficiales
                ? intentoRepository.findBySesionIdAndEsIntentoOficialTrueOrderByApellidosAscNombresAsc(sesionId)
                : intentoRepository.findBySesionIdOrderByApellidosAscNombresAscNumeroIntentoAsc(sesionId);

        List<ActaFilaResponse> filas = new ArrayList<>();
        int aprobados = 0;
        int desaprobados = 0;
        BigDecimal sumaNotas = BigDecimal.ZERO;
        int conNota = 0;

        for (IntentoEvaluacion i : intentos) {
            List<RespuestaIntento> resps = respuestaRepository.findByIntentoId(i.getId());
            boolean requiereRev = resps.stream().anyMatch(r -> Boolean.TRUE.equals(r.getRequiereRevision()));

            if (Boolean.TRUE.equals(i.getEsIntentoOficial()) && i.getNotaFinal() != null) {
                sumaNotas = sumaNotas.add(i.getNotaFinal());
                conNota++;
                if (Boolean.TRUE.equals(i.getAprobado())) aprobados++;
                else desaprobados++;
            }

            String sec = i.getSeccion() != null ? i.getSeccion().getNombre() : i.getSeccionTexto();
            filas.add(new ActaFilaResponse(
                    i.getId(),
                    i.getApellidos(),
                    i.getNombres(),
                    sec,
                    i.getNumeroIntento(),
                    i.getEstado(),
                    i.getPuntajeObtenido(),
                    i.getPuntajeMaximo(),
                    i.getNotaFinal(),
                    c.getEscalaNota(),
                    i.getAprobado(),
                    requiereRev,
                    i.getNotaEditadaManual(),
                    i.getDuracionSegundos(),
                    i.getTotalAdvertencias(),
                    i.getFechaInicio(),
                    i.getFechaEntrega(),
                    i.getObservacionDocente()
            ));
        }

        BigDecimal promedio = conNota > 0
                ? sumaNotas.divide(BigDecimal.valueOf(conNota), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        List<EstadisticaPreguntaSesion> analisisPreguntas = calcularAnalisisPreguntas(c, intentos);

        return new ActaSesionResponse(
                sesion.getId(),
                sesion.getTituloSesion(),
                c.getTitulo(),
                c.getCurso() != null ? c.getCurso().getNombre() : "General",
                sesion.getCodigoNumerico(),
                c.getEscalaNota(),
                c.getNotaAprobatoria(),
                conNota,
                aprobados,
                desaprobados,
                promedio,
                filas,
                analisisPreguntas
        );
    }

    @Transactional(readOnly = true)
    public DetalleIntentoDocenteResponse obtenerDetalleIntentoDocente(UUID intentoId, UUID solicitanteId, boolean esAdmin) {
        IntentoEvaluacion intento = obtenerIntentoConPermiso(intentoId, solicitanteId, esAdmin);
        Cuestionario c = intento.getCuestionario();

        List<DetalleRespuestaDocente> respuestas = respuestaRepository.findByIntentoId(intentoId).stream()
                .sorted(Comparator.comparingInt(r -> r.getPregunta().getOrden() != null ? r.getPregunta().getOrden() : 1))
                .map(r -> {
                    Pregunta p = r.getPregunta();
                    List<UUID> selIds = r.getOpcionesSeleccionadas().stream().map(OpcionRespuesta::getId).toList();
                    List<String> selText = r.getOpcionesSeleccionadas().stream().map(OpcionRespuesta::getTextoOpcion).toList();
                    List<String> corrText = p.getOpciones().stream()
                            .filter(o -> Boolean.TRUE.equals(o.getEsCorrecta()))
                            .map(OpcionRespuesta::getTextoOpcion)
                            .toList();
                    return new DetalleRespuestaDocente(
                            r.getId(),
                            p.getId(),
                            p.getOrden(),
                            p.getTextoPregunta(),
                            p.getTipo().name(),
                            selIds,
                            selText,
                            corrText,
                            r.getRespuestaTexto(),
                            r.getEsCorrecta(),
                            r.getRequiereRevision(),
                            r.getPuntosAsignados(),
                            r.getPuntosObtenidos()
                    );
                })
                .toList();

        List<EventoSeguridadItem> eventos = eventoRepository.findByIntentoIdOrderByOccurredAtAsc(intentoId).stream()
                .map(e -> new EventoSeguridadItem(e.getId(), e.getTipoEvento(), e.getDetalle(), e.getOccurredAt()))
                .toList();

        String sec = intento.getSeccion() != null ? intento.getSeccion().getNombre() : intento.getSeccionTexto();

        return new DetalleIntentoDocenteResponse(
                intento.getId(),
                intento.getApellidos(),
                intento.getNombres(),
                sec,
                intento.getEstado(),
                intento.getPuntajeObtenido(),
                intento.getPuntajeMaximo(),
                intento.getNotaFinal(),
                c.getEscalaNota(),
                intento.getAprobado(),
                intento.getDuracionSegundos(),
                intento.getTotalAdvertencias(),
                intento.getObservacionDocente(),
                respuestas,
                eventos
        );
    }

    @Transactional
    public DetalleIntentoDocenteResponse ajustarCalificacionIntento(
            UUID intentoId,
            UUID solicitanteId,
            boolean esAdmin,
            AjustarCalificacionIntentoRequest request) {
        IntentoEvaluacion intento = obtenerIntentoConPermiso(intentoId, solicitanteId, esAdmin);
        Cuestionario c = intento.getCuestionario();

        if (request.respuestasAjustadas() != null && !request.respuestasAjustadas().isEmpty()) {
            for (CalificarRespuestaManualRequest ajuste : request.respuestasAjustadas()) {
                if (ajuste.preguntaId() == null) continue;
                RespuestaIntento resp = respuestaRepository
                        .findByIntentoIdAndPreguntaId(intentoId, ajuste.preguntaId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Respuesta no encontrada para la pregunta."));

                if (ajuste.puntosObtenidos() != null) {
                    BigDecimal max = resp.getPuntosAsignados() != null ? resp.getPuntosAsignados() : BigDecimal.ZERO;
                    BigDecimal nuevoPuntaje = ajuste.puntosObtenidos().max(BigDecimal.ZERO);
                    if (max.compareTo(BigDecimal.ZERO) > 0 && nuevoPuntaje.compareTo(max) > 0) {
                        nuevoPuntaje = max;
                    }
                    resp.setPuntosObtenidos(nuevoPuntaje);
                }
                if (ajuste.esCorrecta() != null) {
                    resp.setEsCorrecta(ajuste.esCorrecta());
                }
                resp.setRequiereRevision(false);
                respuestaRepository.save(resp);
            }

            BigDecimal nuevoTotal = respuestaRepository.findByIntentoId(intentoId).stream()
                    .map(r -> r.getPuntosObtenidos() != null ? r.getPuntosObtenidos() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            intento.setPuntajeObtenido(nuevoTotal);
            BigDecimal nuevaNota = calificacionService.calcularNotaFinal(nuevoTotal, intento.getPuntajeMaximo(), c.getEscalaNota());
            intento.setNotaFinal(nuevaNota);
            intento.setAprobado(calificacionService.esAprobado(nuevaNota, c.getNotaAprobatoria()));
        }

        if (request.notaFinal() != null) {
            BigDecimal escala = c.getEscalaNota() != null ? c.getEscalaNota() : new BigDecimal("20.00");
            if (request.notaFinal().compareTo(BigDecimal.ZERO) < 0 || request.notaFinal().compareTo(escala) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nota debe estar entre 0 y " + escala + ".");
            }
            intento.setNotaFinal(request.notaFinal().setScale(2, RoundingMode.HALF_UP));
            intento.setAprobado(calificacionService.esAprobado(intento.getNotaFinal(), c.getNotaAprobatoria()));
            intento.setNotaEditadaManual(true);
        }

        if (request.observacionDocente() != null) {
            intento.setObservacionDocente(request.observacionDocente().trim());
        }

        intentoRepository.save(intento);
        calificacionService.recalcularIntentoOficial(c, intento.getSesion().getId(), intento.getNombreNormalizado());
        return obtenerDetalleIntentoDocente(intentoId, solicitanteId, esAdmin);
    }

    private List<EstadisticaPreguntaSesion> calcularAnalisisPreguntas(Cuestionario c, List<IntentoEvaluacion> intentos) {
        Set<UUID> oficialesIds = intentos.stream()
                .filter(i -> Boolean.TRUE.equals(i.getEsIntentoOficial()) && i.getEstado() != EstadoIntento.EN_PROGRESO)
                .map(IntentoEvaluacion::getId)
                .collect(java.util.stream.Collectors.toSet());

        List<Pregunta> preguntas = new ArrayList<>(c.getPreguntas() != null ? c.getPreguntas() : List.of());
        preguntas.sort(Comparator.comparingInt(p -> p.getOrden() != null ? p.getOrden() : 1));

        List<EstadisticaPreguntaSesion> lista = new ArrayList<>();
        for (Pregunta p : preguntas) {
            List<RespuestaIntento> resps = respuestaRepository.findByPreguntaId(p.getId()).stream()
                    .filter(r -> oficialesIds.contains(r.getIntento().getId()))
                    .toList();
            long total = resps.size();
            long correctas = resps.stream().filter(r -> Boolean.TRUE.equals(r.getEsCorrecta())).count();
            double tasa = total > 0 ? Math.round(((double) correctas / total * 100.0) * 10.0) / 10.0 : 0.0;
            lista.add(new EstadisticaPreguntaSesion(
                    p.getId(),
                    p.getOrden(),
                    p.getTextoPregunta(),
                    p.getTipo().name(),
                    total,
                    correctas,
                    tasa
            ));
        }
        return lista;
    }

    private SesionResumenResponse toResumen(SesionEvaluacion s) {
        Cuestionario c = s.getCuestionario();
        long enProgreso = intentoRepository.countBySesionIdAndEstado(s.getId(), EstadoIntento.EN_PROGRESO);
        long entregados = intentoRepository.countBySesionIdAndEstado(s.getId(), EstadoIntento.ENTREGADO)
                + intentoRepository.countBySesionIdAndEstado(s.getId(), EstadoIntento.EXPIRADO_TIEMPO)
                + intentoRepository.countBySesionIdAndEstado(s.getId(), EstadoIntento.ANULADO_INFRACCION);

        int tiempo = s.getTiempoLimiteOverride() != null
                ? s.getTiempoLimiteOverride()
                : (c.getTiempoLimiteMinutos() != null ? c.getTiempoLimiteMinutos() : 0);

        return new SesionResumenResponse(
                s.getId(),
                c.getId(),
                c.getTitulo(),
                c.getCurso() != null ? c.getCurso().getNombre() : "General",
                s.getSeccion() != null ? s.getSeccion().getId() : null,
                s.getSeccion() != null ? s.getSeccion().getNombre() : null,
                s.getTituloSesion(),
                s.getCodigoNumerico(),
                s.getSlugPublico(),
                s.getEstado(),
                s.getPermitirNuevosIngresos(),
                s.getPedirSeccion(),
                tiempo,
                s.getFechaInicio(),
                s.getFechaFin(),
                enProgreso,
                entregados,
                s.getCreatedAt()
        );
    }

    private SesionEvaluacion obtenerSesionConPermiso(UUID sesionId, UUID solicitanteId, boolean esAdmin) {
        SesionEvaluacion sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesión de evaluación no encontrada."));
        if (!esAdmin && !sesion.getDocente().getId().equals(solicitanteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para acceder a esta sesión.");
        }
        return sesion;
    }

    private IntentoEvaluacion obtenerIntentoConPermiso(UUID intentoId, UUID solicitanteId, boolean esAdmin) {
        IntentoEvaluacion intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intento no encontrado."));
        if (!esAdmin && !intento.getSesion().getDocente().getId().equals(solicitanteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para acceder a este intento.");
        }
        return intento;
    }

    private String generarCodigoNumericoUnico() {
        for (int intento = 0; intento < 30; intento++) {
            String codigo = String.valueOf(100000 + RANDOM.nextInt(900000));
            if (!sesionRepository.existsByCodigoNumericoAndEstadoIn(codigo, ESTADOS_ACTIVOS)) {
                return codigo;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar un código numérico único.");
    }
}

