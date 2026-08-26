package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "preguntas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class Pregunta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    //Realacion con el cuestionario al que pertenece cada pregunta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    private Cuestionario cuestionario;

    @Column(nullable = false, columnDefinition = "TEXT")
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

    public enum TipoPregunta{
        OPCION_MULTIPLE, VERDADERO_FALSO, RESPUESTA_CORTA
    }
}
