package com.example.dashboarvlc.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "usuarios", indexes = {
    @Index(name = "idx_usuarios_rol_fecha", columnList = "rol, fecha_registro")
})
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public abstract class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(max = 100)
    private String apellido;

    @NotBlank(message = "El email no puede estar vacío")
    @Email
    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = true, length = 20)
    private String dni;

    @NotBlank(message = "El tipo de documento no puede estar vacío")
    @Pattern(regexp = "^(DNI|CE)$", message = "El tipo de documento debe ser DNI o CE")
    @Column(name = "tipo_documento", nullable = false, length = 3)
    private String tipoDocumento = "DNI";

    @NotBlank(message = "El número de documento no puede estar vacío")
    @Size(max = 20, message = "El número de documento no puede superar 20 caracteres")
    @Column(name = "numero_documento", unique = true, length = 20)
    private String numeroDocumento;

    @Column(nullable = false)
    private Boolean activo = true;

    private void sincronizarDocumentoLegado() {
        if (tipoDocumento == null || tipoDocumento.isBlank()) tipoDocumento = "DNI";
        if (numeroDocumento == null || numeroDocumento.isBlank()) numeroDocumento = dni;
        dni = "DNI".equals(tipoDocumento) ? numeroDocumento : null;
    }

    @NotBlank(message = "La contraseña no puede estar vacía")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // <-- Se recibe, pero NO se expone al frontend
    private String contrasenia;

    @Column(nullable = false)
    private Integer rol;

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        sincronizarDocumentoLegado();
        this.fechaRegistro = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        sincronizarDocumentoLegado();
    }
}
