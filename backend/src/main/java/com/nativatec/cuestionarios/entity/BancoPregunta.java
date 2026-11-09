package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "banco_preguntas")
public class BancoPregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "materia", nullable = false, length = 100)
    private String materia = "General";

    @Column(name = "tema", length = 150)
    private String tema;

    @Enumerated(EnumType.STRING)
    @Column(name = "dificultad", nullable = false, length = 20)
    private DificultadPregunta dificultad = DificultadPregunta.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private Pregunta.TipoPregunta tipo = Pregunta.TipoPregunta.OPCION_MULTIPLE;

    @Column(name = "texto_pregunta", nullable = false, columnDefinition = "TEXT")
    private String textoPregunta;

    @Column(name = "puntos_defecto")
    private Double puntosDefecto = 4.0;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column(name = "explicacion", columnDefinition = "TEXT")
    private String explicacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_id")
    @JsonIgnoreProperties({"password", "cuestionarios", "intentos", "roles", "authorities", "hibernateLazyInitializer"})
    private Usuario creadoPor;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BancoOpcionRespuesta> opciones = new ArrayList<>();

    public BancoPregunta() {
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
        if (materia == null || materia.trim().isEmpty()) {
            materia = "General";
        }
        if (dificultad == null) {
            dificultad = DificultadPregunta.MEDIA;
        }
        if (tipo == null) {
            tipo = Pregunta.TipoPregunta.OPCION_MULTIPLE;
        }
        if (puntosDefecto == null || puntosDefecto <= 0) {
            puntosDefecto = 4.0;
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

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public DificultadPregunta getDificultad() {
        return dificultad;
    }

    public void setDificultad(DificultadPregunta dificultad) {
        this.dificultad = dificultad;
    }

    public Pregunta.TipoPregunta getTipo() {
        return tipo;
    }

    public void setTipo(Pregunta.TipoPregunta tipo) {
        this.tipo = tipo;
    }

    @JsonProperty("enunciado")
    public String getTextoPregunta() {
        return textoPregunta;
    }

    @JsonProperty("enunciado")
    @JsonAlias({"textoPregunta", "texto"})
    public void setTextoPregunta(String textoPregunta) {
        this.textoPregunta = textoPregunta;
    }

    @JsonProperty("puntos")
    public Double getPuntosDefecto() {
        return puntosDefecto;
    }

    @JsonProperty("puntos")
    @JsonAlias({"puntosDefecto", "puntaje", "peso"})
    public void setPuntosDefecto(Double puntosDefecto) {
        this.puntosDefecto = puntosDefecto;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getExplicacion() {
        return explicacion;
    }

    public void setExplicacion(String explicacion) {
        this.explicacion = explicacion;
    }

    public Usuario getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(Usuario creadoPor) {
        this.creadoPor = creadoPor;
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

    public List<BancoOpcionRespuesta> getOpciones() {
        return opciones;
    }

    public void setOpciones(List<BancoOpcionRespuesta> opciones) {
        this.opciones.clear();
        if (opciones != null) {
            for (BancoOpcionRespuesta opc : opciones) {
                opc.setPregunta(this);
                this.opciones.add(opc);
            }
        }
    }

    public void agregarOpcion(BancoOpcionRespuesta opcion) {
        if (opcion != null) {
            opcion.setPregunta(this);
            this.opciones.add(opcion);
        }
    }
}

