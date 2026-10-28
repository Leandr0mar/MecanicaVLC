package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Administrador;

public interface AdministradorService {
    List<Administrador> listarTodos();
    Optional<Administrador> buscarPorEmail(String email);    
    Optional<Administrador> buscarPorId(Long id);
    Administrador guardar(Administrador administrador);
    Administrador actualizar(Long id, Administrador administrador);
    void eliminar(Long id);
}
