package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "intentos_evaluacion")
public class IntentoEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id", nullable = false)
    @JsonIgnoreProperties({"cuestionario", "docente", "hibernateLazyInitializer"})
    private SesionEvaluacion sesion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    @JsonIgnoreProperties({"preguntas", "creadoPor", "hibernateLazyInitializer"})
    private Cuestionario cuestionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seccion_id")
    @JsonIgnoreProperties({"curso", "hibernateLazyInitializer"})
    private Seccion seccion;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(name = "seccion_texto", length = 80)
    private String seccionTexto;

    @Column(name = "nombre_normalizado", nullable = false, length = 220)
    private String nombreNormalizado;

    @Column(name = "device_token", length = 120)
    private String deviceToken;

    @Column(name = "numero_intento", nullable = false)
    private Integer numeroIntento = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoIntento estado = EstadoIntento.EN_PROGRESO;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "ultima_actividad", nullable = false)
    private LocalDateTime ultimaActividad;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @Column(name = "duracion_segundos")
    private Integer duracionSegundos;

    @Column(name = "puntaje_obtenido", nullable = false, precision = 8, scale = 2)
    private BigDecimal puntajeObtenido = BigDecimal.ZERO;

    @Column(name = "puntaje_maximo", nullable = false, precision = 8, scale = 2)
    private BigDecimal puntajeMaximo = BigDecimal.ZERO;

    @Column(name = "nota_final", precision = 6, scale = 2)
    private BigDecimal notaFinal;

    private Boolean aprobado;

    @Column(name = "es_intento_oficial", nullable = false)
    private Boolean esIntentoOficial = true;

    @Column(name = "nota_editada_manual", nullable = false)
    private Boolean notaEditadaManual = false;

    @Column(name = "observacion_docente", columnDefinition = "TEXT")
    private String observacionDocente;

    @Column(name = "total_advertencias", nullable = false)
    private Integer totalAdvertencias = 0;

    @OneToMany(mappedBy = "intento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RespuestaIntento> respuestas = new ArrayList<>();

    @OneToMany(mappedBy = "intento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<EventoSeguridad> eventosSeguridad = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public IntentoEvaluacion() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (fechaInicio == null) fechaInicio = now;
        if (ultimaActividad == null) ultimaActividad = now;
        if (numeroIntento == null) numeroIntento = 1;
        if (estado == null) estado = EstadoIntento.EN_PROGRESO;
        if (puntajeObtenido == null) puntajeObtenido = BigDecimal.ZERO;
        if (puntajeMaximo == null) puntajeMaximo = BigDecimal.ZERO;
        if (esIntentoOficial == null) esIntentoOficial = true;
        if (notaEditadaManual == null) notaEditadaManual = false;
        if (totalAdvertencias == null) totalAdvertencias = 0;
        recalcularNombreNormalizado();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recalcularNombreNormalizado();
    }

    public void recalcularNombreNormalizado() {
        this.nombreNormalizado = normalizarNombreCompleto(this.apellidos, this.nombres);
    }

    /**
     * Normaliza "apellidos nombres" removiendo tildes, espacios múltiples y mayúsculas
     * para comparar identidad sin cuenta de forma consistente.
     */
    public static String normalizarNombreCompleto(String apellidos, String nombres) {
        String combinado = ((apellidos != null ? apellidos : "") + " " + (nombres != null ? nombres : "")).trim();
        if (combinado.isEmpty()) {
            return "";
        }
        String sinTildes = Normalizer.normalize(combinado, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return sinTildes.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public SesionEvaluacion getSesion() {
        return sesion;
    }

    public void setSesion(SesionEvaluacion sesion) {
        this.sesion = sesion;
    }

    public Cuestionario getCuestionario() {
        return cuestionario;
    }

    public void setCuestionario(Cuestionario cuestionario) {
        this.cuestionario = cuestionario;
    }

    public Seccion getSeccion() {
        return seccion;
    }

    public void setSeccion(Seccion seccion) {
        this.seccion = seccion;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getSeccionTexto() {
        return seccionTexto;
    }

    public void setSeccionTexto(String seccionTexto) {
        this.seccionTexto = seccionTexto;
    }

    public String getNombreNormalizado() {
        return nombreNormalizado;
    }

    public void setNombreNormalizado(String nombreNormalizado) {
        this.nombreNormalizado = nombreNormalizado;
    }

    public String getDeviceToken() {
        return deviceToken;
    }

    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }

    public Integer getNumeroIntento() {
        return numeroIntento;
    }

    public void setNumeroIntento(Integer numeroIntento) {
        this.numeroIntento = numeroIntento;
    }

    public EstadoIntento getEstado() {
        return estado;
    }

    public void setEstado(EstadoIntento estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getUltimaActividad() {
        return ultimaActividad;
    }

    public void setUltimaActividad(LocalDateTime ultimaActividad) {
        this.ultimaActividad = ultimaActividad;
    }

    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public Integer getDuracionSegundos() {
        return duracionSegundos;
    }

    public void setDuracionSegundos(Integer duracionSegundos) {
        this.duracionSegundos = duracionSegundos;
    }

    public BigDecimal getPuntajeObtenido() {
        return puntajeObtenido;
    }

    public void setPuntajeObtenido(BigDecimal puntajeObtenido) {
        this.puntajeObtenido = puntajeObtenido;
    }

    public BigDecimal getPuntajeMaximo() {
        return puntajeMaximo;
    }

    public void setPuntajeMaximo(BigDecimal puntajeMaximo) {
        this.puntajeMaximo = puntajeMaximo;
    }

    public BigDecimal getNotaFinal() {
        return notaFinal;
    }

    public void setNotaFinal(BigDecimal notaFinal) {
        this.notaFinal = notaFinal;
    }

    public Boolean getAprobado() {
        return aprobado;
    }

    public void setAprobado(Boolean aprobado) {
        this.aprobado = aprobado;
    }

    public Boolean getEsIntentoOficial() {
        return esIntentoOficial;
    }

    public void setEsIntentoOficial(Boolean esIntentoOficial) {
        this.esIntentoOficial = esIntentoOficial;
    }

    public Boolean getNotaEditadaManual() {
        return notaEditadaManual;
    }

    public void setNotaEditadaManual(Boolean notaEditadaManual) {
        this.notaEditadaManual = notaEditadaManual;
    }

    public String getObservacionDocente() {
        return observacionDocente;
    }

    public void setObservacionDocente(String observacionDocente) {
        this.observacionDocente = observacionDocente;
    }

    public Integer getTotalAdvertencias() {
        return totalAdvertencias;
    }

    public void setTotalAdvertencias(Integer totalAdvertencias) {
        this.totalAdvertencias = totalAdvertencias;
    }

    public List<RespuestaIntento> getRespuestas() {
        return respuestas;
    }

    public void setRespuestas(List<RespuestaIntento> respuestas) {
        this.respuestas = respuestas;
        if (respuestas != null) {
            for (RespuestaIntento r : respuestas) {
                r.setIntento(this);
            }
        }
    }

    public List<EventoSeguridad> getEventosSeguridad() {
        return eventosSeguridad;
    }

    public void setEventosSeguridad(List<EventoSeguridad> eventosSeguridad) {
        this.eventosSeguridad = eventosSeguridad;
        if (eventosSeguridad != null) {
            for (EventoSeguridad e : eventosSeguridad) {
                e.setIntento(this);
            }
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public enum EstadoIntento {
        EN_PROGRESO,
        ENTREGADO,
        EXPIRADO_TIEMPO,
        ANULADO_INFRACCION
    }
}

