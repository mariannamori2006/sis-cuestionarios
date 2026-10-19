package com.nativatec.cuestionarios.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AuditoriaIntentoItemDTO {
    private UUID intentoId;
    private String nombreAlumno;
    private String iniciales;
    private Double calificacion;
    private String notaTexto;
    private String fecha;
    private String hora;
    private Boolean tienePreguntasEscritas;
    private Integer advertencias = 0;
    private Boolean finalizadoPorInfraccion = false;
    private List<AuditoriaDetalleItemDTO> detalles = new ArrayList<>();

    public AuditoriaIntentoItemDTO() {
    }

    public AuditoriaIntentoItemDTO(UUID intentoId, String nombreAlumno, String iniciales, Double calificacion,
                                  String notaTexto, String fecha, String hora, Boolean tienePreguntasEscritas,
                                  List<AuditoriaDetalleItemDTO> detalles) {
        this(intentoId, nombreAlumno, iniciales, calificacion, notaTexto, fecha, hora, tienePreguntasEscritas, 0, false, detalles);
    }

    public AuditoriaIntentoItemDTO(UUID intentoId, String nombreAlumno, String iniciales, Double calificacion,
                                  String notaTexto, String fecha, String hora, Boolean tienePreguntasEscritas,
                                  Integer advertencias, Boolean finalizadoPorInfraccion,
                                  List<AuditoriaDetalleItemDTO> detalles) {
        this.intentoId = intentoId;
        this.nombreAlumno = nombreAlumno;
        this.iniciales = iniciales;
        this.calificacion = calificacion;
        this.notaTexto = notaTexto;
        this.fecha = fecha;
        this.hora = hora;
        this.tienePreguntasEscritas = tienePreguntasEscritas;
        this.advertencias = advertencias != null ? advertencias : 0;
        this.finalizadoPorInfraccion = Boolean.TRUE.equals(finalizadoPorInfraccion);
        this.detalles = detalles != null ? detalles : new ArrayList<>();
    }

    public UUID getIntentoId() {
        return intentoId;
    }

    public void setIntentoId(UUID intentoId) {
        this.intentoId = intentoId;
    }

    public String getNombreAlumno() {
        return nombreAlumno;
    }

    public void setNombreAlumno(String nombreAlumno) {
        this.nombreAlumno = nombreAlumno;
    }

    public String getIniciales() {
        return iniciales;
    }

    public void setIniciales(String iniciales) {
        this.iniciales = iniciales;
    }

    public Double getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Double calificacion) {
        this.calificacion = calificacion;
    }

    public String getNotaTexto() {
        return notaTexto;
    }

    public void setNotaTexto(String notaTexto) {
        this.notaTexto = notaTexto;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public Boolean getTienePreguntasEscritas() {
        return tienePreguntasEscritas;
    }

    public void setTienePreguntasEscritas(Boolean tienePreguntasEscritas) {
        this.tienePreguntasEscritas = tienePreguntasEscritas;
    }

    public List<AuditoriaDetalleItemDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<AuditoriaDetalleItemDTO> detalles) {
        this.detalles = detalles;
    }

    public Integer getAdvertencias() {
        return advertencias;
    }

    public void setAdvertencias(Integer advertencias) {
        this.advertencias = advertencias;
    }

    public Boolean getFinalizadoPorInfraccion() {
        return finalizadoPorInfraccion;
    }

    public void setFinalizadoPorInfraccion(Boolean finalizadoPorInfraccion) {
        this.finalizadoPorInfraccion = finalizadoPorInfraccion;
    }
}
