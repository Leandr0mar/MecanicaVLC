package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Trabajador;

public interface TrabajadorService {
    List<Trabajador> listarTodos();
    Optional<Trabajador> buscarPorEmail(String email);
    Optional<Trabajador> buscarPorId(Long id);
    Trabajador guardar(Trabajador trabajador);
    Trabajador actualizar(Long id, Trabajador trabajador);
    void eliminar(Long id);
}