package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "opciones_respuesta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcionRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    //Relacion con la pregunta a la que pertenece cada opción
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private Pregunta pregunta;

    @Column(name = "texto_opcion", nullable = false, columnDefinition = "TEXT")
    private String textoOpcion;

    @Column(name = "es_correcta", nullable = false)
    private Boolean esCorrecta = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate(){
        LocalDateTime now = LocalDateTime.now();
        if(createdAt == null){
            createdAt = now;
        }
        if(updatedAt == null){
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = LocalDateTime.now();
    }
}
