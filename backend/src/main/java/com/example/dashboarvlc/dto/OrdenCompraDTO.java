package com.example.dashboarvlc.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrdenCompraDTO {
    private List<ItemCompraDTO> items;
}