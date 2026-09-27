package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.repository.CuestionarioRepository;
import com.nativatec.cuestionarios.repository.IntentoCuestionarioRepository;

@Service
public class CuestionarioService {

    @Autowired
    private CuestionarioRepository cuestionarioRepository;

    @Autowired
    private IntentoCuestionarioRepository intentoRepository;

    // Listar todos los cuestionarios con sus métricas calculadas desde la base de datos
    public List<Cuestionario> obtenerTodos() {
        List<Cuestionario> cuestionarios = cuestionarioRepository.findAll();
        for (Cuestionario c : cuestionarios) {
            if (c.getId() != null) {
                Long totalRespuestas = intentoRepository.contarRespuestasPorCuestionario(c.getId());
                Long alumnosUnicos = intentoRepository.contarAlumnosUnicosPorCuestionario(c.getId());
                Double avg = intentoRepository.obtenerPromedioPorCuestionario(c.getId());

                c.setTotalRespuestas(totalRespuestas != null ? totalRespuestas : 0L);
                c.setAlumnosUnicos(alumnosUnicos != null ? alumnosUnicos : 0L);
                c.setPromedioCalificacion(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
            }
        }
        return cuestionarios;
    }

    // Buscar cuestionario por id
    public Optional<Cuestionario> obtenerPorId(UUID id) {
        Optional<Cuestionario> optional = cuestionarioRepository.findById(id);
        optional.ifPresent(c -> {
            Long totalRespuestas = intentoRepository.contarRespuestasPorCuestionario(c.getId());
            Long alumnosUnicos = intentoRepository.contarAlumnosUnicosPorCuestionario(c.getId());
            Double avg = intentoRepository.obtenerPromedioPorCuestionario(c.getId());

            c.setTotalRespuestas(totalRespuestas != null ? totalRespuestas : 0L);
            c.setAlumnosUnicos(alumnosUnicos != null ? alumnosUnicos : 0L);
            c.setPromedioCalificacion(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        });
        return optional;
    }

    // Buscar cuestionario por código de acceso
    public Optional<Cuestionario> obtenerPorCodigoAcceso(String codigoAcceso) {
        return cuestionarioRepository.findByCodigoAcceso(codigoAcceso);
    }

    // Generar código numérico de 6 dígitos único
    public String generarCodigoAccesoNumericoUnico() {
        java.util.Random random = new java.util.Random();
        String codigo;
        do {
            int num = 100000 + random.nextInt(900000);
            codigo = String.valueOf(num);
        } while (cuestionarioRepository.findByCodigoAcceso(codigo).isPresent());
        return codigo;
    }

    // Crear o actualizar un cuestionario
    public Cuestionario guardarCuestionario(Cuestionario cuestionario) {
        if (cuestionario.getCodigoAcceso() == null || cuestionario.getCodigoAcceso().trim().isEmpty()) {
            cuestionario.setCodigoAcceso(generarCodigoAccesoNumericoUnico());
        }

        if (cuestionario.getPreguntas() != null) {
            int orden = 1;
            for (com.nativatec.cuestionarios.entity.Pregunta p : cuestionario.getPreguntas()) {
                p.setCuestionario(cuestionario);
                if (p.getOrden() == null) {
                    p.setOrden(orden++);
                }
                if (p.getOpciones() != null) {
                    for (com.nativatec.cuestionarios.entity.OpcionRespuesta o : p.getOpciones()) {
                        o.setPregunta(p);
                    }
                }
            }
        }
        return cuestionarioRepository.save(cuestionario);
    }

    // Eliminar cuestinario
    public void eliminarCuestionario(UUID id) {
        cuestionarioRepository.deleteById(id);
    }

}

