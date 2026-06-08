package com.example.dashboarvlc.services;

import java.util.List;

import com.example.dashboarvlc.models.ItemsComprados;

public interface ItemsCompradosService {
    List<ItemsComprados> listarPorOrden(Long idOrden);
    ItemsComprados guardar(ItemsComprados item);
}