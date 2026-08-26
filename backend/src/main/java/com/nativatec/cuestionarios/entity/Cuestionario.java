package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cuestionarios")
@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder 

public class Cuestionario {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Relacion con el usuario profesor que creó e cuestionario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por", nullable = false)
    private Usuario creadoPor;

    @Column(nullable = false)
    private Boolean activo = true;

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
