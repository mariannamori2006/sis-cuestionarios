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

    @Autowired
    private CuestionarioRepository cuestionarioRepository;

    public IntentoCuestionario iniciarIntento(IntentoCuestionario intento) {
        if (intento.getCuestionario() != null && intento.getCuestionario().getId() != null) {
            Cuestionario cuestionarioDb = cuestionarioRepository.findById(intento.getCuestionario().getId())
                    .orElseThrow(() -> new RuntimeException("Cuestionario no encontrado"));
            intento.setCuestionario(cuestionarioDb);
        }
        return intentoRepository.save(intento);
    }

    @Transactional
    public IntentoCuestionario finalizarIntento(UUID intentoId, List<DetalleIntento> respuestas) {
        IntentoCuestionario intento = intentoRepository.findById(intentoId)
                .orElseThrow(() -> new RuntimeException("Intento no encontrado"));

        int totalPreguntas = respuestas.size();
        int respuestasCorrectas = 0;

        for (DetalleIntento detalle : respuestas) {
            detalle.setIntento(intento);
            detalleRepository.save(detalle);

            if (detalle.getOpcionSeleccionada() != null) {
                OpcionRespuesta opcion = opcionRespuestaRepository.findById(detalle.getOpcionSeleccionada().getId())
                        .orElse(null);

                if (opcion != null && Boolean.TRUE.equals(opcion.getEsCorrecta())) {
                    respuestasCorrectas++;
                }
            }
        }

        double calificacionFinal = totalPreguntas > 0 ? ((double) respuestasCorrectas / totalPreguntas) * 20 : 0.0;

        intento.setCalificacion(calificacionFinal);
        intento.setFechaFin(LocalDateTime.now());

        return intentoRepository.save(intento);
    }
}