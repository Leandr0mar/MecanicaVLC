package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.Reseña;
import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.repositories.ReseñaRepository;
import com.example.dashboarvlc.repositories.CitaRepository;
import com.example.dashboarvlc.services.ReseñaService;
import com.example.dashboarvlc.dto.ReseñaDTO;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Usamos Lombok para inyecciones limpias
public class ReseñaServiceImpl implements ReseñaService {
    
    private final ReseñaRepository reseñaRepository;
    private final CitaRepository citaRepository;

    @Override @Transactional(readOnly = true) public List<Reseña> listarTodas() { return reseñaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Reseña> buscarPorId(Long id) { return reseñaRepository.findById(id); }
    @Override @Transactional public Reseña guardar(Reseña r) { return reseñaRepository.save(r); }
    @Override @Transactional public void eliminar(Long id) { reseñaRepository.deleteById(id); }

    @Override
    @Transactional
    public Reseña crearReseña(ReseñaDTO dto, String emailCliente) {
        Cita cita = citaRepository.findById(dto.getIdCita())
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        
        // 1. Validar que la cita le pertenece al cliente logueado
        if (!cita.getCliente().getEmail().equals(emailCliente)) {
            throw new RuntimeException("No tienes permiso para calificar este servicio");
        }
        
        // 2. Validar que el servicio ya haya finalizado
        if (!cita.getEstado().name().equals("COMPLETADA")) {
            throw new RuntimeException("Solo puedes calificar servicios que ya han sido completados");
        }

        // 3. Validar que no haya sido calificada antes
        if (cita.getReseña() != null) {
            throw new RuntimeException("Este servicio ya fue calificado anteriormente");
        }

        Reseña reseña = new Reseña();
        reseña.setCalificacion(dto.getCalificacion());
        reseña.setComentario(dto.getComentario());
        reseña.setCita(cita);
        
        return reseñaRepository.save(reseña);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Reseña> listarMisReseñas(String emailTrabajador) {
        return reseñaRepository.findAll().stream()
            .filter(r -> r.getCita() != null 
                      && r.getCita().getTrabajador() != null 
                      && r.getCita().getTrabajador().getEmail().equals(emailTrabajador))
            .toList();
    }
}