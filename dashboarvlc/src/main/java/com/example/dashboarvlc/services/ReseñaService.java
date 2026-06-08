package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Reseña;

public interface ReseñaService {
    List<Reseña> listarTodas();
    Optional<Reseña> buscarPorId(Long id);
    Reseña guardar(Reseña resenia);
    void eliminar(Long id);
}
