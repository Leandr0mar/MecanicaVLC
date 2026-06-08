package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Servicio;

public interface ServicioService {
    List<Servicio> listarTodos();
    Optional<Servicio> buscarPorId(Long id);
    Servicio guardar(Servicio servicio);
    Servicio actualizar(Long id, Servicio servicio);
    void eliminar(Long id);
}
