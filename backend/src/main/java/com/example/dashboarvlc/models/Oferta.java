package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "ofertas")
@Data
public class Oferta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOferta;

    @NotBlank(message = "El título de la oferta no puede estar vacío")
    @Size(max = 150, message = "El título no debe superar los 150 caracteres")
    private String titulo;

    @NotNull(message = "El descuento es obligatorio")
    @PositiveOrZero(message = "El descuento debe ser cero o positivo")
    private Double descuento;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @JsonIgnore // <-- Evita el error 500 de bucle infinito
    @OneToMany(mappedBy = "oferta", fetch = FetchType.LAZY)
    private List<Producto> productos;

    public boolean estado() {
        LocalDate hoy = LocalDate.now();
        return (!hoy.isBefore(fechaInicio) && !hoy.isAfter(fechaFin));
    }
}