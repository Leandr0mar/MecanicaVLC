package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "trabajadores")
@Data
@EqualsAndHashCode(callSuper = true)
public class Trabajador extends Usuario {

    @NotBlank(message = "La especialidad no puede estar vacía")
    @Size(max = 100, message = "La especialidad no debe superar los 100 caracteres")
    private String especialidad;

    @NotNull(message = "La disponibilidad es obligatoria")
    private Boolean disponibilidad;

    @JsonIgnore
    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Cita> citas;

    @JsonIgnore
    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdenCompra> ordenesCompra;
}
