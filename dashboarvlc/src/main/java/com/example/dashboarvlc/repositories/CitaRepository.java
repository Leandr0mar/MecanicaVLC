package com.example.dashboarvlc.repositories;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.dto.CitaListaFilaDTO;
import com.example.dashboarvlc.dto.CitaTrabajadorFilaDTO;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    @Query(value = "select new com.example.dashboarvlc.dto.CitaListaFilaDTO(" +
            "c.idCita, c.fecha, c.hora, c.estado, c.montoInicial, c.pagoRegistrado, c.montoPagado, c.metodoPago, c.fechaPago, " +
            "cl.nombre, cl.apellido, cl.telefono, t.idUsuario, t.nombre, t.apellido, s.nombreServicio) " +
            "from Cita c join c.cliente cl left join c.trabajador t join c.servicio s " +
            "where (:q = '' or lower(concat(cast(c.idCita as string),' ',cast(c.fecha as string),' ',cast(c.hora as string),' ',coalesce(cl.nombre,''),' ',coalesce(cl.apellido,''),' ',coalesce(cl.email,''),' ',coalesce(cl.telefono,''),' ',coalesce(t.nombre,''),' ',coalesce(t.apellido,''),' ',coalesce(s.nombreServicio,''),' ',cast(c.estado as string),' ',coalesce(c.observaciones,''))) like lower(concat('%',:q,'%'))) " +
            "and (:estado = '' or cast(c.estado as string) = :estado) " +
            "order by case when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.PENDIENTE then 0 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.EN_PROGRESO then 1 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA and (c.pagoRegistrado = false or c.pagoRegistrado is null) then 2 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA then 3 else 4 end, c.fecha desc, c.hora desc",
            countQuery = "select count(c) from Cita c join c.cliente cl left join c.trabajador t join c.servicio s " +
                    "where (:q = '' or lower(concat(cast(c.idCita as string),' ',cast(c.fecha as string),' ',cast(c.hora as string),' ',coalesce(cl.nombre,''),' ',coalesce(cl.apellido,''),' ',coalesce(cl.email,''),' ',coalesce(cl.telefono,''),' ',coalesce(t.nombre,''),' ',coalesce(t.apellido,''),' ',coalesce(s.nombreServicio,''),' ',cast(c.estado as string),' ',coalesce(c.observaciones,''))) like lower(concat('%',:q,'%'))) " +
                    "and (:estado = '' or cast(c.estado as string) = :estado)")
    Page<CitaListaFilaDTO> buscarPaginaResumen(@Param("q") String q, @Param("estado") String estado, Pageable pageable);

    @EntityGraph(attributePaths = {"cliente", "trabajador", "servicio"})
    @Query(value = "select c from Cita c left join c.cliente cl left join c.trabajador tr left join c.servicio s " +
            "where (:q = '' or lower(concat(cast(c.idCita as string),' ',cast(c.fecha as string),' ',cast(c.hora as string),' ',coalesce(cl.nombre,''),' ',coalesce(cl.apellido,''),' ',coalesce(cl.email,''),' ',coalesce(cl.telefono,''),' ',coalesce(tr.nombre,''),' ',coalesce(tr.apellido,''),' ',coalesce(s.nombreServicio,''),' ',cast(c.estado as string),' ',coalesce(c.observaciones,''))) like lower(concat('%',:q,'%'))) " +
            "and (:estado = '' or cast(c.estado as string) = :estado) " +
            "order by case when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.PENDIENTE then 0 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.EN_PROGRESO then 1 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA and (c.pagoRegistrado = false or c.pagoRegistrado is null) then 2 " +
            "when c.estado = com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA then 3 else 4 end, c.fecha desc, c.hora desc",
            countQuery = "select count(c) from Cita c left join c.cliente cl left join c.trabajador tr left join c.servicio s " +
                    "where (:q = '' or lower(concat(cast(c.idCita as string),' ',cast(c.fecha as string),' ',cast(c.hora as string),' ',coalesce(cl.nombre,''),' ',coalesce(cl.apellido,''),' ',coalesce(cl.email,''),' ',coalesce(cl.telefono,''),' ',coalesce(tr.nombre,''),' ',coalesce(tr.apellido,''),' ',coalesce(s.nombreServicio,''),' ',cast(c.estado as string),' ',coalesce(c.observaciones,''))) like lower(concat('%',:q,'%'))) " +
                    "and (:estado = '' or cast(c.estado as string) = :estado)")
    Page<Cita> buscarPagina(@Param("q") String q, @Param("estado") String estado, Pageable pageable);

    @EntityGraph(attributePaths = {"cliente", "trabajador", "servicio"})
    List<Cita> findByTrabajador_EmailOrderByFechaAscHoraAsc(String email);

    @Query("select new com.example.dashboarvlc.dto.CitaTrabajadorFilaDTO(" +
            "c.idCita, c.fecha, c.hora, c.estado, c.observaciones, c.montoInicial, c.montoPagado, " +
            "c.metodoPago, c.pagoRegistrado, cl.nombre, cl.apellido, cl.telefono, cl.email, " +
            "cl.placaMototaxi, s.nombreServicio) " +
            "from Cita c join c.trabajador t join c.cliente cl join c.servicio s " +
            "where t.email = :email and c.fecha between :inicio and :fin " +
            "order by c.fecha asc, c.hora asc")
    List<CitaTrabajadorFilaDTO> buscarAgendaSemanalTrabajador(
            @Param("email") String email,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin);
    // NUEVO: Buscar cruces de horarios
    List<Cita> findByFecha(LocalDate fecha);
    List<Cita> findByFechaAndHora(LocalDate fecha, LocalTime hora);
    List<Cita> findByCliente_Email(String email);

    @Query("select c from Cita c where c.fecha = :fecha and c.estado not in (com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA, com.example.dashboarvlc.models.enums.EstadoCita.CANCELADA)")
    List<Cita> findReservasActivasDelDia(@Param("fecha") LocalDate fecha);

    @Query("select c from Cita c where c.fecha = :fecha and c.cliente.email = :email and c.estado not in (com.example.dashboarvlc.models.enums.EstadoCita.COMPLETADA, com.example.dashboarvlc.models.enums.EstadoCita.CANCELADA)")
    List<Cita> findReservasActivasDelCliente(@Param("fecha") LocalDate fecha, @Param("email") String email);

    @Query("select coalesce(sum(c.montoPagado), 0.0D) from Cita c where c.pagoRegistrado = true and c.fechaPago is not null")
    Double sumarIngresosPagados();

    @Query("select c.fechaPago, c.montoPagado from Cita c where c.pagoRegistrado = true and c.fechaPago between :inicio and :fin")
    List<Object[]> ingresosPagadosEntre(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    long countByFechaBetween(LocalDate inicio, LocalDate fin);

    long countByEstado(com.example.dashboarvlc.models.enums.EstadoCita estado);

    @Query("select c.estado, count(c) from Cita c group by c.estado")
    List<Object[]> contarPorEstado();

    @Query("select c.servicio.nombreServicio, count(c) from Cita c group by c.servicio.nombreServicio order by count(c) desc")
    List<Object[]> serviciosMasSolicitados(Pageable pageable);
}
