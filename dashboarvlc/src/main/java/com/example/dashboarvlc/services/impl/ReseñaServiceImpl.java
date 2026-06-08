package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Reseña;
import com.example.dashboarvlc.repositories.ReseñaRepository;
import com.example.dashboarvlc.services.ReseñaService;

import java.util.List;
import java.util.Optional;

@Service
public class ReseñaServiceImpl implements ReseñaService {
    @Autowired private ReseñaRepository reseñaRepository;

    @Override @Transactional(readOnly = true) public List<Reseña> listarTodas() { return reseñaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Reseña> buscarPorId(Long id) { return reseñaRepository.findById(id); }
    @Override @Transactional public Reseña guardar(Reseña r) { return reseñaRepository.save(r); }
    @Override @Transactional public void eliminar(Long id) { reseñaRepository.deleteById(id); }
}