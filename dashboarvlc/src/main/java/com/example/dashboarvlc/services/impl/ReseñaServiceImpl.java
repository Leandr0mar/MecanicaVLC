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
import com.example.dashboarvlc.dto.ReseñaTrabajadorDTO;
import com.example.dashboarvlc.dto.ReseñaTrabajadorFilaDTO;
import com.example.dashboarvlc.dto.ReseñaTrabajadorPaginaDTO;
import org.springframework.data.domain.PageRequest;

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
    public ReseñaTrabajadorPaginaDTO listarPaginaMisReseñas(String emailTrabajador, int pagina, int tamano) {
        var paginaReseñas = reseñaRepository.buscarPaginaTrabajador(
                emailTrabajador, PageRequest.of(pagina, tamano));
        var resumen = reseñaRepository.resumenCalificacionesTrabajador(emailTrabajador);
        Object[] valoresResumen = resumen.isEmpty() ? new Object[]{0.0D, 0L} : resumen.get(0);
        double promedio = valoresResumen[0] == null ? 0.0D : ((Number) valoresResumen[0]).doubleValue();

        List<ReseñaTrabajadorDTO> contenido = paginaReseñas.getContent().stream()
                .map(this::mapearReseñaTrabajador)
                .toList();

        return new ReseñaTrabajadorPaginaDTO(
                contenido,
                paginaReseñas.getNumber(),
                paginaReseñas.getSize(),
                paginaReseñas.getTotalElements(),
                paginaReseñas.getTotalPages(),
                promedio);
    }

    private ReseñaTrabajadorDTO mapearReseñaTrabajador(ReseñaTrabajadorFilaDTO reseña) {
        return new ReseñaTrabajadorDTO(
                reseña.idReseña(),
                reseña.calificacion(),
                reseña.comentario(),
                reseña.fechaReseña(),
                new ReseñaTrabajadorDTO.Cita(
                        reseña.idCita(),
                        reseña.fechaCita(),
                        new ReseñaTrabajadorDTO.Cliente(
                                reseña.nombreCliente(), reseña.apellidoCliente(), reseña.emailCliente(), reseña.telefonoCliente()),
                        new ReseñaTrabajadorDTO.Servicio(reseña.nombreServicio())));
    }
}
