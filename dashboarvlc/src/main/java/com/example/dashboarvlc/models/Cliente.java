package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Entity
@Table(name = "clientes")
@Data
@EqualsAndHashCode(callSuper = true)
public class Cliente extends Usuario {

    @NotBlank(message = "El teléfono no puede estar vacío")
    @Size(max = 20, message = "El teléfono no debe superar los 20 caracteres")
    private String telefono;

    @NotBlank(message = "La dirección no puede estar vacía")
    @Size(max = 255, message = "La dirección no debe superar los 255 caracteres")
    private String direccion;

    @NotBlank(message = "La placa de mototaxi no puede estar vacía")
    @Size(max = 20, message = "La placa no debe superar los 20 caracteres")
    private String placaMototaxi;

    @NotBlank(message = "La marca de mototaxi no puede estar vacía")
    @Size(max = 50, message = "La marca no debe superar los 50 caracteres")
    private String marcaMototaxi;

    @NotBlank(message = "El modelo de mototaxi no puede estar vacío")
    @Size(max = 50, message = "El modelo no debe superar los 50 caracteres")
    private String modeloMototaxi;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Cita> citas;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdenCompra> ordenesCompra;
}
