package com.nativatec.cuestionarios.dto;

import java.util.ArrayList;
import java.util.List;

public class EstadisticasDetalladasDTO {
    private Long totalRespuestas;
    private Double tasaAprobacion;
    private Double promedioGeneral;
    private Long alumnosUnicos;
    private DistribucionCalificacionesDTO distribucion;
    private List<CuestionarioEstadisticaItemDTO> cuestionarios = new ArrayList<>();
    private List<RendimientoMateriaDTO> rendimientoMaterias = new ArrayList<>();
    private List<RendimientoPreguntaDTO> rendimientoPreguntas = new ArrayList<>();

    public EstadisticasDetalladasDTO() {
    }

    public EstadisticasDetalladasDTO(Long totalRespuestas, Double tasaAprobacion, Double promedioGeneral,
                                    Long alumnosUnicos, DistribucionCalificacionesDTO distribucion,
                                    List<CuestionarioEstadisticaItemDTO> cuestionarios) {
        this.totalRespuestas = totalRespuestas;
        this.tasaAprobacion = tasaAprobacion;
        this.promedioGeneral = promedioGeneral;
        this.alumnosUnicos = alumnosUnicos;
        this.distribucion = distribucion;
        this.cuestionarios = cuestionarios != null ? cuestionarios : new ArrayList<>();
        this.rendimientoMaterias = new ArrayList<>();
        this.rendimientoPreguntas = new ArrayList<>();
    }

    public EstadisticasDetalladasDTO(Long totalRespuestas, Double tasaAprobacion, Double promedioGeneral,
                                    Long alumnosUnicos, DistribucionCalificacionesDTO distribucion,
                                    List<CuestionarioEstadisticaItemDTO> cuestionarios,
                                    List<RendimientoMateriaDTO> rendimientoMaterias,
                                    List<RendimientoPreguntaDTO> rendimientoPreguntas) {
        this.totalRespuestas = totalRespuestas;
        this.tasaAprobacion = tasaAprobacion;
        this.promedioGeneral = promedioGeneral;
        this.alumnosUnicos = alumnosUnicos;
        this.distribucion = distribucion;
        this.cuestionarios = cuestionarios != null ? cuestionarios : new ArrayList<>();
        this.rendimientoMaterias = rendimientoMaterias != null ? rendimientoMaterias : new ArrayList<>();
        this.rendimientoPreguntas = rendimientoPreguntas != null ? rendimientoPreguntas : new ArrayList<>();
    }

    public Long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(Long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public Double getTasaAprobacion() {
        return tasaAprobacion;
    }

    public void setTasaAprobacion(Double tasaAprobacion) {
        this.tasaAprobacion = tasaAprobacion;
    }

    public Double getPromedioGeneral() {
        return promedioGeneral;
    }

    public void setPromedioGeneral(Double promedioGeneral) {
        this.promedioGeneral = promedioGeneral;
    }

    public Long getAlumnosUnicos() {
        return alumnosUnicos;
    }

    public void setAlumnosUnicos(Long alumnosUnicos) {
        this.alumnosUnicos = alumnosUnicos;
    }

    public DistribucionCalificacionesDTO getDistribucion() {
        return distribucion;
    }

    public void setDistribucion(DistribucionCalificacionesDTO distribucion) {
        this.distribucion = distribucion;
    }

    public List<CuestionarioEstadisticaItemDTO> getCuestionarios() {
        return cuestionarios;
    }

    public void setCuestionarios(List<CuestionarioEstadisticaItemDTO> cuestionarios) {
        this.cuestionarios = cuestionarios;
    }

    public List<RendimientoMateriaDTO> getRendimientoMaterias() {
        return rendimientoMaterias;
    }

    public void setRendimientoMaterias(List<RendimientoMateriaDTO> rendimientoMaterias) {
        this.rendimientoMaterias = rendimientoMaterias;
    }

    public List<RendimientoPreguntaDTO> getRendimientoPreguntas() {
        return rendimientoPreguntas;
    }

    public void setRendimientoPreguntas(List<RendimientoPreguntaDTO> rendimientoPreguntas) {
        this.rendimientoPreguntas = rendimientoPreguntas;
    }
}
