package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import java.util.List;

import com.example.dashboarvlc.models.Reseña;
import com.example.dashboarvlc.dto.ReseñaTrabajadorFilaDTO;

public interface ReseñaRepository extends JpaRepository<Reseña, Long> {
    @Query("select coalesce(avg(r.calificacion), 0.0D), count(r) from Reseña r where r.calificacion between 1 and 5")
    List<Object[]> resumenCalificaciones();

    @Query(value = "select new com.example.dashboarvlc.dto.ReseñaTrabajadorFilaDTO(" +
            "r.idReseña, r.calificacion, r.comentario, r.fechaReseña, c.idCita, c.fecha, s.nombreServicio, " +
            "cl.nombre, cl.apellido, cl.email, cl.telefono) " +
            "from Reseña r join r.cita c join c.trabajador t join c.cliente cl join c.servicio s " +
            "where t.email = :emailTrabajador " +
            "order by r.fechaReseña desc, r.idReseña desc",
            countQuery = "select count(r) from Reseña r join r.cita c join c.trabajador t " +
                    "where t.email = :emailTrabajador")
    Page<ReseñaTrabajadorFilaDTO> buscarPaginaTrabajador(
            @Param("emailTrabajador") String emailTrabajador, Pageable pageable);

    @Query("select coalesce(avg(r.calificacion), 0.0D), count(r) " +
            "from Reseña r join r.cita c join c.trabajador t " +
            "where t.email = :emailTrabajador and r.calificacion between 1 and 5")
    List<Object[]> resumenCalificacionesTrabajador(@Param("emailTrabajador") String emailTrabajador);
}
