package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.Oferta;
import com.example.dashboarvlc.repositories.OfertaRepository;
import com.example.dashboarvlc.services.OfertaService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OfertaServiceImpl implements OfertaService {
    
    private final OfertaRepository ofertaRepository;

    @Override @Transactional(readOnly = true) public List<Oferta> listarTodas() { return ofertaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Oferta> buscarPorId(Long id) { return ofertaRepository.findById(id); }
    @Override @Transactional public Oferta guardar(Oferta o) { return ofertaRepository.save(o); }
    @Override @Transactional public void eliminar(Long id) { ofertaRepository.deleteById(id); }
}