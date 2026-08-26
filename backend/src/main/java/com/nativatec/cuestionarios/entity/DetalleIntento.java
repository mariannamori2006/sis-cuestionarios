package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "detalles_intento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleIntento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    //Intento al que pertenece ese detalle
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intento_id", nullable = false)
    private IntentoCuestionario intento;

    //Pregunta que se esta respondiendo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private Pregunta pregunta;

    //Opcion seleccionada (Opcon multiples o Verdadero/Falso)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcion_seleccionada_id")
    private OpcionRespuesta opcionSeleccionada;

    //Respuesta escrita (Respuesta corta)
    @Column(name = "respuesta_texto", columnDefinition = "TEXT")
    private String respuestaTexto;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
