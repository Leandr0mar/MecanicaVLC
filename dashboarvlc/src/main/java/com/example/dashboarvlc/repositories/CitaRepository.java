package com.example.dashboarvlc.repositories;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.dashboarvlc.models.Cita;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    // NUEVO: Buscar cruces de horarios
    List<Cita> findByFecha(LocalDate fecha);
    List<Cita> findByFechaAndHora(LocalDate fecha, LocalTime hora);
    List<Cita> findByCliente_Email(String email);

    @Query("select c from Cita c where c.fecha = :fecha and c.estado not in (com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA, com.example.dashboarvlc.models.enums.EstadoCita.CANCELADA)")
    List<Cita> findReservasActivasDelDia(@Param("fecha") LocalDate fecha);

    @Query("select c from Cita c where c.fecha = :fecha and c.cliente.email = :email and c.estado not in (com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA, com.example.dashboarvlc.models.enums.EstadoCita.CANCELADA)")
    List<Cita> findReservasActivasDelCliente(@Param("fecha") LocalDate fecha, @Param("email") String email);
}
