package com.example.dashboarvlc.controllers.web.administrador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.dashboarvlc.models.Administrador;
import com.example.dashboarvlc.services.AdministradorService;

@Controller
@RequestMapping("/admin")
public class DashboardWebController {

    @Autowired
    private AdministradorService administradorService;

    @GetMapping("/dashboard")
    public String mostrarDashboard(Authentication authentication, Model model) {
        // 1. Obtener el email del administrador logueado desde la sesión
        String emailLogueado = authentication.getName();

        // 2. Buscar en la base de datos los datos específicos del administrador (ej. nivel_acceso)
        Administrador admin = administradorService.buscarPorEmail(emailLogueado)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado"));

        // 3. Pasar el objeto admin a la vista Thymeleaf (ej. para pintar su nombre o validar su nivel de acceso)
        model.addAttribute("adminLogueado", admin);
        
        // Retorna la plantilla HTML ubicada en templates/administrador/dashboard.html
        return "administrador/dashboard";
    }
}
