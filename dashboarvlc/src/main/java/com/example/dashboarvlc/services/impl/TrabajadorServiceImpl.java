package com.example.dashboarvlc.services.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Trabajador;
import com.example.dashboarvlc.repositories.TrabajadorRepository;
import com.example.dashboarvlc.services.TrabajadorService;

import java.util.List;
import java.util.Optional;

@Service
public class TrabajadorServiceImpl implements TrabajadorService {
    @Autowired private TrabajadorRepository trabajadorRepository;

    @Override @Transactional(readOnly = true) public List<Trabajador> listarTodos() { return trabajadorRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Trabajador> buscarPorId(Long id) { return trabajadorRepository.findById(id); }
    @Override @Transactional(readOnly = true) public Optional<Trabajador> buscarPorEmail(String email) { return trabajadorRepository.findByEmail(email); }    
    @Override @Transactional public Trabajador guardar(Trabajador t) { return trabajadorRepository.save(t); }
    @Override @Transactional public Trabajador actualizar(Long id, Trabajador t) {
        return trabajadorRepository.findById(id).map(existente -> {
            existente.setNombre(t.getNombre()); existente.setApellido(t.getApellido());
            existente.setDni(t.getDni()); existente.setEmail(t.getEmail()); existente.setEspecialidad(t.getEspecialidad());
            existente.setDisponibilidad(t.getDisponibilidad());
            return trabajadorRepository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Trabajador no encontrado"));
    }
    @Override @Transactional public void eliminar(Long id) { trabajadorRepository.deleteById(id); }
}