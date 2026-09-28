package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor; // <-- NUEVO

import com.example.dashboarvlc.models.Categoria;
import com.example.dashboarvlc.repositories.CategoriaRepository;
import com.example.dashboarvlc.services.CategoriaService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // <-- REEMPLAZA A @Autowired
public class CategoriaServiceImpl implements CategoriaService {
    
    private final CategoriaRepository categoriaRepository;

    @Override 
    @Transactional(readOnly = true) 
    public List<Categoria> listarTodas() { 
        return categoriaRepository.findAll(); 
    }

    @Override 
    @Transactional(readOnly = true) 
    public Optional<Categoria> buscarPorId(Long id) { 
        return categoriaRepository.findById(id); 
    }

    @Override 
    @Transactional 
    public Categoria guardar(Categoria c) { 
        return categoriaRepository.save(c); 
    }

    @Override 
    @Transactional 
    public void eliminar(Long id) { 
        categoriaRepository.deleteById(id); 
    }
}