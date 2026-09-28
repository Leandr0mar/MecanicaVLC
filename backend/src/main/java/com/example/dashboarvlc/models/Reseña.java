package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reseñas")
@Data
public class Reseña {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReseña;

    // --- NUEVO ATRIBUTO DE ESTRELLAS ---
    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion; 

    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(max = 1000, message = "El comentario no debe superar los 1000 caracteres")
    private String comentario;

    private LocalDate fechaReseña;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false)
    @NotNull(message = "La cita asociada es obligatoria")
    // Escudo para evitar bucles infinitos al convertir a JSON
    @JsonIgnoreProperties({"reseña", "cliente", "trabajador", "hibernateLazyInitializer", "handler"})
    private Cita cita;

    // Asigna la fecha automáticamente al crear la reseña en la base de datos
    @PrePersist
    protected void onCreate() {
        this.fechaReseña = LocalDate.now();
    }
}