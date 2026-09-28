package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.dashboarvlc.models.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
}
