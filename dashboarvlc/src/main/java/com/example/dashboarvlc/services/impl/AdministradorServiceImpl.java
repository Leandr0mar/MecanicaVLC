package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Administrador;
import com.example.dashboarvlc.repositories.AdministradorRepository;
import com.example.dashboarvlc.services.AdministradorService;

import java.util.List;
import java.util.Optional;

@Service
public class AdministradorServiceImpl implements AdministradorService {
    @Autowired private AdministradorRepository administradorRepository;

    @Override @Transactional(readOnly = true) public List<Administrador> listarTodos() { return administradorRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Administrador> buscarPorId(Long id) { return administradorRepository.findById(id); }
    @Override @Transactional(readOnly = true) public Optional<Administrador> buscarPorEmail(String email) { return administradorRepository.findByEmail(email); }
    @Override @Transactional public Administrador guardar(Administrador a) { return administradorRepository.save(a); }
    @Override @Transactional public Administrador actualizar(Long id, Administrador a) {
        return administradorRepository.findById(id).map(existente -> {
            existente.setNombre(a.getNombre()); existente.setApellido(a.getApellido());
            existente.setEmail(a.getEmail()); existente.setNivelAcceso(a.getNivelAcceso());
            return administradorRepository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Administrador no encontrado"));
    }
    @Override @Transactional public void eliminar(Long id) { administradorRepository.deleteById(id); }
}
