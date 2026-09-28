package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.dashboarvlc.models.enums.EstadoRecojo;
// NUEVA IMPORTACIÓN
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "ordenes_compra")
@Data
public class OrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReserva;

    @NotNull(message = "La fecha de reserva es obligatoria")
    private LocalDate fechaReserva;

    private LocalDateTime fechaPago; 

    @NotNull(message = "El monto total es obligatorio")
    @PositiveOrZero
    private Double montoTotal;

    @NotNull(message = "El estado de recojo es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoRecojo estadoRecojo;

    // ESCUDOS PARA EVITAR ERRORES DE LAZY INITIALIZATION
    @JsonIgnoreProperties({"citas", "ordenesCompra", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @JsonIgnoreProperties({"citas", "ordenesCompra", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajador", nullable = false)
    private Trabajador trabajador;

    @JsonIgnoreProperties({"ordenCompra", "hibernateLazyInitializer", "handler"})
    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemsComprados> items;
}