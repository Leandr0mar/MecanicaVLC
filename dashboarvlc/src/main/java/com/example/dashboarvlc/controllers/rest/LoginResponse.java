package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Usuario;

public class LoginResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String rol;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public static LoginResponse fromUsuario(Usuario usuario) {
        LoginResponse response = new LoginResponse();
        response.setId(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setApellido(usuario.getApellido());
        response.setDni(usuario.getDni());
        response.setEmail(usuario.getEmail());
        response.setRol(mapRole(usuario.getRol()));
        return response;
    }

    private static String mapRole(Integer rol) {
        if (rol == null) {
            return "cliente";
        }
        return switch (rol) {
            case 1 -> "admin";
            case 2 -> "trabajador";
            case 3 -> "cliente";
            default -> "cliente";
        };
    }
}
