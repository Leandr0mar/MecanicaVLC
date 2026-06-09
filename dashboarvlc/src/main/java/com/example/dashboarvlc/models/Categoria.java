package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore; // <-- IMPORTANTE AÑADIR ESTO
import java.util.List;

@Entity
@Table(name = "categorias")
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategoria;

    @NotBlank(message = "El nombre de la categoría no puede estar vacío")
    @Size(max = 100, message = "El nombre no debe superar los 100 caracteres")
    private String nombreCategoria;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(max = 255, message = "La descripción no debe superar los 255 caracteres")
    private String descripcion;

    @JsonIgnore // <-- EVITA EL ERROR 500 DE BUCLE INFINITO
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<Producto> productos;

    public Categoria() {
    }
}