package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Servicio;
import com.example.dashboarvlc.repositories.ServicioRepository;
import com.example.dashboarvlc.services.ServicioService;

import java.util.List;
import java.util.Optional;

@Service
public class ServicioServiceImpl implements ServicioService {
    @Autowired private ServicioRepository servicioRepository;

    @Override @Transactional(readOnly = true) public List<Servicio> listarTodos() { return servicioRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Servicio> buscarPorId(Long id) { return servicioRepository.findById(id); }
    @Override @Transactional public Servicio guardar(Servicio s) { return servicioRepository.save(s); }
    @Override @Transactional public Servicio actualizar(Long id, Servicio s) {
        return servicioRepository.findById(id).map(existente -> {
            existente.setNombreServicio(s.getNombreServicio());
            existente.setDescripcionServicio(s.getDescripcionServicio());
            existente.setPrecioInicial(s.getPrecioInicial());
            return servicioRepository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }
    @Override @Transactional public void eliminar(Long id) { servicioRepository.deleteById(id); }
}