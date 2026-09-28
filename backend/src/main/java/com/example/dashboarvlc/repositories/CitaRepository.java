package com.example.dashboarvlc.repositories;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dashboarvlc.models.Cita;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    // NUEVO: Buscar cruces de horarios
    List<Cita> findByFecha(LocalDate fecha);
    List<Cita> findByFechaAndHora(LocalDate fecha, LocalTime hora);
    List<Cita> findByCliente_Email(String email);
}