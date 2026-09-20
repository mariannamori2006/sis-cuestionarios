package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
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

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
        // Generar un código de acceso único automáticamente si no viene definido (ej:
        // los primeros 8 caracteres de un UUID)
        if (codigoAcceso == null || codigoAcceso.isEmpty()) {
            codigoAcceso = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
}