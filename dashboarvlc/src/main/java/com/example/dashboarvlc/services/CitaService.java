package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.enums.EstadoCita;

public interface CitaService {
    List<Cita> listarTodas();
    Optional<Cita> buscarPorId(Long id);
    Cita guardar(Cita cita);
    Cita cambiarEstado(Long id, EstadoCita nuevoEstado);
    void eliminar(Long id);
}
