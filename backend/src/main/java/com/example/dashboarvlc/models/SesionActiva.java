package com.example.dashboarvlc.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_activas", indexes = {
        @Index(name = "idx_sesiones_activas_usuario", columnList = "usuario_id"),
        @Index(name = "idx_sesiones_activas_actividad", columnList = "ultima_actividad")
})
@Data
@NoArgsConstructor
public class SesionActiva {
    @Id
    @Column(name = "session_hash", length = 64, nullable = false)
    private String sessionHash;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "ultima_actividad", nullable = false)
    private LocalDateTime ultimaActividad;
}