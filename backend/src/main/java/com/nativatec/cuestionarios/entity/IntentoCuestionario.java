package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "intentos_cuestionario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntentoCuestionario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    //Cuestionario que se está respondiendo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuestionario_id", nullable = false)
    private Cuestionario cuestionario;

    //Alumno que realiza el intento
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    //Nombre o apodo del alumno sin registrarse
    @Column(name = "nombre_invitado", length = 100)
    private String nombreInvitado;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "calificacion")
    private Double calificacion;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreated(){
        LocalDateTime now = LocalDateTime.now();
        if(createdAt == null){
            createdAt = now;
        }
        if(updatedAt == null){
            updatedAt = now;
        }
        if(fechaInicio == null){
            fechaInicio = now;
        }
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = LocalDateTime.now();
    }
}
