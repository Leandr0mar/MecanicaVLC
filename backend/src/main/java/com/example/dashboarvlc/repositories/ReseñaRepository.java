package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.example.dashboarvlc.models.Reseña;

public interface ReseñaRepository extends JpaRepository<Reseña, Long> {
    @Query("select coalesce(avg(r.calificacion), 0.0D), count(r) from Reseña r where r.calificacion between 1 and 5")
    List<Object[]> resumenCalificaciones();
}
