package com.example.dashboarvlc.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.dashboarvlc.models.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("select u from Usuario u where (:q = '' or lower(concat(cast(u.idUsuario as string),' ',coalesce(u.nombre,''),' ',coalesce(u.apellido,''),' ',coalesce(u.email,''),' ',coalesce(u.numeroDocumento,''),' ',coalesce(u.dni,''))) like lower(concat('%',:q,'%'))) " +
            "and (:rol is null or u.rol = :rol)")
    Page<Usuario> buscarPagina(@Param("q") String q, @Param("rol") Integer rol, Pageable pageable);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByDni(String dni);

    Optional<Usuario> findByNumeroDocumento(String numeroDocumento);
}
