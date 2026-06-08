package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.dashboarvlc.models.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

}
