package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "proveedores")
@Data
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProveedor;

    @NotBlank(message = "El RUC no puede estar vacío")
    @Size(min = 11, max = 11, message = "El RUC de la empresa en Perú debe tener exactamente 11 dígitos")
    @Column(unique = true)
    private String ruc;

    @NotBlank(message = "El nombre del proveedor no puede estar vacío")
    @Size(max = 150, message = "El nombre del proveedor no debe superar los 150 caracteres")
    private String nombreProveedor;

    @NotBlank(message = "El teléfono no puede estar vacío")
    @Size(max = 20, message = "El teléfono no debe superar los 20 caracteres")
    private String telefono;

    @JsonIgnore // <-- Evita el bucle infinito al traer el proveedor
    @OneToMany(mappedBy = "proveedor", fetch = FetchType.LAZY)
    private List<Producto> productos;
}