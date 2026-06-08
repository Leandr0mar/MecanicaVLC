package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.repositories.CitaRepository;
import com.example.dashboarvlc.services.CitaService;

import java.util.List;
import java.util.Optional;

@Service
public class CitaServiceImpl implements CitaService {
    @Autowired private CitaRepository citaRepository;

    @Override @Transactional(readOnly = true) public List<Cita> listarTodas() { return citaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Cita> buscarPorId(Long id) { return citaRepository.findById(id); }
    @Override @Transactional public Cita guardar(Cita cita) {
        if(cita.getEstado() == null) cita.setEstado(EstadoCita.PENDIENTE);
        return citaRepository.save(cita);
    }
    @Override @Transactional public Cita cambiarEstado(Long id, EstadoCita nuevoEstado) {
        return citaRepository.findById(id).map(c -> {
            c.setEstado(nuevoEstado);
            return citaRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }
    @Override @Transactional public void eliminar(Long id) { citaRepository.deleteById(id); }
}