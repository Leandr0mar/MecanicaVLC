package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "clientes")
@Data
@EqualsAndHashCode(callSuper = true)
public class Cliente extends Usuario {

    @NotBlank(message = "El teléfono no puede estar vacío")
    @Size(max = 20)
    private String telefono;

    @NotBlank(message = "La dirección no puede estar vacía")
    @Size(max = 255)
    private String direccion;

    @NotBlank(message = "La placa de mototaxi no puede estar vacía")
    @Size(max = 20)
    private String placaMototaxi;

    @NotBlank(message = "La marca no puede estar vacía")
    @Size(max = 50)
    private String marcaMototaxi;

    @NotBlank(message = "El modelo no puede estar vacío")
    @Size(max = 50)
    private String modeloMototaxi;

    @JsonIgnore // <-- Protegido
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Cita> citas;

    @JsonIgnore // <-- Protegido
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdenCompra> ordenesCompra;
}