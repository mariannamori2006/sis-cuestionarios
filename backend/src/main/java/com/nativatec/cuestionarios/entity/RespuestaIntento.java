package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "respuestas_intento",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_respuesta_intento_pregunta", columnNames = {"intento_id", "pregunta_id"})
    }
)
public class RespuestaIntento {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intento_id", nullable = false)
    @JsonBackReference
    private IntentoEvaluacion intento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    @JsonIgnoreProperties({"cuestionario", "opciones", "hibernateLazyInitializer"})
    private Pregunta pregunta;

    @ManyToMany
    @JoinTable(
        name = "respuesta_opciones",
        joinColumns = @JoinColumn(name = "respuesta_intento_id"),
        inverseJoinColumns = @JoinColumn(name = "opcion_id")
    )
    @JsonIgnoreProperties({"pregunta", "hibernateLazyInitializer"})
    private List<OpcionRespuesta> opcionesSeleccionadas = new ArrayList<>();

    @Column(name = "respuesta_texto", columnDefinition = "TEXT")
    private String respuestaTexto;

    @Column(name = "es_correcta")
    private Boolean esCorrecta;

    @Column(name = "requiere_revision", nullable = false)
    private Boolean requiereRevision = false;

    @Column(name = "puntos_asignados", nullable = false, precision = 6, scale = 2)
    private BigDecimal puntosAsignados = BigDecimal.ZERO;

    @Column(name = "puntos_obtenidos", nullable = false, precision = 6, scale = 2)
    private BigDecimal puntosObtenidos = BigDecimal.ZERO;

    @Column(name = "respondido_at", nullable = false)
    private LocalDateTime respondidoAt;

    public RespuestaIntento() {
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (respondidoAt == null) {
            respondidoAt = LocalDateTime.now();
        }
        if (requiereRevision == null) {
            requiereRevision = false;
        }
        if (puntosAsignados == null) {
            puntosAsignados = BigDecimal.ZERO;
        }
        if (puntosObtenidos == null) {
            puntosObtenidos = BigDecimal.ZERO;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public IntentoEvaluacion getIntento() {
        return intento;
    }

    public void setIntento(IntentoEvaluacion intento) {
        this.intento = intento;
    }

    public Pregunta getPregunta() {
        return pregunta;
    }

    public void setPregunta(Pregunta pregunta) {
        this.pregunta = pregunta;
    }

    public List<OpcionRespuesta> getOpcionesSeleccionadas() {
        return opcionesSeleccionadas;
    }

    public void setOpcionesSeleccionadas(List<OpcionRespuesta> opcionesSeleccionadas) {
        this.opcionesSeleccionadas = opcionesSeleccionadas != null ? opcionesSeleccionadas : new ArrayList<>();
    }

    public String getRespuestaTexto() {
        return respuestaTexto;
    }

    public void setRespuestaTexto(String respuestaTexto) {
        this.respuestaTexto = respuestaTexto;
    }

    public Boolean getEsCorrecta() {
        return esCorrecta;
    }

    public void setEsCorrecta(Boolean esCorrecta) {
        this.esCorrecta = esCorrecta;
    }

    public Boolean getRequiereRevision() {
        return requiereRevision;
    }

    public void setRequiereRevision(Boolean requiereRevision) {
        this.requiereRevision = requiereRevision;
    }

    public BigDecimal getPuntosAsignados() {
        return puntosAsignados;
    }

    public void setPuntosAsignados(BigDecimal puntosAsignados) {
        this.puntosAsignados = puntosAsignados;
    }

    public BigDecimal getPuntosObtenidos() {
        return puntosObtenidos;
    }

    public void setPuntosObtenidos(BigDecimal puntosObtenidos) {
        this.puntosObtenidos = puntosObtenidos;
    }

    public LocalDateTime getRespondidoAt() {
        return respondidoAt;
    }

    public void setRespondidoAt(LocalDateTime respondidoAt) {
        this.respondidoAt = respondidoAt;
    }
}

