package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nativatec.cuestionarios.entity.OpcionRespuesta;
import com.nativatec.cuestionarios.repository.OpcionRespuestaRepository;

@Service
public class OpcionRespuestaService {

    @Autowired
    private OpcionRespuestaRepository opcionRespuestaRepository;

    // Listar todas las opciones
    public List<OpcionRespuesta> obtenerTodas() {
        return opcionRespuestaRepository.findAll();
    }

    // Buscar opcion por ID
    public Optional<OpcionRespuesta> obtenerPorId(UUID id) {
        return opcionRespuestaRepository.findById(id);
    }

    // Guardar o actualizar una opcion
    public OpcionRespuesta guardarOpcion(OpcionRespuesta opcion) {
        return opcionRespuestaRepository.save(opcion);
    }

    // Eliminar una opcion
    public void eliminarOpcion(UUID id) {
        opcionRespuestaRepository.deleteById(id);
    }
}