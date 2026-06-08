package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "administradores")
@Data
@EqualsAndHashCode(callSuper = true)
public class Administrador extends Usuario {

    @NotNull(message = "El nivel de acceso es obligatorio")
    private Integer nivelAcceso;

    public Administrador() {
    }

    public Administrador(Integer nivelAcceso) {
        this.nivelAcceso = nivelAcceso;
    }
    
}
