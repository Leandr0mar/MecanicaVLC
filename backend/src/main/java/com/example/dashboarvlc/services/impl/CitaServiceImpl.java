package com.example.dashboarvlc.services.impl;

import com.example.dashboarvlc.dto.RegistroPagoCitaRequest;
import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.models.Servicio;
import com.example.dashboarvlc.models.Trabajador;
import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.repositories.CitaRepository;
import com.example.dashboarvlc.repositories.ClienteRepository;
import com.example.dashboarvlc.repositories.ServicioRepository;
import com.example.dashboarvlc.repositories.TrabajadorRepository;
import com.example.dashboarvlc.services.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CitaServiceImpl implements CitaService {
    private static final List<LocalTime> HORARIOS_POSIBLES = List.of(
        LocalTime.of(8, 0), LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
        LocalTime.of(14, 0), LocalTime.of(15, 0), LocalTime.of(16, 0), LocalTime.of(17, 0)
    );

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
        if (cita.getFecha() == null || cita.getHora() == null || cita.getServicio() == null || cita.getServicio().getIdServicio() == null) {
            throw new IllegalArgumentException("Indica servicio, fecha y hora para reservar");
        }
        if (cita.getFecha().isBefore(LocalDate.now())) throw new IllegalArgumentException("No se puede reservar en una fecha pasada");

        Cliente cliente = clienteRepository.findByEmail(emailCliente)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        Servicio servicio = servicioRepository.findById(cita.getServicio().getIdServicio())
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));
        int duracion = servicio.getDuracionEstimadaMinutos() == null ? 60 : servicio.getDuracionEstimadaMinutos();
        validarDentroDelHorario(cita.getFecha(), cita.getHora(), duracion);

        // Serialize simultaneous bookings on the worker rows before checking capacity.
        List<Trabajador> disponibles = trabajadorRepository.bloquearDisponiblesParaReserva();
        List<Cita> reservas = citaRepository.findReservasActivasDelDia(cita.getFecha());
        if (citaRepository.findReservasActivasDelCliente(cita.getFecha(), emailCliente).stream()
            .anyMatch(otra -> seSolapan(cita.getHora(), duracion, otra))) {
            throw new IllegalArgumentException("Ya tienes otro servicio reservado en ese horario");
        }

        Trabajador asignado = disponibles.stream()
            .filter(trabajador -> reservas.stream().noneMatch(otra ->
                otra.getTrabajador() != null
                    && otra.getTrabajador().getIdUsuario().equals(trabajador.getIdUsuario())
                    && seSolapan(cita.getHora(), duracion, otra)))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Ya no hay disponibilidad para la duración del servicio solicitado"));

        // Never trust role, customer, employee, price, or initial state sent by the browser.
        cita.setCliente(cliente);
        cita.setTrabajador(asignado);
        cita.setServicio(servicio);
        cita.setMontoInicial(servicio.getPrecioInicial());
        cita.setEstado(EstadoCita.PENDIENTE);
        cita.setPagoRegistrado(false);
        cita.setMontoPagado(null);
        cita.setMetodoPago(null);
        cita.setFechaPago(null);
        return citaRepository.save(cita);
    }

    @Override
    @Transactional
    public Cita cambiarEstado(Long id, EstadoCita nuevoEstado, String emailActor, boolean administrador, boolean trabajador, boolean clienteActor) {
        Cita cita = citaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        EstadoCita estadoActual = cita.getEstado();
        if (administrador && estadoActual == nuevoEstado) return cita;

        if (clienteActor) {
            if (cita.getCliente() == null || !cita.getCliente().getEmail().equalsIgnoreCase(emailActor)
                || estadoActual != EstadoCita.PENDIENTE || nuevoEstado != EstadoCita.CANCELADA
                || !LocalDateTime.of(cita.getFecha(), cita.getHora()).isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Solo puedes cancelar tus citas pendientes antes de la hora reservada");
            }
        } else if (trabajador && !administrador) {
            if (cita.getTrabajador() == null || !cita.getTrabajador().getEmail().equalsIgnoreCase(emailActor)
                || !((estadoActual == EstadoCita.PENDIENTE && nuevoEstado == EstadoCita.EN_PROGRESO)
                  || (estadoActual == EstadoCita.EN_PROGRESO && nuevoEstado == EstadoCita.COMPLETADA))) {
                throw new IllegalArgumentException("No puedes realizar ese cambio de estado para esta cita");
            }
        } else if (administrador) {
            boolean transicionPermitida = (estadoActual == EstadoCita.PENDIENTE && (nuevoEstado == EstadoCita.EN_PROGRESO || nuevoEstado == EstadoCita.CANCELADA))
                || (estadoActual == EstadoCita.EN_PROGRESO && (nuevoEstado == EstadoCita.COMPLETADA || nuevoEstado == EstadoCita.CANCELADA));
            if (!transicionPermitida) throw new IllegalArgumentException("La transición de estado solicitada no está permitida");
        } else {
            throw new IllegalArgumentException("No tienes permiso para actualizar esta cita");
        }

        cita.setEstado(nuevoEstado);
        return citaRepository.save(cita);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Cita cita = citaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        if (cita.getEstado() != EstadoCita.PENDIENTE || Boolean.TRUE.equals(cita.getPagoRegistrado())) {
            throw new IllegalArgumentException("Solo se pueden eliminar citas pendientes y sin pagos; conserva el historial de servicios atendidos");
        }
        citaRepository.delete(cita);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> obtenerHorariosDisponibles(LocalDate fecha, Long idServicio) {
        if (fecha == null || idServicio == null || fecha.isBefore(LocalDate.now())) return List.of();
        Servicio servicio = servicioRepository.findById(idServicio).orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));
        int duracion = servicio.getDuracionEstimadaMinutos() == null ? 60 : servicio.getDuracionEstimadaMinutos();
        List<Trabajador> disponibles = trabajadorRepository.findByDisponibilidadTrue();
        if (disponibles.isEmpty()) return List.of();
        List<Cita> reservas = citaRepository.findReservasActivasDelDia(fecha);

        return HORARIOS_POSIBLES.stream()
            .filter(hora -> horarioLaboralValido(hora, duracion))
            .filter(hora -> !fecha.equals(LocalDate.now()) || LocalDateTime.of(fecha, hora).isAfter(LocalDateTime.now()))
            .filter(hora -> disponibles.stream().anyMatch(trabajador -> reservas.stream().noneMatch(otra ->
                otra.getTrabajador() != null
                    && otra.getTrabajador().getIdUsuario().equals(trabajador.getIdUsuario())
                    && seSolapan(hora, duracion, otra))))
            .map(LocalTime::toString)
            .toList();
    }

    @Override
    @Transactional
    public Cita reasignarTrabajador(Long idCita, Long idTrabajador) {
        Cita cita = citaRepository.findById(idCita).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        Trabajador nuevoTrabajador = trabajadorRepository.findById(idTrabajador).orElseThrow(() -> new IllegalArgumentException("Trabajador no encontrado"));
        if (!Boolean.TRUE.equals(nuevoTrabajador.getDisponibilidad())) throw new IllegalArgumentException("El trabajador seleccionado no está disponible");
        if (cita.getEstado() == EstadoCita.CANCELADA || cita.getEstado() == EstadoCita.COMPLETADA) throw new IllegalArgumentException("No se puede reasignar una cita finalizada");
        int duracion = cita.getServicio().getDuracionEstimadaMinutos() == null ? 60 : cita.getServicio().getDuracionEstimadaMinutos();
        boolean ocupado = citaRepository.findReservasActivasDelDia(cita.getFecha()).stream()
            .filter(otra -> !otra.getIdCita().equals(cita.getIdCita()))
            .anyMatch(otra -> otra.getTrabajador() != null
                && otra.getTrabajador().getIdUsuario().equals(nuevoTrabajador.getIdUsuario())
                && seSolapan(cita.getHora(), duracion, otra));
        if (ocupado) throw new IllegalArgumentException("El trabajador ya tiene un servicio que se cruza con ese horario");
        cita.setTrabajador(nuevoTrabajador);
        return citaRepository.save(cita);
    }

    @Override
    @Transactional
    public Cita agregarObservacion(Long id, String observacion, String emailActor, boolean administrador) {
        Cita cita = citaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        if (!administrador && (cita.getTrabajador() == null || !cita.getTrabajador().getEmail().equalsIgnoreCase(emailActor))) {
            throw new IllegalArgumentException("Solo el trabajador asignado o un administrador puede editar las notas");
        }
        cita.setObservaciones(observacion);
        return citaRepository.save(cita);
    }

    @Override
    @Transactional
    public Cita registrarPago(Long id, RegistroPagoCitaRequest pago, boolean administrador) {
        if (!administrador) throw new IllegalArgumentException("Solo un administrador puede confirmar el pago");
        Cita cita = citaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        if (cita.getEstado() != EstadoCita.COMPLETADA) throw new IllegalArgumentException("Registra el pago después de completar el servicio");
        if (Boolean.TRUE.equals(cita.getPagoRegistrado())) throw new IllegalArgumentException("El pago de esta cita ya fue registrado");
        if (pago.getMontoPagado() == null || pago.getMontoPagado() < 0 || pago.getMetodoPago() == null) {
            throw new IllegalArgumentException("Indica un monto válido y el método de pago");
        }
        cita.setMontoPagado(pago.getMontoPagado());
        cita.setMetodoPago(pago.getMetodoPago());
        cita.setFechaPago(LocalDateTime.now());
        cita.setPagoRegistrado(true);
        return citaRepository.save(cita);
    }

    private boolean seSolapan(LocalTime inicioSolicitado, int duracionSolicitada, Cita existente) {
        LocalTime inicioExistente = existente.getHora();
        int duracionExistente = existente.getServicio() == null || existente.getServicio().getDuracionEstimadaMinutos() == null
            ? 60 : existente.getServicio().getDuracionEstimadaMinutos();
        LocalTime finSolicitado = inicioSolicitado.plusMinutes(duracionSolicitada);
        LocalTime finExistente = inicioExistente.plusMinutes(duracionExistente);
        return inicioSolicitado.isBefore(finExistente) && inicioExistente.isBefore(finSolicitado);
    }

    private void validarDentroDelHorario(LocalDate fecha, LocalTime hora, int duracion) {
        if (!HORARIOS_POSIBLES.contains(hora) || !horarioLaboralValido(hora, duracion)) {
            throw new IllegalArgumentException("El horario solicitado está fuera de los turnos disponibles para este servicio");
        }
        if (fecha.equals(LocalDate.now()) && !LocalDateTime.of(fecha, hora).isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("No se puede reservar una hora que ya pasó");
        }
    }

    private boolean horarioLaboralValido(LocalTime inicio, int duracion) {
        LocalTime fin = inicio.plusMinutes(duracion);
        if (!inicio.isBefore(LocalTime.NOON)) return !fin.isAfter(LocalTime.of(18, 0));
        return !fin.isAfter(LocalTime.NOON);
    }
}
