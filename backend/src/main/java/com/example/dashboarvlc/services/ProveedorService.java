package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Proveedor;

public interface ProveedorService {
    List<Proveedor> listarTodos();
    Optional<Proveedor> buscarPorId(Long id);
    Proveedor guardar(Proveedor proveedor);
    void eliminar(Long id);
}
