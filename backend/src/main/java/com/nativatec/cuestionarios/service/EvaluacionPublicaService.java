package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.dto.v3.EvaluacionPublicaDtos.*;
import com.nativatec.cuestionarios.entity.*;
import com.nativatec.cuestionarios.entity.EventoSeguridad.TipoEventoSeguridad;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import com.nativatec.cuestionarios.entity.Pregunta.TipoPregunta;
import com.nativatec.cuestionarios.entity.SesionEvaluacion.EstadoSesion;
import com.nativatec.cuestionarios.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EvaluacionPublicaService {

    private static final List<EstadoSesion> ESTADOS_NO_CERRADOS = List.of(
            EstadoSesion.PROGRAMADA,
            EstadoSesion.ABIERTA,
            EstadoSesion.PAUSADA
    );

    private final SesionEvaluacionRepository sesionRepository;
    private final SeccionRepository seccionRepository;
    private final IntentoEvaluacionRepository intentoRepository;
    private final RespuestaIntentoRepository respuestaRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRespuestaRepository opcionRepository;
    private final EventoSeguridadRepository eventoRepository;
    private final NotificacionRepository notificacionRepository;
    private final CalificacionV3Service calificacionService;

    public EvaluacionPublicaService(
            SesionEvaluacionRepository sesionRepository,
            SeccionRepository seccionRepository,
            IntentoEvaluacionRepository intentoRepository,
            RespuestaIntentoRepository respuestaRepository,
            PreguntaRepository preguntaRepository,
            OpcionRespuestaRepository opcionRepository,
            EventoSeguridadRepository eventoRepository,
            NotificacionRepository notificacionRepository,
            CalificacionV3Service calificacionService) {
        this.sesionRepository = sesionRepository;
        this.seccionRepository = seccionRepository;
        this.intentoRepository = intentoRepository;
        this.respuestaRepository = respuestaRepository;
        this.preguntaRepository = preguntaRepository;
        this.opcionRepository = opcionRepository;
        this.eventoRepository = eventoRepository;
        this.notificacionRepository = notificacionRepository;
        this.calificacionService = calificacionService;
    }

    @Transactional(readOnly = true)
    public ValidacionCodigoResponse validarCodigo(ValidarCodigoRequest request) {
        SesionEvaluacion sesion = buscarSesionActivaYValidarDisponibilidad(
                request != null ? request.codigoNumerico() : null,
                true
        );
        Cuestionario c = sesion.getCuestionario();

        List<SeccionDisponibleItem> seccionesDisponibles = List.of();
        if (Boolean.TRUE.equals(sesion.getPedirSeccion()) && sesion.getSeccion() == null && c.getCurso() != null) {
            seccionesDisponibles = seccionRepository
                    .findByCursoIdAndActivoTrueOrderByNombreAsc(c.getCurso().getId())
                    .stream()
                    .map(s -> new SeccionDisponibleItem(s.getId(), s.getNombre()))
                    .toList();
        }

        String docenteNombre = ((c.getCreadoPor().getNombre() != null ? c.getCreadoPor().getNombre() : "") + " " +
                (c.getCreadoPor().getApellido() != null ? c.getCreadoPor().getApellido() : "")).trim();

        return new ValidacionCodigoResponse(
                sesion.getId(),
                sesion.getCodigoNumerico(),
                sesion.getTituloSesion() != null && !sesion.getTituloSesion().isBlank() ? sesion.getTituloSesion() : c.getTitulo(),
                c.getDescripcion(),
                c.getCurso() != null ? c.getCurso().getNombre() : "General",
                docenteNombre,
                resolverTiempoLimite(sesion, c),
                c.getPreguntas() != null ? c.getPreguntas().size() : 0,
                c.getLimiteIntentos() != null ? c.getLimiteIntentos() : 1,
                Boolean.TRUE.equals(c.getModoSeguro()),
                c.getLimiteAdvertencias() != null ? c.getLimiteAdvertencias() : 3,
                Boolean.TRUE.equals(sesion.getPedirSeccion()),
                sesion.getSeccion() != null ? sesion.getSeccion().getId() : null,
                sesion.getSeccion() != null ? sesion.getSeccion().getNombre() : null,
                seccionesDisponibles
        );
    }

    @Transactional
    public IntentoIniciadoResponse iniciarIntento(IniciarIntentoRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos de ingreso inválidos.");
        }
        String nombres = request.nombres() != null ? request.nombres().trim() : "";
        String apellidos = request.apellidos() != null ? request.apellidos().trim() : "";
        if (nombres.isEmpty() || apellidos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes ingresar tus nombres y apellidos completos.");
        }

        SesionEvaluacion sesion = buscarSesionActivaYValidarDisponibilidad(request.codigoNumerico(), true);
        Cuestionario c = sesion.getCuestionario();

        String tokenDispositivo = (request.deviceToken() != null && !request.deviceToken().trim().isEmpty())
                ? request.deviceToken().trim()
                : UUID.randomUUID().toString();

        // Si el alumno recargó la página en el mismo dispositivo y tiene un intento EN_PROGRESO, lo reanuda
        Optional<IntentoEvaluacion> intentoEnProgreso = intentoRepository
                .findFirstBySesionIdAndDeviceTokenAndEstadoOrderByFechaInicioDesc(
                        sesion.getId(),
                        tokenDispositivo,
                        EstadoIntento.EN_PROGRESO
                );

        if (intentoEnProgreso.isPresent()) {
            IntentoEvaluacion existente = intentoEnProgreso.get();
            existente.setUltimaActividad(LocalDateTime.now());
            intentoRepository.save(existente);
            return construirRespuestaIntento(existente, sesion, c, true);
        }

        String nombreNormalizado = IntentoEvaluacion.normalizarNombreCompleto(apellidos, nombres);
        long intentosPrevios = intentoRepository.countBySesionIdAndNombreNormalizado(sesion.getId(), nombreNormalizado);
        int limite = c.getLimiteIntentos() != null ? c.getLimiteIntentos() : 1;
        if (limite > 0 && intentosPrevios >= limite) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya alcanzaste el límite máximo de " + limite + " intento(s) permitido(s) para esta evaluación."
            );
        }

        Seccion seccionElegida = resolverSeccionAlumno(sesion, c, request.seccionId());
        String seccionTexto = seccionElegida != null
                ? seccionElegida.getNombre()
                : (request.seccionTexto() != null && !request.seccionTexto().trim().isEmpty()
                    ? request.seccionTexto().trim()
                    : null);

        IntentoEvaluacion nuevo = new IntentoEvaluacion();
        nuevo.setSesion(sesion);
        nuevo.setCuestionario(c);
        nuevo.setSeccion(seccionElegida);
        nuevo.setNombres(nombres);
        nuevo.setApellidos(apellidos);
        nuevo.setSeccionTexto(seccionTexto);
        nuevo.setNombreNormalizado(nombreNormalizado);
        nuevo.setDeviceToken(tokenDispositivo);
        nuevo.setNumeroIntento((int) intentosPrevios + 1);
        nuevo.setEstado(EstadoIntento.EN_PROGRESO);
        nuevo.setEsIntentoOficial(false);

        BigDecimal puntajeMaximo = calcularPuntajeMaximo(c);
        nuevo.setPuntajeMaximo(puntajeMaximo);

        IntentoEvaluacion guardado = intentoRepository.save(nuevo);
        return construirRespuestaIntento(guardado, sesion, c, false);
    }

    @Transactional
    public GuardarAvanceResponse guardarAvance(UUID intentoId, GuardarAvanceRequest request) {
        IntentoEvaluacion intento = obtenerIntentoEnProgresoConToken(intentoId, request != null ? request.deviceToken() : null);
        if (request == null || request.preguntaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el identificador de la pregunta.");
        }

        guardarRespuestaInterna(intento, request);
        intento.setUltimaActividad(LocalDateTime.now());
        intentoRepository.save(intento);

        int totalRespondidas = respuestaRepository.findByIntentoId(intentoId).size();
        return new GuardarAvanceResponse(intentoId, request.preguntaId(), intento.getUltimaActividad(), totalRespondidas);
    }

    @Transactional
    public EventoSeguridadResponse registrarEventoSeguridad(UUID intentoId, RegistrarEventoSeguridadRequest request) {
        IntentoEvaluacion intento = obtenerIntentoConToken(intentoId, request != null ? request.deviceToken() : null);
        if (intento.getEstado() != EstadoIntento.EN_PROGRESO) {
            return new EventoSeguridadResponse(
                    intento.getId(),
                    intento.getTotalAdvertencias(),
                    intento.getCuestionario().getLimiteAdvertencias(),
                    intento.getEstado() == EstadoIntento.ANULADO_INFRACCION,
                    intento.getEstado()
            );
        }

        TipoEventoSeguridad tipo = (request != null && request.tipoEvento() != null)
                ? request.tipoEvento()
                : TipoEventoSeguridad.CAMBIO_PESTANA;
        String detalle = request != null ? request.detalle() : null;

        eventoRepository.save(new EventoSeguridad(intento, tipo, detalle));

        int advertencias = (intento.getTotalAdvertencias() != null ? intento.getTotalAdvertencias() : 0) + 1;
        intento.setTotalAdvertencias(advertencias);
        intento.setUltimaActividad(LocalDateTime.now());

        Cuestionario c = intento.getCuestionario();
        int limite = c.getLimiteAdvertencias() != null ? c.getLimiteAdvertencias() : 3;
        boolean anular = Boolean.TRUE.equals(c.getModoSeguro()) && advertencias >= limite;

        if (anular) {
            finalizarYCalificar(intento, EstadoIntento.ANULADO_INFRACCION);
            crearNotificacionDocente(
                    intento,
                    "MODO_SEGURO",
                    "Evaluación anulada por infracciones",
                    intento.getApellidos() + ", " + intento.getNombres() + " superó el límite de advertencias (" + advertencias + ")."
            );
        } else {
            intentoRepository.save(intento);
        }

        return new EventoSeguridadResponse(
                intento.getId(),
                advertencias,
                limite,
                anular,
                intento.getEstado()
        );
    }

    @Transactional
    public ResultadoEntregaResponse entregarIntento(UUID intentoId, EntregarIntentoRequest request) {
        IntentoEvaluacion intento = obtenerIntentoConToken(intentoId, request != null ? request.deviceToken() : null);

        // Idempotencia: si ya fue finalizado previamente, devolvemos su resultado
        if (intento.getEstado() != EstadoIntento.EN_PROGRESO) {
            return construirResultadoEntrega(intento);
        }

        if (request != null && request.respuestasPendientes() != null) {
            for (GuardarAvanceRequest pendiente : request.respuestasPendientes()) {
                if (pendiente != null && pendiente.preguntaId() != null) {
                    guardarRespuestaInterna(intento, pendiente);
                }
            }
        }

        EstadoIntento estadoFinal = (request != null && Boolean.TRUE.equals(request.expiradoPorTiempo()))
                ? EstadoIntento.EXPIRADO_TIEMPO
                : EstadoIntento.ENTREGADO;

        finalizarYCalificar(intento, estadoFinal);

        boolean hayPendientesRevision = respuestaRepository.findByIntentoId(intento.getId()).stream()
                .anyMatch(r -> Boolean.TRUE.equals(r.getRequiereRevision()));

        crearNotificacionDocente(
                intento,
                hayPendientesRevision ? "REVISION_PENDIENTE" : "ENTREGA",
                hayPendientesRevision ? "Nueva entrega con revisión manual" : "Nueva entrega registrada",
                intento.getApellidos() + ", " + intento.getNombres() + " entregó " + intento.getCuestionario().getTitulo()
        );

        return construirResultadoEntrega(intento);
    }

    private void finalizarYCalificar(IntentoEvaluacion intento, EstadoIntento estadoFinal) {
        Cuestionario c = intento.getCuestionario();
        LocalDateTime ahora = LocalDateTime.now();

        Map<UUID, RespuestaIntento> respuestasPorPregunta = respuestaRepository.findByIntentoId(intento.getId())
                .stream()
                .collect(Collectors.toMap(r -> r.getPregunta().getId(), r -> r));

        BigDecimal puntajeMaximo = BigDecimal.ZERO;
        BigDecimal puntajeObtenido = BigDecimal.ZERO;

        List<Pregunta> preguntas = c.getPreguntas() != null ? c.getPreguntas() : List.of();
        for (Pregunta p : preguntas) {
            BigDecimal puntosPregunta = BigDecimal.valueOf(p.getPuntos() != null ? p.getPuntos() : 4.0);
            puntajeMaximo = puntajeMaximo.add(puntosPregunta);

            RespuestaIntento resp = respuestasPorPregunta.get(p.getId());
            if (resp == null) {
                resp = new RespuestaIntento();
                resp.setIntento(intento);
                resp.setPregunta(p);
                resp.setPuntosAsignados(puntosPregunta);
                resp.setPuntosObtenidos(BigDecimal.ZERO);
                resp.setEsCorrecta(false);
                resp.setRequiereRevision(false);
                respuestaRepository.save(resp);
                continue;
            }

            resp.setPuntosAsignados(puntosPregunta);
            evaluarRespuestaPregunta(p, resp, puntosPregunta);
            respuestaRepository.save(resp);
            puntajeObtenido = puntajeObtenido.add(resp.getPuntosObtenidos());
        }

        BigDecimal notaFinal = calificacionService.calcularNotaFinal(puntajeObtenido, puntajeMaximo, c.getEscalaNota());
        boolean aprobado = calificacionService.esAprobado(notaFinal, c.getNotaAprobatoria());

        intento.setEstado(estadoFinal);
        intento.setFechaEntrega(ahora);
        intento.setUltimaActividad(ahora);
        if (intento.getFechaInicio() != null) {
            intento.setDuracionSegundos((int) Math.max(0, Duration.between(intento.getFechaInicio(), ahora).getSeconds()));
        }
        intento.setPuntajeMaximo(puntajeMaximo);
        intento.setPuntajeObtenido(puntajeObtenido);
        intento.setNotaFinal(notaFinal);
        intento.setAprobado(aprobado);
        intentoRepository.save(intento);

        calificacionService.recalcularIntentoOficial(c, intento.getSesion().getId(), intento.getNombreNormalizado());
    }

    private void evaluarRespuestaPregunta(Pregunta p, RespuestaIntento resp, BigDecimal puntosPregunta) {
        List<OpcionRespuesta> opcionesPregunta = p.getOpciones() != null ? p.getOpciones() : List.of();
        Set<UUID> correctasIds = opcionesPregunta.stream()
                .filter(o -> Boolean.TRUE.equals(o.getEsCorrecta()))
                .map(OpcionRespuesta::getId)
                .collect(Collectors.toSet());

        if (p.getTipo() == TipoPregunta.RESPUESTA_CORTA) {
            String texto = resp.getRespuestaTexto() != null ? resp.getRespuestaTexto().trim() : "";
            if (texto.isEmpty()) {
                resp.setEsCorrecta(false);
                resp.setRequiereRevision(false);
                resp.setPuntosObtenidos(BigDecimal.ZERO);
                return;
            }
            List<OpcionRespuesta> respuestasClave = opcionesPregunta.stream()
                    .filter(o -> Boolean.TRUE.equals(o.getEsCorrecta()) && o.getTextoOpcion() != null)
                    .toList();
            if (respuestasClave.isEmpty()) {
                resp.setEsCorrecta(null);
                resp.setRequiereRevision(true);
                resp.setPuntosObtenidos(BigDecimal.ZERO);
                return;
            }
            boolean coincide = respuestasClave.stream()
                    .anyMatch(o -> o.getTextoOpcion().trim().equalsIgnoreCase(texto));
            resp.setRequiereRevision(false);
            resp.setEsCorrecta(coincide);
            resp.setPuntosObtenidos(coincide ? puntosPregunta : BigDecimal.ZERO);
            return;
        }

        Set<UUID> seleccionadasIds = resp.getOpcionesSeleccionadas().stream()
                .map(OpcionRespuesta::getId)
                .collect(Collectors.toSet());

        boolean esCorrecta;
        if (p.getTipo() == TipoPregunta.SELECCION_MULTIPLE) {
            esCorrecta = !correctasIds.isEmpty() && seleccionadasIds.equals(correctasIds);
        } else {
            esCorrecta = seleccionadasIds.size() == 1 && correctasIds.containsAll(seleccionadasIds);
        }
        resp.setRequiereRevision(false);
        resp.setEsCorrecta(esCorrecta);
        resp.setPuntosObtenidos(esCorrecta ? puntosPregunta : BigDecimal.ZERO);
    }

    private void guardarRespuestaInterna(IntentoEvaluacion intento, GuardarAvanceRequest request) {
        Pregunta pregunta = preguntaRepository.findById(request.preguntaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada."));

        if (!pregunta.getCuestionario().getId().equals(intento.getCuestionario().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pregunta no pertenece a esta evaluación.");
        }

        RespuestaIntento resp = respuestaRepository
                .findByIntentoIdAndPreguntaId(intento.getId(), pregunta.getId())
                .orElseGet(() -> {
                    RespuestaIntento nueva = new RespuestaIntento();
                    nueva.setIntento(intento);
                    nueva.setPregunta(pregunta);
                    nueva.setPuntosAsignados(BigDecimal.valueOf(pregunta.getPuntos() != null ? pregunta.getPuntos() : 4.0));
                    return nueva;
                });

        if (pregunta.getTipo() == TipoPregunta.RESPUESTA_CORTA) {
            resp.setRespuestaTexto(request.respuestaTexto());
            resp.getOpcionesSeleccionadas().clear();
        } else {
            resp.setRespuestaTexto(null);
            List<UUID> idsSolicitados = request.opcionIds() != null ? request.opcionIds() : List.of();
            if (pregunta.getTipo() != TipoPregunta.SELECCION_MULTIPLE && idsSolicitados.size() > 1) {
                idsSolicitados = List.of(idsSolicitados.get(0));
            }
            List<OpcionRespuesta> opcionesValidas = idsSolicitados.isEmpty()
                    ? List.of()
                    : opcionRepository.findAllById(idsSolicitados).stream()
                        .filter(o -> o.getPregunta().getId().equals(pregunta.getId()))
                        .toList();
            resp.setOpcionesSeleccionadas(new ArrayList<>(opcionesValidas));
        }

        resp.setRespondidoAt(LocalDateTime.now());
        respuestaRepository.save(resp);
    }

    private SesionEvaluacion buscarSesionActivaYValidarDisponibilidad(String codigoRaw, boolean verificarNuevosIngresos) {
        String codigo = codigoRaw != null ? codigoRaw.trim() : "";
        if (codigo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresa el código numérico de la evaluación.");
        }

        SesionEvaluacion sesion = sesionRepository.findByCodigoNumericoAndEstadoIn(codigo, ESTADOS_NO_CERRADOS)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El código ingresado no corresponde a una evaluación activa."
                ));

        if (sesion.getEstado() == EstadoSesion.PAUSADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La sesión fue pausada temporalmente por el docente.");
        }
        if (sesion.getEstado() == EstadoSesion.PROGRAMADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La evaluación aún no ha sido abierta por el docente.");
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (sesion.getFechaInicio() != null && ahora.isBefore(sesion.getFechaInicio())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La evaluación todavía no inicia.");
        }
        if (sesion.getFechaFin() != null && ahora.isAfter(sesion.getFechaFin())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El tiempo de acceso para esta evaluación ya finalizó.");
        }
        if (verificarNuevosIngresos && Boolean.FALSE.equals(sesion.getPermitirNuevosIngresos())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El docente cerró el ingreso de nuevos participantes.");
        }
        return sesion;
    }

    private Seccion resolverSeccionAlumno(SesionEvaluacion sesion, Cuestionario c, UUID seccionId) {
        if (sesion.getSeccion() != null) {
            return sesion.getSeccion();
        }
        if (seccionId == null) {
            return null;
        }
        Seccion seccion = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sección seleccionada no válida."));
        if (c.getCurso() != null && !seccion.getCurso().getId().equals(c.getCurso().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La sección no pertenece al curso de esta evaluación.");
        }
        return seccion;
    }

    private IntentoEvaluacion obtenerIntentoEnProgresoConToken(UUID intentoId, String deviceToken) {
        IntentoEvaluacion intento = obtenerIntentoConToken(intentoId, deviceToken);
        if (intento.getEstado() != EstadoIntento.EN_PROGRESO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este intento ya fue finalizado.");
        }
        if (intento.getSesion().getEstado() == EstadoSesion.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La sesión fue cerrada por el docente.");
        }
        return intento;
    }

    private IntentoEvaluacion obtenerIntentoConToken(UUID intentoId, String deviceToken) {
        IntentoEvaluacion intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intento no encontrado."));
        if (intento.getDeviceToken() != null && deviceToken != null && !intento.getDeviceToken().equals(deviceToken.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El intento pertenece a otro dispositivo.");
        }
        return intento;
    }

    private IntentoIniciadoResponse construirRespuestaIntento(
            IntentoEvaluacion intento,
            SesionEvaluacion sesion,
            Cuestionario c,
            boolean reanudado) {

        List<Pregunta> preguntasBase = new ArrayList<>(c.getPreguntas() != null ? c.getPreguntas() : List.of());
        preguntasBase.sort(Comparator.comparingInt(p -> p.getOrden() != null ? p.getOrden() : 1));
        if (Boolean.TRUE.equals(c.getOrdenAleatorio())) {
            Collections.shuffle(preguntasBase, new Random(intento.getId().getMostSignificantBits()));
        }

        List<PreguntaAlumnoItem> preguntasSanitizadas = preguntasBase.stream().map(p -> {
            List<OpcionRespuesta> ops = new ArrayList<>(p.getOpciones() != null ? p.getOpciones() : List.of());
            ops.sort(Comparator.comparingInt(o -> o.getOrden() != null ? o.getOrden() : 1));
            if (Boolean.TRUE.equals(c.getOrdenOpcionesAleatorio())) {
                Collections.shuffle(ops, new Random(intento.getId().getLeastSignificantBits() ^ p.getId().getMostSignificantBits()));
            }
            List<OpcionAlumnoItem> opsAlumno = p.getTipo() == TipoPregunta.RESPUESTA_CORTA
                    ? List.of()
                    : ops.stream().map(o -> new OpcionAlumnoItem(o.getId(), o.getTextoOpcion(), o.getOrden())).toList();

            return new PreguntaAlumnoItem(
                    p.getId(),
                    p.getOrden(),
                    p.getTextoPregunta(),
                    p.getTipo(),
                    p.getPuntos(),
                    p.getImagenUrl(),
                    p.getRequerida(),
                    opsAlumno
            );
        }).toList();

        List<RespuestaGuardadaItem> guardadas = reanudado
                ? respuestaRepository.findByIntentoId(intento.getId()).stream()
                    .map(r -> new RespuestaGuardadaItem(
                            r.getPregunta().getId(),
                            r.getOpcionesSeleccionadas().stream().map(OpcionRespuesta::getId).toList(),
                            r.getRespuestaTexto()
                    ))
                    .toList()
                : List.of();

        int tiempoMin = resolverTiempoLimite(sesion, c);
        LocalDateTime fechaLimiteEntrega = tiempoMin > 0 && intento.getFechaInicio() != null
                ? intento.getFechaInicio().plusMinutes(tiempoMin)
                : sesion.getFechaFin();

        String seccionNombre = intento.getSeccion() != null
                ? intento.getSeccion().getNombre()
                : intento.getSeccionTexto();

        return new IntentoIniciadoResponse(
                intento.getId(),
                sesion.getId(),
                intento.getDeviceToken(),
                intento.getNumeroIntento(),
                reanudado,
                intento.getNombres(),
                intento.getApellidos(),
                seccionNombre,
                sesion.getTituloSesion() != null && !sesion.getTituloSesion().isBlank() ? sesion.getTituloSesion() : c.getTitulo(),
                c.getCurso() != null ? c.getCurso().getNombre() : "General",
                tiempoMin,
                Boolean.TRUE.equals(c.getModoSeguro()),
                c.getLimiteAdvertencias() != null ? c.getLimiteAdvertencias() : 3,
                intento.getTotalAdvertencias(),
                intento.getFechaInicio(),
                fechaLimiteEntrega,
                preguntasSanitizadas,
                guardadas
        );
    }

    private ResultadoEntregaResponse construirResultadoEntrega(IntentoEvaluacion intento) {
        Cuestionario c = intento.getCuestionario();
        boolean mostrarNota = !Boolean.FALSE.equals(c.getMostrarNotaAlFinal());
        boolean mostrarRetro = !Boolean.FALSE.equals(c.getMostrarRetroalimentacion());

        List<RespuestaIntento> respuestas = respuestaRepository.findByIntentoId(intento.getId());
        boolean tienePendientes = respuestas.stream().anyMatch(r -> Boolean.TRUE.equals(r.getRequiereRevision()));

        List<RetroalimentacionItem> retro = List.of();
        if (mostrarRetro) {
            retro = respuestas.stream()
                    .sorted(Comparator.comparingInt(r -> r.getPregunta().getOrden() != null ? r.getPregunta().getOrden() : 1))
                    .map(r -> {
                        Pregunta p = r.getPregunta();
                        List<String> tusOpciones = r.getOpcionesSeleccionadas().stream()
                                .map(OpcionRespuesta::getTextoOpcion)
                                .toList();
                        List<String> correctas = p.getOpciones().stream()
                                .filter(o -> Boolean.TRUE.equals(o.getEsCorrecta()))
                                .map(OpcionRespuesta::getTextoOpcion)
                                .toList();
                        return new RetroalimentacionItem(
                                p.getId(),
                                p.getOrden(),
                                p.getTextoPregunta(),
                                tusOpciones,
                                r.getRespuestaTexto(),
                                correctas,
                                r.getEsCorrecta(),
                                r.getRequiereRevision(),
                                mostrarNota ? r.getPuntosObtenidos() : null,
                                mostrarNota ? r.getPuntosAsignados() : null,
                                p.getExplicacion()
                        );
                    })
                    .toList();
        }

        String seccionNombre = intento.getSeccion() != null ? intento.getSeccion().getNombre() : intento.getSeccionTexto();

        return new ResultadoEntregaResponse(
                intento.getId(),
                intento.getEstado(),
                intento.getNombres(),
                intento.getApellidos(),
                seccionNombre,
                intento.getSesion().getTituloSesion() != null ? intento.getSesion().getTituloSesion() : c.getTitulo(),
                intento.getDuracionSegundos(),
                mostrarNota,
                mostrarRetro,
                mostrarNota ? intento.getPuntajeObtenido() : null,
                mostrarNota ? intento.getPuntajeMaximo() : null,
                mostrarNota ? intento.getNotaFinal() : null,
                mostrarNota ? c.getEscalaNota() : null,
                mostrarNota ? intento.getAprobado() : null,
                tienePendientes,
                intento.getFechaEntrega(),
                retro
        );
    }

    private BigDecimal calcularPuntajeMaximo(Cuestionario c) {
        if (c.getPreguntas() == null || c.getPreguntas().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return c.getPreguntas().stream()
                .map(p -> BigDecimal.valueOf(p.getPuntos() != null ? p.getPuntos() : 4.0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int resolverTiempoLimite(SesionEvaluacion sesion, Cuestionario c) {
        if (sesion.getTiempoLimiteOverride() != null) {
            return Math.max(0, sesion.getTiempoLimiteOverride());
        }
        return c.getTiempoLimiteMinutos() != null ? Math.max(0, c.getTiempoLimiteMinutos()) : 0;
    }

    private void crearNotificacionDocente(IntentoEvaluacion intento, String tipo, String titulo, String mensaje) {
        Usuario docente = intento.getSesion().getDocente();
        if (docente == null) return;
        Notificacion notif = new Notificacion(
                docente,
                titulo,
                mensaje,
                tipo,
                intento.getCuestionario().getId(),
                intento.getId(),
                "/sesiones/" + intento.getSesion().getId()
        );
        notif.setSesionId(intento.getSesion().getId());
        notificacionRepository.save(notif);
    }
}

