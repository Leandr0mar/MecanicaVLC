package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "reseñas")
@Data
public class Reseña {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReseña;

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 1000, message = "El comentario no debe superar los 1000 caracteres")
    private String comentario;

    @NotNull(message = "La fecha de la reseña es obligatoria")
    private LocalDate fechaReseña;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false)
    @NotNull(message = "La cita asociada es obligatoria")
    private Cita cita;
}
