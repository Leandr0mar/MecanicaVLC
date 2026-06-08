package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.dashboarvlc.models.enums.EstadoRecojo;

@Entity
@Table(name = "ordenes_compra")
@Data
public class OrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReserva;

    @NotNull(message = "La fecha de reserva es obligatoria")
    private LocalDate fechaReserva;

    // Métricas del Dashboard: Reportes de caja basados en cobros reales
    private LocalDateTime fechaPago; 

    @NotNull(message = "El monto total es obligatorio")
    @PositiveOrZero
    private Double montoTotal;

    @NotNull(message = "El estado de recojo es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoRecojo estadoRecojo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajador", nullable = false)
    private Trabajador trabajador;

    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemsComprados> items;
}