package com.nativatec.cuestionarios.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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

    @Autowired
    private com.nativatec.cuestionarios.repository.DetalleIntentoRepository detalleRepository;

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

    // Listar cuestionarios de un profesor específico con sus métricas calculadas
    public List<Cuestionario> obtenerPorProfesor(UUID profesorId) {
        List<Cuestionario> cuestionarios = cuestionarioRepository.findByCreadoPorId(profesorId);
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

    // Actualizar cuestionario existente
    @org.springframework.transaction.annotation.Transactional
    public Optional<Cuestionario> actualizarCuestionario(UUID id, Cuestionario modificado) {
        return cuestionarioRepository.findById(id).map(existente -> {
            existente.setTitulo(modificado.getTitulo());
            existente.setDescripcion(modificado.getDescripcion());
            existente.setTiempoLimiteMinutos(modificado.getTiempoLimiteMinutos());
            if (modificado.getOrdenAleatorio() != null) {
                existente.setOrdenAleatorio(modificado.getOrdenAleatorio());
            }
            if (modificado.getModoSeguro() != null) {
                existente.setModoSeguro(modificado.getModoSeguro());
            }
            if (modificado.getLimiteAdvertencias() != null) {
                existente.setLimiteAdvertencias(modificado.getLimiteAdvertencias());
            }

            existente.setFechaInicio(modificado.getFechaInicio());
            existente.setFechaFin(modificado.getFechaFin());
            if (modificado.getLimiteIntentos() != null) {
                existente.setLimiteIntentos(modificado.getLimiteIntentos());
            }
            if (modificado.getTipoCalificacionIntentos() != null) {
                existente.setTipoCalificacionIntentos(modificado.getTipoCalificacionIntentos());
            }

            if (modificado.getCodigoAcceso() != null && !modificado.getCodigoAcceso().trim().isEmpty()) {
                existente.setCodigoAcceso(modificado.getCodigoAcceso().trim());
            }

            if (modificado.getPreguntas() != null) {
                List<com.nativatec.cuestionarios.entity.Pregunta> actuales = existente.getPreguntas();
                List<com.nativatec.cuestionarios.entity.Pregunta> nuevas = modificado.getPreguntas();

                // 1. Identificar preguntas que se van a eliminar
                Set<UUID> idsNuevas = new HashSet<>();
                for (com.nativatec.cuestionarios.entity.Pregunta n : nuevas) {
                    if (n.getId() != null) {
                        idsNuevas.add(n.getId());
                    }
                }

                List<com.nativatec.cuestionarios.entity.Pregunta> preguntasAEliminar = new ArrayList<>();
                if (!idsNuevas.isEmpty()) {
                    for (com.nativatec.cuestionarios.entity.Pregunta act : actuales) {
                        if (act.getId() != null && !idsNuevas.contains(act.getId())) {
                            preguntasAEliminar.add(act);
                        }
                    }
                } else if (nuevas.size() < actuales.size()) {
                    for (int i = nuevas.size(); i < actuales.size(); i++) {
                        preguntasAEliminar.add(actuales.get(i));
                    }
                }

                // Desvincular opciones y detalles para cada pregunta que se elimina
                for (com.nativatec.cuestionarios.entity.Pregunta pEliminar : preguntasAEliminar) {
                    if (pEliminar.getOpciones() != null) {
                        for (com.nativatec.cuestionarios.entity.OpcionRespuesta o : pEliminar.getOpciones()) {
                            if (o.getId() != null) {
                                detalleRepository.desvincularOpcionSeleccionada(o.getId());
                            }
                        }
                    }
                    if (pEliminar.getId() != null) {
                        detalleRepository.eliminarPorPreguntaId(pEliminar.getId());
                    }
                    actuales.remove(pEliminar);
                }
                detalleRepository.flush();

                // 2. Actualizar las preguntas restantes o insertar nuevas
                int orden = 1;
                for (int i = 0; i < nuevas.size(); i++) {
                    com.nativatec.cuestionarios.entity.Pregunta nueva = nuevas.get(i);
                    com.nativatec.cuestionarios.entity.Pregunta act = null;

                    if (nueva.getId() != null) {
                        for (com.nativatec.cuestionarios.entity.Pregunta a : actuales) {
                            if (nueva.getId().equals(a.getId())) {
                                act = a;
                                break;
                            }
                        }
                    } else if (i < actuales.size()) {
                        act = actuales.get(i);
                    }

                    if (act != null) {
                        act.setTextoPregunta(nueva.getTextoPregunta());
                        act.setTipo(nueva.getTipo());
                        act.setImagenUrl(nueva.getImagenUrl());
                        act.setOrden(orden++);

                        if (nueva.getOpciones() != null) {
                            List<com.nativatec.cuestionarios.entity.OpcionRespuesta> opcActuales = act.getOpciones();
                            List<com.nativatec.cuestionarios.entity.OpcionRespuesta> opcNuevas = nueva.getOpciones();

                            int opcComunes = Math.min(opcActuales.size(), opcNuevas.size());
                            for (int j = 0; j < opcComunes; j++) {
                                opcActuales.get(j).setTextoOpcion(opcNuevas.get(j).getTextoOpcion());
                                opcActuales.get(j).setEsCorrecta(opcNuevas.get(j).getEsCorrecta());
                            }

                            for (int j = opcComunes; j < opcNuevas.size(); j++) {
                                com.nativatec.cuestionarios.entity.OpcionRespuesta nuevaOpc = opcNuevas.get(j);
                                nuevaOpc.setPregunta(act);
                                opcActuales.add(nuevaOpc);
                            }

                            // Desvincular opciones eliminadas antes de remover de la lista
                            while (opcActuales.size() > opcNuevas.size()) {
                                com.nativatec.cuestionarios.entity.OpcionRespuesta opcAEliminar = opcActuales.remove(opcActuales.size() - 1);
                                if (opcAEliminar.getId() != null) {
                                    detalleRepository.desvincularOpcionSeleccionada(opcAEliminar.getId());
                                }
                            }
                        }
                    } else {
                        nueva.setCuestionario(existente);
                        nueva.setOrden(orden++);
                        if (nueva.getOpciones() != null) {
                            for (com.nativatec.cuestionarios.entity.OpcionRespuesta o : nueva.getOpciones()) {
                                o.setPregunta(nueva);
                            }
                        }
                        actuales.add(nueva);
                    }
                }
                detalleRepository.flush();
            }

            return cuestionarioRepository.save(existente);
        });
    }

    // Eliminar cuestionario y sus intentos/detalles asociados
    @org.springframework.transaction.annotation.Transactional
    public void eliminarCuestionario(UUID id) {
        List<com.nativatec.cuestionarios.entity.IntentoCuestionario> intentos = intentoRepository.findByCuestionarioId(id);
        for (com.nativatec.cuestionarios.entity.IntentoCuestionario intento : intentos) {
            detalleRepository.deleteAll(detalleRepository.findByIntentoId(intento.getId()));
            intentoRepository.delete(intento);
        }
        cuestionarioRepository.deleteById(id);
    }
}

