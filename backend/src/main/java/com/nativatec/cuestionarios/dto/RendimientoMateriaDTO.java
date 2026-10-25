package com.nativatec.cuestionarios.dto;

public class RendimientoMateriaDTO {
    private String materia;
    private int totalCuestionarios;
    private int totalPreguntas;
    private long totalRespuestas;
    private long respuestasCorrectas;
    private long respuestasIncorrectas;
    private double tasaAciertos;
    private double promedioNota;
    private String color;

    public RendimientoMateriaDTO() {
    }

    public RendimientoMateriaDTO(String materia, int totalCuestionarios, int totalPreguntas,
                                 long totalRespuestas, long respuestasCorrectas, long respuestasIncorrectas,
                                 double tasaAciertos, double promedioNota, String color) {
        this.materia = materia;
        this.totalCuestionarios = totalCuestionarios;
        this.totalPreguntas = totalPreguntas;
        this.totalRespuestas = totalRespuestas;
        this.respuestasCorrectas = respuestasCorrectas;
        this.respuestasIncorrectas = respuestasIncorrectas;
        this.tasaAciertos = tasaAciertos;
        this.promedioNota = promedioNota;
        this.color = color;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public int getTotalCuestionarios() {
        return totalCuestionarios;
    }

    public void setTotalCuestionarios(int totalCuestionarios) {
        this.totalCuestionarios = totalCuestionarios;
    }

    public int getTotalPreguntas() {
        return totalPreguntas;
    }

    public void setTotalPreguntas(int totalPreguntas) {
        this.totalPreguntas = totalPreguntas;
    }

    public long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public long getRespuestasCorrectas() {
        return respuestasCorrectas;
    }

    public void setRespuestasCorrectas(long respuestasCorrectas) {
        this.respuestasCorrectas = respuestasCorrectas;
    }

    public long getRespuestasIncorrectas() {
        return respuestasIncorrectas;
    }

    public void setRespuestasIncorrectas(long respuestasIncorrectas) {
        this.respuestasIncorrectas = respuestasIncorrectas;
    }

    public double getTasaAciertos() {
        return tasaAciertos;
    }

    public void setTasaAciertos(double tasaAciertos) {
        this.tasaAciertos = tasaAciertos;
    }

    public double getPromedioNota() {
        return promedioNota;
    }

    public void setPromedioNota(double promedioNota) {
        this.promedioNota = promedioNota;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
