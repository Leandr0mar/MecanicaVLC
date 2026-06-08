package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "servicios")
@Data
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idServicio;

    @NotBlank(message = "El nombre del servicio no puede estar vacío")
    @Size(max = 100, message = "El nombre del servicio no debe superar los 100 caracteres")
    private String nombreServicio;

    @NotBlank(message = "La descripción del servicio no puede estar vacía")
    @Size(max = 255, message = "La descripción no debe superar los 255 caracteres")
    private String descripcionServicio;

    @NotNull(message = "El precio inicial es obligatorio")
    @PositiveOrZero(message = "El precio inicial debe ser cero o un valor positivo")
    private Double precioInicial;

    @OneToMany(mappedBy = "servicio", fetch = FetchType.LAZY)
    private List<Cita> citas;
}