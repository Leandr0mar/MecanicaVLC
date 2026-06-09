package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.Proveedor;
import com.example.dashboarvlc.repositories.ProveedorRepository;
import com.example.dashboarvlc.services.ProveedorService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {
    
    private final ProveedorRepository proveedorRepository;

    @Override 
    @Transactional(readOnly = true) 
    public List<Proveedor> listarTodos() { 
        return proveedorRepository.findAll(); 
    }

    @Override 
    @Transactional(readOnly = true) 
    public Optional<Proveedor> buscarPorId(Long id) { 
        return proveedorRepository.findById(id); 
    }

    @Override 
    @Transactional 
    public Proveedor guardar(Proveedor p) { 
        return proveedorRepository.save(p); 
    }

    @Override 
    @Transactional 
    public void eliminar(Long id) { 
        proveedorRepository.deleteById(id); 
    }
}