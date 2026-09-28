package com.example.dashboarvlc.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.enums.EstadoCita;

public interface CitaService {
    List<Cita> listarTodas();
    Optional<Cita> buscarPorId(Long id);
    Cita guardar(Cita cita, String emailCliente); // Requiere el email del logueado
    Cita cambiarEstado(Long id, EstadoCita nuevoEstado);
    void eliminar(Long id);
    
    // Métodos dinámicos
    List<String> obtenerHorariosDisponibles(LocalDate fecha);
    List<Cita> listarPorCliente(String email);
    Cita reasignarTrabajador(Long idCita, Long idTrabajador);
    Cita agregarObservacion(Long id, String observacion);
}