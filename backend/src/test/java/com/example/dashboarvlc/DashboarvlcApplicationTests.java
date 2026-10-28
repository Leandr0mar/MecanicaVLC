package com.example.dashboarvlc;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

// 1. IMPORTAMOS assertTrue (y assertNotNull)
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.dashboarvlc.services.ProductoService;

@SpringBootTest
class DashboarvlcApplicationTests {

    @Autowired
    private ProductoService productoService;

    @Test
    void verificarQueExistenProductosEnLaBaseDeDatos() {
        var productos = productoService.listarTodos();

        assertNotNull(productos, "La lista de productos no debería ser nula");
        assertTrue(productos.size() > 0, "Debería haber al menos 1 producto en la base de datos");
        
    }
}