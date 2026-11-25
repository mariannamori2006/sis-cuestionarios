package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sesiones_evaluacion")
public class SesionEvaluacion {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    @JsonIgnoreProperties({"preguntas", "creadoPor", "hibernateLazyInitializer"})
    private Cuestionario cuestionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "codigoVerificacion", "codigoExpiracion", "hibernateLazyInitializer"})
    private Usuario docente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seccion_id")
    @JsonIgnoreProperties({"curso", "hibernateLazyInitializer"})
    private Seccion seccion;

    @Column(name = "titulo_sesion", length = 180)
    private String tituloSesion;

    @Column(name = "codigo_numerico", nullable = false, length = 8)
    private String codigoNumerico;

    @Column(name = "slug_publico", unique = true, length = 60)
    private String slugPublico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSesion estado = EstadoSesion.ABIERTA;

    @Column(name = "permitir_nuevos_ingresos", nullable = false)
    private Boolean permitirNuevosIngresos = true;

    @Column(name = "pedir_seccion", nullable = false)
    private Boolean pedirSeccion = true;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "tiempo_limite_override")
    private Integer tiempoLimiteOverride;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SesionEvaluacion() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (estado == null) estado = EstadoSesion.ABIERTA;
        if (permitirNuevosIngresos == null) permitirNuevosIngresos = true;
        if (pedirSeccion == null) pedirSeccion = true;
        if (codigoNumerico == null || codigoNumerico.trim().isEmpty()) {
            codigoNumerico = String.valueOf(100000 + RANDOM.nextInt(900000));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Cuestionario getCuestionario() {
        return cuestionario;
    }

    public void setCuestionario(Cuestionario cuestionario) {
        this.cuestionario = cuestionario;
    }

    public Usuario getDocente() {
        return docente;
    }

    public void setDocente(Usuario docente) {
        this.docente = docente;
    }

    public Seccion getSeccion() {
        return seccion;
    }

    public void setSeccion(Seccion seccion) {
        this.seccion = seccion;
    }

    public String getTituloSesion() {
        return tituloSesion;
    }

    public void setTituloSesion(String tituloSesion) {
        this.tituloSesion = tituloSesion;
    }

    public String getCodigoNumerico() {
        return codigoNumerico;
    }

    public void setCodigoNumerico(String codigoNumerico) {
        this.codigoNumerico = codigoNumerico;
    }

    public String getSlugPublico() {
        return slugPublico;
    }

    public void setSlugPublico(String slugPublico) {
        this.slugPublico = slugPublico;
    }

    public EstadoSesion getEstado() {
        return estado;
    }

    public void setEstado(EstadoSesion estado) {
        this.estado = estado;
    }

    public Boolean getPermitirNuevosIngresos() {
        return permitirNuevosIngresos;
    }

    public void setPermitirNuevosIngresos(Boolean permitirNuevosIngresos) {
        this.permitirNuevosIngresos = permitirNuevosIngresos;
    }

    public Boolean getPedirSeccion() {
        return pedirSeccion;
    }

    public void setPedirSeccion(Boolean pedirSeccion) {
        this.pedirSeccion = pedirSeccion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Integer getTiempoLimiteOverride() {
        return tiempoLimiteOverride;
    }

    public void setTiempoLimiteOverride(Integer tiempoLimiteOverride) {
        this.tiempoLimiteOverride = tiempoLimiteOverride;
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

    public enum EstadoSesion {
        PROGRAMADA,
        ABIERTA,
        PAUSADA,
        CERRADA
    }
}

