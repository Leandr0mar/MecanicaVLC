package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // <-- IMPORTANTE

@Entity
@Table(name = "historial_stock")
@Data
public class HistorialStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorialStock;

    @NotNull(message = "La cantidad es obligatoria")
    private Integer cantidad;

    @NotBlank(message = "El tipo de movimiento no puede estar vacío")
    @Size(max = 50) // "ENTRADA" o "SALIDA"
    private String tipoMovimiento;

    @Column(name = "fecha_movimiento", updatable = false)
    private LocalDateTime fechaMovimiento;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(max = 255)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    // ESCUDO ANTI BUCLES
    @JsonIgnoreProperties({"historialStock", "categoria", "proveedor", "hibernateLazyInitializer", "handler"})
    private Producto producto;

    @PrePersist
    protected void onCreate() {
        this.fechaMovimiento = LocalDateTime.now();
    }
}