package com.example.dashboarvlc.controllers.rest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioActualizacionRequest {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío")
    private String apellido;

    @NotBlank(message = "El tipo de documento no puede estar vacío")
    @Pattern(regexp = "^(DNI|CE)$", message = "El tipo de documento debe ser DNI o CE")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento no puede estar vacío")
    @Size(max = 20)
    @Pattern(regexp = "^(?:\\d{8}|[A-Za-z0-9]{9,12})$", message = "El DNI debe tener 8 dígitos o el CE entre 9 y 12 caracteres alfanuméricos")
    private String numeroDocumento;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El email debe tener un formato válido")
    private String email;

    private String telefono;
    private String direccion;
    private String placaMototaxi;
    private String marcaMototaxi;
    private String modeloMototaxi;
    private String especialidad;
    private Boolean disponibilidad;
}
