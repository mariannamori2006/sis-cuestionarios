package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "preguntas")
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Relacion con el cuestionario al que pertenece cada pregunta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    private Cuestionario cuestionario;

    @Column(name = "texto_pregunta", nullable = false, columnDefinition = "TEXT")
    private String textoPregunta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoPregunta tipo;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Pregunta() {
    }

    public Pregunta(UUID id, Cuestionario cuestionario, String textoPregunta, TipoPregunta tipo, Integer orden,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.cuestionario = cuestionario;
        this.textoPregunta = textoPregunta;
        this.tipo = tipo;
        this.orden = orden;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters explícitos
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

    public String getTextoPregunta() {
        return textoPregunta;
    }

    public void setTextoPregunta(String textoPregunta) {
        this.textoPregunta = textoPregunta;
    }

    public TipoPregunta getTipo() {
        return tipo;
    }

    public void setTipo(TipoPregunta tipo) {
        this.tipo = tipo;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
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

    public enum TipoPregunta {
        OPCION_MULTIPLE, VERDADERO_FALSO, RESPUESTA_CORTA
    }
}
