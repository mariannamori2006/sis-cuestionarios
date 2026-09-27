package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "preguntas")
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    @JsonBackReference
    private Cuestionario cuestionario;

    @Column(name = "texto_pregunta", nullable = false, columnDefinition = "TEXT")
    private String textoPregunta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoPregunta tipo = TipoPregunta.OPCION_MULTIPLE;

    @Column(name = "orden", nullable = false)
    private Integer orden = 1;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OpcionRespuesta> opciones = new ArrayList<>();

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
        if (orden == null) {
            orden = 1;
        }
        if (tipo == null) {
            tipo = TipoPregunta.OPCION_MULTIPLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Mapeo con @JsonProperty para aceptar "enunciado" desde el modal de React
    @JsonProperty("enunciado")
    public String getTextoPregunta() {
        return textoPregunta;
    }

    @JsonProperty("enunciado")
    public void setTextoPregunta(String textoPregunta) {
        this.textoPregunta = textoPregunta;
    }

    // Getters y Setters habituales
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

    public List<OpcionRespuesta> getOpciones() {
        return opciones;
    }

    public void setOpciones(List<OpcionRespuesta> opciones) {
        this.opciones = opciones;
        if (opciones != null) {
            for (OpcionRespuesta o : opciones) {
                o.setPregunta(this);
            }
        }
    }

    public enum TipoPregunta {
        OPCION_MULTIPLE, VERDADERO_FALSO, RESPUESTA_CORTA;

        @JsonCreator
        public static TipoPregunta fromString(String value) {
            if (value == null || value.trim().isEmpty()) {
                return OPCION_MULTIPLE;
            }
            String clean = value.trim().toUpperCase()
                    .replace(" ", "_")
                    .replace("Ó", "O")
                    .replace("Í", "I")
                    .replace("/", "_");
            if (clean.contains("MULTIPLE")) return OPCION_MULTIPLE;
            if (clean.contains("VERDADERO") || clean.contains("FALSO")) return VERDADERO_FALSO;
            if (clean.contains("CORTA") || clean.contains("ESCRITA") || clean.contains("ABIERTA") || clean.contains("TEXTO")) return RESPUESTA_CORTA;
            for (TipoPregunta t : TipoPregunta.values()) {
                if (t.name().equalsIgnoreCase(clean)) return t;
            }
            return OPCION_MULTIPLE;
        }
    }
}