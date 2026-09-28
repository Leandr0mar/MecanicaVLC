package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import com.example.dashboarvlc.models.enums.EstadoCita;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "citas")
@Data
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCita;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    private EstadoCita estado;

    @Size(max = 500)
    private String observaciones;

    // CAMBIO APLICADO: montoTotal a montoInicial
    @PositiveOrZero
    @Column(name = "monto_inicial")
    private Double montoInicial;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;

    // ESCUDOS ANTI-BUCLES
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonIgnoreProperties({"citas", "ordenesCompra", "hibernateLazyInitializer", "handler"})
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajador")
    @JsonIgnoreProperties({"citas", "ordenesCompra", "hibernateLazyInitializer", "handler"})
    private Trabajador trabajador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    @JsonIgnoreProperties({"citas", "hibernateLazyInitializer", "handler"})
    private Servicio servicio;

    @OneToOne(mappedBy = "cita", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"cita", "hibernateLazyInitializer", "handler"})
    private Reseña reseña;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaModificacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaModificacion = LocalDateTime.now();
    }
}