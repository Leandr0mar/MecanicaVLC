package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.*;
import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.repositories.*;
import com.example.dashboarvlc.services.CitaService;

@Service
@RequiredArgsConstructor
public class CitaServiceImpl implements CitaService {
    
    private final CitaRepository citaRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final ClienteRepository clienteRepository;
    private final ServicioRepository servicioRepository;

    @Override @Transactional(readOnly = true) public List<Cita> listarTodas() { return citaRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Cita> buscarPorId(Long id) { return citaRepository.findById(id); }
    @Override @Transactional(readOnly = true) public List<Cita> listarPorCliente(String email) { return citaRepository.findByCliente_Email(email); }

    @Override 
    @Transactional 
    public Cita guardar(Cita cita, String emailCliente) {
        if(cita.getEstado() == null) cita.setEstado(EstadoCita.PENDIENTE);
        
        // 1. Asignar el Cliente que hizo la petición
        Cliente cliente = clienteRepository.findByEmail(emailCliente)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        cita.setCliente(cliente);

        // 2. Traer el precio inicial del servicio automáticamente
        Servicio servicio = servicioRepository.findById(cita.getServicio().getIdServicio())
            .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        cita.setMontoInicial(servicio.getPrecioInicial());

        // 3. Asignar un trabajador que esté libre en esa fecha y hora
        List<Trabajador> trabajadoresDisponibles = trabajadorRepository.findByDisponibilidadTrue();
        List<Cita> citasEnEsaHora = citaRepository.findByFechaAndHora(cita.getFecha(), cita.getHora());
        List<Trabajador> ocupados = citasEnEsaHora.stream().map(Cita::getTrabajador).toList();
        
        Trabajador asignado = trabajadoresDisponibles.stream()
            .filter(t -> !ocupados.contains(t))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Ya no hay disponibilidad para la hora solicitada"));
        
        cita.setTrabajador(asignado);
        return citaRepository.save(cita);
    }
    
    @Override @Transactional public Cita cambiarEstado(Long id, EstadoCita nuevoEstado) {
        return citaRepository.findById(id).map(c -> {
            c.setEstado(nuevoEstado); return citaRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }
    
    @Override @Transactional public void eliminar(Long id) { citaRepository.deleteById(id); }

    // FILTRO DINÁMICO DE HORARIOS
    @Override
    @Transactional(readOnly = true)
    public List<String> obtenerHorariosDisponibles(LocalDate fecha) {
        List<Trabajador> trabajadoresDisponibles = trabajadorRepository.findByDisponibilidadTrue();
        int totalTrabajadores = trabajadoresDisponibles.size();
        
        // Si no hay trabajadores activos (ej. feriado o cerrados), no hay horarios
        if (totalTrabajadores == 0) return List.of(); 
        
        List<String> horariosPosibles = List.of("08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00");
        List<Cita> citasDelDia = citaRepository.findByFecha(fecha);
        
        // Solo retornamos la hora si la cantidad de citas en esa hora es MENOR a los trabajadores disponibles
        return horariosPosibles.stream().filter(horaStr -> {
            LocalTime hora = LocalTime.parse(horaStr);
            long ocupados = citasDelDia.stream().filter(c -> c.getHora().getHour() == hora.getHour()).count();
            return ocupados < totalTrabajadores;
        }).toList();
    }

    @Override
    @Transactional
    public Cita reasignarTrabajador(Long idCita, Long idTrabajador) {
        Cita cita = citaRepository.findById(idCita)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            
        Trabajador nuevoTrabajador = trabajadorRepository.findById(idTrabajador)
            .orElseThrow(() -> new RuntimeException("Trabajador no encontrado"));
            
        cita.setTrabajador(nuevoTrabajador);
        return citaRepository.save(cita);
    }

    @Override 
    @Transactional 
    public Cita agregarObservacion(Long id, String observacion) {
        return citaRepository.findById(id).map(c -> {
            c.setObservaciones(observacion); 
            return citaRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }
}