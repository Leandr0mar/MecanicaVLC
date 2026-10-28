package com.example.dashboarvlc.repositories;

import com.example.dashboarvlc.models.SesionActiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SesionActivaRepository extends JpaRepository<SesionActiva, String> {
    @Query("""
            select s.usuarioId as usuarioId,
                   max(s.ultimaActividad) as ultimaActividad,
                   case when max(s.ultimaActividad) >= :corte then true else false end as conectado
            from SesionActiva s
            group by s.usuarioId
            """)
    List<ResumenPresencia> obtenerResumen(@Param("corte") LocalDateTime corte);

    @Modifying
    @Query("delete from SesionActiva s where s.ultimaActividad < :limite")
    int eliminarAnterioresA(@Param("limite") LocalDateTime limite);

    interface ResumenPresencia {
        Long getUsuarioId();
        LocalDateTime getUltimaActividad();
        Boolean getConectado();
    }
}