package com.example.dashboarvlc.repositories;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dashboarvlc.models.Trabajador;

public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    Optional<Trabajador> findByEmail(String email);
    // NUEVO: Traer solo trabajadores disponibles
    List<Trabajador> findByDisponibilidadTrue(); 
}