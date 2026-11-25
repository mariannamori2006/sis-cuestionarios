package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cuestionarios")
public class Cuestionario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // NUEVO: Código de acceso para los alumnos
    @Column(name = "codigo_acceso", unique = true, length = 50)
    private String codigoAcceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por", nullable = false)
    private Usuario creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    @JsonIgnoreProperties({"docente", "secciones", "hibernateLazyInitializer"})
    private Curso curso;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoCuestionario estado = EstadoCuestionario.BORRADOR;

    @Column(name = "escala_nota", nullable = false, precision = 6, scale = 2)
    private BigDecimal escalaNota = new BigDecimal("20.00");

    @Column(name = "nota_aprobatoria", nullable = false, precision = 6, scale = 2)
    private BigDecimal notaAprobatoria = new BigDecimal("11.00");

    @Column(name = "orden_opciones_aleatorio", nullable = false)
    private Boolean ordenOpcionesAleatorio = false;

    @Column(name = "mostrar_nota_al_final", nullable = false)
    private Boolean mostrarNotaAlFinal = true;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Límite de tiempo en minutos (0 o null significa sin límite de tiempo)
    @Column(name = "tiempo_limite_minutos")
    private Integer tiempoLimiteMinutos = 0;

    // Preguntas en orden aleatorio
    @Column(name = "orden_aleatorio")
    private Boolean ordenAleatorio = false;

    // Modo seguro / Detección de cambio de pestaña
    @Column(name = "modo_seguro")
    private Boolean modoSeguro = false;

    // Límite de advertencias permitidas antes del auto-envío (por defecto 3)
    @Column(name = "limite_advertencias")
    private Integer limiteAdvertencias = 3;

    // Ventana de disponibilidad: Fecha y hora de apertura
    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    // Ventana de disponibilidad: Fecha y hora de cierre
    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    // Límite de intentos permitidos (1 para formal, >1 para varios, 0 o null para ilimitados)
    @Column(name = "limite_intentos")
    private Integer limiteIntentos = 1;

    // Criterio de ponderación de nota si hay varios intentos: "MEJOR_NOTA" o "ULTIMO_INTENTO"
    @Column(name = "tipo_calificacion_intentos", length = 30)
    private String tipoCalificacionIntentos = "MEJOR_NOTA";

    // Mostrar retroalimentación pedagógica inmediata al finalizar la prueba (por defecto true)
    @Column(name = "mostrar_retroalimentacion")
    private Boolean mostrarRetroalimentacion = true;

    // Grupos o secciones objetivo separados por comas (ej: "5to A, 5to B, 5to C")
    @Column(name = "grupos_permitidos", length = 500)
    private String gruposPermitidos;

    @OneToMany(mappedBy = "cuestionario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Pregunta> preguntas = new ArrayList<>();

    public Cuestionario() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (activo == null) {
            activo = true;
        }
        if (tiempoLimiteMinutos == null) {
            tiempoLimiteMinutos = 0;
        }
        if (ordenAleatorio == null) {
            ordenAleatorio = false;
        }
        if (modoSeguro == null) {
            modoSeguro = false;
        }
        if (limiteAdvertencias == null) {
            limiteAdvertencias = 3;
        }
        if (mostrarRetroalimentacion == null) {
            mostrarRetroalimentacion = true;
        }
        if (estado == null) {
            estado = Boolean.FALSE.equals(activo) ? EstadoCuestionario.ARCHIVADO : EstadoCuestionario.PUBLICADO;
        }
        if (escalaNota == null) {
            escalaNota = new BigDecimal("20.00");
        }
        if (notaAprobatoria == null) {
            notaAprobatoria = new BigDecimal("11.00");
        }
        if (ordenOpcionesAleatorio == null) {
            ordenOpcionesAleatorio = false;
        }
        if (mostrarNotaAlFinal == null) {
            mostrarNotaAlFinal = true;
        }
        // Generar un código de acceso de 6 números automáticamente si no viene definido
        if (codigoAcceso == null || codigoAcceso.trim().isEmpty()) {
            int numeroAleatorio = 100000 + new java.util.Random().nextInt(900000);
            codigoAcceso = String.valueOf(numeroAleatorio);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCodigoAcceso() {
        return codigoAcceso;
    }

    public void setCodigoAcceso(String codigoAcceso) {
        this.codigoAcceso = codigoAcceso;
    }

    public Integer getTiempoLimiteMinutos() {
        return tiempoLimiteMinutos != null ? tiempoLimiteMinutos : 0;
    }

    public void setTiempoLimiteMinutos(Integer tiempoLimiteMinutos) {
        this.tiempoLimiteMinutos = tiempoLimiteMinutos != null ? tiempoLimiteMinutos : 0;
    }

    public Boolean getOrdenAleatorio() {
        return ordenAleatorio != null ? ordenAleatorio : false;
    }

    public void setOrdenAleatorio(Boolean ordenAleatorio) {
        this.ordenAleatorio = ordenAleatorio != null ? ordenAleatorio : false;
    }

    public Usuario getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(Usuario creadoPor) {
        this.creadoPor = creadoPor;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
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

    @Transient
    private Long totalRespuestas = 0L;

    @Transient
    private Long alumnosUnicos = 0L;

    @Transient
    private Double promedioCalificacion = 0.0;

    public List<Pregunta> getPreguntas() {
        return preguntas;
    }

    public void setPreguntas(List<Pregunta> preguntas) {
        this.preguntas = preguntas;
        if (preguntas != null) {
            for (Pregunta p : preguntas) {
                p.setCuestionario(this);
            }
        }
    }

    public Long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(Long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public Long getAlumnosUnicos() {
        return alumnosUnicos;
    }

    public void setAlumnosUnicos(Long alumnosUnicos) {
        this.alumnosUnicos = alumnosUnicos;
    }

    public Double getPromedioCalificacion() {
        return promedioCalificacion;
    }

    public void setPromedioCalificacion(Double promedioCalificacion) {
        this.promedioCalificacion = promedioCalificacion;
    }

    public Boolean getModoSeguro() {
        return modoSeguro;
    }

    public void setModoSeguro(Boolean modoSeguro) {
        this.modoSeguro = modoSeguro;
    }

    public Integer getLimiteAdvertencias() {
        return limiteAdvertencias;
    }

    public void setLimiteAdvertencias(Integer limiteAdvertencias) {
        this.limiteAdvertencias = limiteAdvertencias;
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

    public Integer getLimiteIntentos() {
        return limiteIntentos;
    }

    public void setLimiteIntentos(Integer limiteIntentos) {
        this.limiteIntentos = limiteIntentos;
    }

    public String getTipoCalificacionIntentos() {
        return tipoCalificacionIntentos;
    }

    public void setTipoCalificacionIntentos(String tipoCalificacionIntentos) {
        this.tipoCalificacionIntentos = tipoCalificacionIntentos;
    }

    public Boolean getMostrarRetroalimentacion() {
        return mostrarRetroalimentacion;
    }

    public void setMostrarRetroalimentacion(Boolean mostrarRetroalimentacion) {
        this.mostrarRetroalimentacion = mostrarRetroalimentacion;
    }

    public String getGruposPermitidos() {
        return gruposPermitidos;
    }

    public void setGruposPermitidos(String gruposPermitidos) {
        this.gruposPermitidos = gruposPermitidos;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public EstadoCuestionario getEstado() {
        return estado;
    }

    public void setEstado(EstadoCuestionario estado) {
        this.estado = estado;
    }

    public BigDecimal getEscalaNota() {
        return escalaNota;
    }

    public void setEscalaNota(BigDecimal escalaNota) {
        this.escalaNota = escalaNota;
    }

    public BigDecimal getNotaAprobatoria() {
        return notaAprobatoria;
    }

    public void setNotaAprobatoria(BigDecimal notaAprobatoria) {
        this.notaAprobatoria = notaAprobatoria;
    }

    public Boolean getOrdenOpcionesAleatorio() {
        return ordenOpcionesAleatorio;
    }

    public void setOrdenOpcionesAleatorio(Boolean ordenOpcionesAleatorio) {
        this.ordenOpcionesAleatorio = ordenOpcionesAleatorio;
    }

    public Boolean getMostrarNotaAlFinal() {
        return mostrarNotaAlFinal;
    }

    public void setMostrarNotaAlFinal(Boolean mostrarNotaAlFinal) {
        this.mostrarNotaAlFinal = mostrarNotaAlFinal;
    }

    public enum EstadoCuestionario {
        BORRADOR,
        PUBLICADO,
        ARCHIVADO
    }
}