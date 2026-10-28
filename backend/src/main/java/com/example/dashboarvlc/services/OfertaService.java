package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.Oferta;

public interface OfertaService {
    List<Oferta> listarTodas();
    Optional<Oferta> buscarPorId(Long id);
    Oferta guardar(Oferta oferta);
    void eliminar(Long id);
}