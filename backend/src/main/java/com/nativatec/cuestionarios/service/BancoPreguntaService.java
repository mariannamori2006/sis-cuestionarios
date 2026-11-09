package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.entity.BancoOpcionRespuesta;
import com.nativatec.cuestionarios.entity.BancoPregunta;
import com.nativatec.cuestionarios.entity.DificultadPregunta;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.BancoPreguntaRepository;
import com.nativatec.cuestionarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BancoPreguntaService {

    @Autowired
    private BancoPreguntaRepository bancoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<BancoPregunta> listarPreguntas(UUID profesorId, String materia, DificultadPregunta dificultad, String busqueda) {
        return bancoRepository.filtrarBanco(profesorId, materia, dificultad, busqueda);
    }

    @Transactional(readOnly = true)
    public Optional<BancoPregunta> obtenerPorId(UUID id) {
        return bancoRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<String> obtenerMateriasDisponibles(UUID profesorId) {
        return bancoRepository.obtenerMateriasDisponibles(profesorId);
    }

    @Transactional
    public BancoPregunta crearPregunta(BancoPregunta pregunta, UUID profesorId) {
        if (profesorId != null) {
            Usuario profesor = usuarioRepository.findById(profesorId).orElse(null);
            pregunta.setCreadoPor(profesor);
        }

        if (pregunta.getOpciones() != null) {
            for (BancoOpcionRespuesta opc : pregunta.getOpciones()) {
                opc.setPregunta(pregunta);
            }
        }

        return bancoRepository.save(pregunta);
    }

    @Transactional
    public BancoPregunta actualizarPregunta(UUID id, BancoPregunta nuevosDatos, UUID profesorId) {
        BancoPregunta existente = bancoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada en el banco con ID: " + id));

        existente.setMateria(nuevosDatos.getMateria() != null && !nuevosDatos.getMateria().trim().isEmpty() ? nuevosDatos.getMateria().trim() : "General");
        existente.setTema(nuevosDatos.getTema());
        existente.setDificultad(nuevosDatos.getDificultad() != null ? nuevosDatos.getDificultad() : DificultadPregunta.MEDIA);
        existente.setTipo(nuevosDatos.getTipo() != null ? nuevosDatos.getTipo() : existente.getTipo());
        existente.setTextoPregunta(nuevosDatos.getTextoPregunta());
        existente.setPuntosDefecto(nuevosDatos.getPuntosDefecto() != null && nuevosDatos.getPuntosDefecto() > 0 ? nuevosDatos.getPuntosDefecto() : 4.0);
        existente.setImagenUrl(nuevosDatos.getImagenUrl());
        existente.setExplicacion(nuevosDatos.getExplicacion());
        existente.setUpdatedAt(LocalDateTime.now());

        // Actualizar opciones
        existente.getOpciones().clear();
        if (nuevosDatos.getOpciones() != null) {
            for (BancoOpcionRespuesta opc : nuevosDatos.getOpciones()) {
                BancoOpcionRespuesta nueva = new BancoOpcionRespuesta(opc.getTextoOpcion(), opc.getEsCorrecta());
                nueva.setPregunta(existente);
                existente.getOpciones().add(nueva);
            }
        }

        return bancoRepository.save(existente);
    }

    @Transactional
    public void eliminarPregunta(UUID id) {
        if (!bancoRepository.existsById(id)) {
            throw new RuntimeException("Pregunta no encontrada en el banco con ID: " + id);
        }
        bancoRepository.deleteById(id);
    }
}

