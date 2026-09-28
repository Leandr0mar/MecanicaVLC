package com.example.dashboarvlc.services;

import com.example.dashboarvlc.models.SesionActiva;
import com.example.dashboarvlc.models.Usuario;
import com.example.dashboarvlc.repositories.SesionActivaRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PresenciaService {
    private static final int VENTANA_CONECTADO_SEGUNDOS = 60;
    private static final int RETENCION_DIAS = 30;

    private final SesionActivaRepository sesionActivaRepository;

    @Transactional
    public void registrarActividad(Usuario usuario, HttpSession sesion) {
        String hash = hashSesion(sesion.getId());
        SesionActiva registro = sesionActivaRepository.findById(hash).orElseGet(SesionActiva::new);
        registro.setSessionHash(hash);
        registro.setUsuarioId(usuario.getIdUsuario());
        registro.setUltimaActividad(LocalDateTime.now());
        sesionActivaRepository.save(registro);
    }

    @Transactional
    public void cerrarSesion(HttpSession sesion) {
        if (sesion != null) {
            sesionActivaRepository.deleteById(hashSesion(sesion.getId()));
        }
    }

    @Transactional(readOnly = true)
    public List<SesionActivaRepository.ResumenPresencia> obtenerResumen() {
        return sesionActivaRepository.obtenerResumen(LocalDateTime.now().minusSeconds(VENTANA_CONECTADO_SEGUNDOS));
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void limpiarSesionesAntiguas() {
        sesionActivaRepository.eliminarAnterioresA(LocalDateTime.now().minusDays(RETENCION_DIAS));
    }

    private String hashSesion(String sessionId) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(sessionId.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }
}