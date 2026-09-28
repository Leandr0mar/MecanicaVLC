package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Administrador;
import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.models.Trabajador;
import com.example.dashboarvlc.models.Usuario;
import com.example.dashboarvlc.repositories.SesionActivaRepository;

import java.time.LocalDateTime;

public record UsuarioPresenciaResponse(
        Long idUsuario,
        String nombre,
        String apellido,
        String dni,
        String email,
        Integer rol,
        LocalDateTime fechaRegistro,
        String telefono,
        String direccion,
        String placaMototaxi,
        String marcaMototaxi,
        String modeloMototaxi,
        String especialidad,
        Boolean disponibilidad,
        Integer nivelAcceso,
        boolean conectado,
        LocalDateTime ultimaActividad
) {
    public static UsuarioPresenciaResponse desde(Usuario usuario,
                                                  SesionActivaRepository.ResumenPresencia presencia) {
        Cliente cliente = usuario instanceof Cliente value ? value : null;
        Trabajador trabajador = usuario instanceof Trabajador value ? value : null;
        Administrador administrador = usuario instanceof Administrador value ? value : null;

        return new UsuarioPresenciaResponse(
                usuario.getIdUsuario(), usuario.getNombre(), usuario.getApellido(), usuario.getDni(),
                usuario.getEmail(), usuario.getRol(), usuario.getFechaRegistro(),
                cliente == null ? null : cliente.getTelefono(),
                cliente == null ? null : cliente.getDireccion(),
                cliente == null ? null : cliente.getPlacaMototaxi(),
                cliente == null ? null : cliente.getMarcaMototaxi(),
                cliente == null ? null : cliente.getModeloMototaxi(),
                trabajador == null ? null : trabajador.getEspecialidad(),
                trabajador == null ? null : trabajador.getDisponibilidad(),
                administrador == null ? null : administrador.getNivelAcceso(),
                presencia != null && Boolean.TRUE.equals(presencia.getConectado()),
                presencia == null ? null : presencia.getUltimaActividad()
        );
    }
}