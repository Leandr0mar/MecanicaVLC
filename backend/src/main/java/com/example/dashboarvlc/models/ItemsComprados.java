package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
// NUEVAS IMPORTACIONES
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "items_comprados")
@Data
public class ItemsComprados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemComprado; 

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario historial es obligatorio")
    @PositiveOrZero(message = "El precio debe ser cero o positivo")
    private Double precioUnitarioHistorial;

    // ESCUDO 1: Rompe el bucle infinito impidiendo que el Item llame a la Orden de regreso
    @JsonIgnore 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private OrdenCompra ordenCompra;

    // ESCUDO 2: Permite traer los datos del producto sin cargar todo el árbol de relaciones del producto
    @JsonIgnoreProperties({"categoria", "proveedor", "oferta", "historialStock", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    @NotNull(message = "El producto es obligatorio")
    private Producto producto;
}