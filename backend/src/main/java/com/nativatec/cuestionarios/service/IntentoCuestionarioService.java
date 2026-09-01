package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.entity.*;
import com.nativatec.cuestionarios.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class IntentoCuestionarioService {
    @Autowired
    private IntentoCuestionarioRepository intentoRepository;

    @Autowired
    private DetalleIntentoRepository detalleRepository;

    @Autowired
    private OpcionRespuestaRepository opcionRespuestaRepository;

    // Iniciar un intento para un invitado o usuario
    public IntentoCuestionario iniciarIntento(IntentoCuestionario intento) {
        return intentoRepository.save(intento);
    }

    // Registrar respuesta y calcular calificacion total
    @Transactional
    public IntentoCuestionario finalizarIntento(UUID intentoId, List<DetalleIntento> respuestas) {
        IntentoCuestionario intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new RuntimeException("Intento no encontrado"));

        int totalPreguntas = respuestas.size();
        int respuestasCorrectas = 0;

        for (DetalleIntento detalle : respuestas) {
            detalle.setIntento(intento);
            detalleRepository.save(detalle);

            // Verificar respuesta
            if (detalle.getOpcionSeleccionada() != null) {
                OpcionRespuesta opcion = opcionRespuestaRepository.findById(detalle.getOpcionSeleccionada().getId())
                        .orElse(null);

                if (opcion != null && Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                    respuestasCorrectas++;
                }
            }
        }

        // Calcular calificacion
        double calificacionFinal = totalPreguntas > 0 ? ((double) respuestasCorrectas / totalPreguntas) * 20 : 0.0;

        intento.setCalificacion(calificacionFinal);
        intento.setFechaFin(LocalDateTime.now());

        return intentoRepository.save(intento);
    }
}
