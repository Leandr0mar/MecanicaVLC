package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "productos")
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @NotBlank(message = "El nombre del producto no puede estar vacío")
    @Size(max = 150, message = "El nombre no debe superar los 150 caracteres")
    private String nombre;

    @NotBlank(message = "El código de producto no puede estar vacío")
    @Size(max = 50, message = "El código no debe superar los 50 caracteres")
    @Column(unique = true)
    private String codigoProducto;

    @NotBlank(message = "La marca no puede estar vacía")
    @Size(max = 100, message = "La marca no debe superar los 100 caracteres")
    private String marca;

    @NotNull(message = "El precio de venta es obligatorio")
    @PositiveOrZero(message = "El precio de venta debe ser cero o positivo")
    private Double precioVenta;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    // NUEVO CAMPO PARA LA IMAGEN
    @Column(columnDefinition = "TEXT")
    private String imagenUrl;

    // ESCUDOS CONTRA BUCLES INFINITOS EN LAS LLAVES FORÁNEAS
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    @NotNull(message = "La categoría es obligatoria")
    @JsonIgnoreProperties({"productos", "hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    @NotNull(message = "El proveedor es obligatorio")
    @JsonIgnoreProperties({"productos", "hibernateLazyInitializer", "handler"})
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_oferta")
    @JsonIgnoreProperties({"productos", "hibernateLazyInitializer", "handler"})
    private Oferta oferta;

    @JsonIgnore
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistorialStock> historialStock;

    @Transient
    @JsonProperty("precioFinal")
    public Double getPrecioFinal() {
        // Verifica si hay una oferta y si está dentro de la fecha (usando tu método estado)
        if (this.oferta != null && this.oferta.estado()) {
            
            // ESCENARIO A: Si el descuento es un PORCENTAJE (ej: 20 para 20%)
            double porcentaje = this.oferta.getDescuento() / 100.0;
            double montoDescontado = this.precioVenta * porcentaje;
            double precioCalculado = this.precioVenta - montoDescontado;
            
            // Redondeamos a 2 decimales para evitar problemas de precisión flotante
            return Math.round(precioCalculado * 100.0) / 100.0;

        }
        
        // Si no hay oferta o ya expiró, devuelve el precio original
        return this.precioVenta;
    }
}