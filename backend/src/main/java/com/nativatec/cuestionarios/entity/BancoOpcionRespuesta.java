package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "banco_opciones_respuesta")
public class BancoOpcionRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_pregunta_id", nullable = false)
    @JsonBackReference
    private BancoPregunta pregunta;

    @Column(name = "texto_opcion", nullable = false, columnDefinition = "TEXT")
    private String textoOpcion;

    @Column(name = "es_correcta", nullable = false)
    private Boolean esCorrecta = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BancoOpcionRespuesta() {
    }

    public BancoOpcionRespuesta(String textoOpcion, Boolean esCorrecta) {
        this.textoOpcion = textoOpcion;
        this.esCorrecta = esCorrecta != null ? esCorrecta : false;
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
        if (esCorrecta == null) {
            esCorrecta = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonProperty("texto")
    public String getTextoOpcion() {
        return textoOpcion;
    }

    @JsonProperty("texto")
    public void setTextoOpcion(String textoOpcion) {
        this.textoOpcion = textoOpcion;
    }

    @JsonProperty("correcta")
    public Boolean getEsCorrecta() {
        return esCorrecta;
    }

    @JsonProperty("correcta")
    public void setEsCorrecta(Boolean esCorrecta) {
        this.esCorrecta = esCorrecta;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BancoPregunta getPregunta() {
        return pregunta;
    }

    public void setPregunta(BancoPregunta pregunta) {
        this.pregunta = pregunta;
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
}

