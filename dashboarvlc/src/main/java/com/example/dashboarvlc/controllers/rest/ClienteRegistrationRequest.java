package com.example.dashboarvlc.controllers.rest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ClienteRegistrationRequest {

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    @Pattern(regexp = "^\\d{8}$", message = "El DNI debe tener exactamente 8 dígitos numéricos")
    private String dni;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    private String telefono;

    @NotBlank
    private String direccion;

    @NotBlank
    private String placaMototaxi;

    @NotBlank
    private String marcaMototaxi;

    @NotBlank
    private String modeloMototaxi;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getPlacaMototaxi() {
        return placaMototaxi;
    }

    public void setPlacaMototaxi(String placaMototaxi) {
        this.placaMototaxi = placaMototaxi;
    }

    public String getMarcaMototaxi() {
        return marcaMototaxi;
    }

    public void setMarcaMototaxi(String marcaMototaxi) {
        this.marcaMototaxi = marcaMototaxi;
    }

    public String getModeloMototaxi() {
        return modeloMototaxi;
    }

    public void setModeloMototaxi(String modeloMototaxi) {
        this.modeloMototaxi = modeloMototaxi;
    }
}
