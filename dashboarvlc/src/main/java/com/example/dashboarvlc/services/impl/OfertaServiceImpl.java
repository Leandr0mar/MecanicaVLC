package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Oferta;
import com.example.dashboarvlc.repositories.OfertaRepository;
import com.example.dashboarvlc.services.OfertaService;

import java.util.List;
import java.util.Optional;

@Service
public class OfertaServiceImpl implements OfertaService {
    @Autowired private OfertaRepository ofertaRepository;

    @Override @Transactional(readOnly = true) public List<Oferta> listarTodas() { return ofertaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Oferta> buscarPorId(Long id) { return ofertaRepository.findById(id); }
    @Override @Transactional public Oferta guardar(Oferta o) { return ofertaRepository.save(o); }
    @Override @Transactional public void eliminar(Long id) { ofertaRepository.deleteById(id); }
}