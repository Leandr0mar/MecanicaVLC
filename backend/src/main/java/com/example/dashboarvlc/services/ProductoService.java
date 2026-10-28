package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Producto;

public interface ProductoService {
    List<Producto> listarTodos();
    Optional<Producto> buscarPorId(Long id);
    Producto guardar(Producto producto);
    Producto actualizarStock(Long id, Integer nuevoStock, String motivo);
    void eliminar(Long id);
}
