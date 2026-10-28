package com.example.dashboarvlc.controllers.web.trabajador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.dashboarvlc.models.Trabajador;
import com.example.dashboarvlc.services.TrabajadorService;

@Controller
@RequestMapping("/trabajador")
public class AgendaWebController {

    @Autowired
    private TrabajadorService trabajadorService;

    @GetMapping("/agenda")
    public String mostrarAgenda(Authentication authentication, Model model) {
        // 1. Obtener el email del trabajador logueado desde la sesión
        String emailLogueado = authentication.getName();

        // 2. Buscar en la base de datos los datos completos del mecánico (ej. especialidad, disponibilidad)
        Trabajador trabajador = trabajadorService.buscarPorEmail(emailLogueado)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado"));

        // 3. Pasar el objeto trabajador a la vista Thymeleaf para personalizar su panel operativo
        model.addAttribute("trabajadorLogueado", trabajador);
        
        // Retorna la plantilla HTML ubicada en templates/trabajador/agenda.html
        return "trabajador/agenda";
    }
}
