package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "items_comprados")
@Data
public class ItemsComprados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemComprado; // Clave subrogada óptima para JPA

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario historial es obligatorio")
    @PositiveOrZero(message = "El precio debe ser cero o positivo")
    private Double precioUnitarioHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private OrdenCompra ordenCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    @NotNull(message = "El producto es obligatorio")
    private Producto producto;
}
