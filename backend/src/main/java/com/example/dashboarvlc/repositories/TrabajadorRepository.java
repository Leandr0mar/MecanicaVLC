package com.example.dashboarvlc.repositories;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import com.example.dashboarvlc.models.Trabajador;
import jakarta.persistence.LockModeType;

public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    Optional<Trabajador> findByEmail(String email);
    // NUEVO: Traer solo trabajadores disponibles
    List<Trabajador> findByDisponibilidadTrue(); 

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Trabajador t where t.disponibilidad = true order by t.idUsuario")
    List<Trabajador> bloquearDisponiblesParaReserva();
}
