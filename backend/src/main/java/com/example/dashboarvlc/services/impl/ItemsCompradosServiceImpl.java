package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.ItemsComprados;
import com.example.dashboarvlc.repositories.ItemsCompradosRepository;
import com.example.dashboarvlc.services.ItemsCompradosService;

import java.util.List;

@Service
public class ItemsCompradosServiceImpl implements ItemsCompradosService {
    @Autowired private ItemsCompradosRepository itemsCompradosRepository;

    @Override @Transactional(readOnly = true) public List<ItemsComprados> listarPorOrden(Long idOrden) { 
        return itemsCompradosRepository.findAll().stream()
                .filter(item -> item.getOrdenCompra().getIdReserva().equals(idOrden)).toList();
    }
    @Override @Transactional public ItemsComprados guardar(ItemsComprados item) { return itemsCompradosRepository.save(item); }
}
