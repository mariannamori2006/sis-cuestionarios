package com.nativatec.cuestionarios.dto;

public class DistribucionCalificacionesDTO {
    private Long rango18_20;
    private Long rango15_17;
    private Long rango11_14;
    private Long rango0_10;

    public DistribucionCalificacionesDTO() {
    }

    public DistribucionCalificacionesDTO(Long rango18_20, Long rango15_17, Long rango11_14, Long rango0_10) {
        this.rango18_20 = rango18_20 != null ? rango18_20 : 0L;
        this.rango15_17 = rango15_17 != null ? rango15_17 : 0L;
        this.rango11_14 = rango11_14 != null ? rango11_14 : 0L;
        this.rango0_10 = rango0_10 != null ? rango0_10 : 0L;
    }

    public Long getRango18_20() {
        return rango18_20;
    }

    public void setRango18_20(Long rango18_20) {
        this.rango18_20 = rango18_20;
    }

    public Long getRango15_17() {
        return rango15_17;
    }

    public void setRango15_17(Long rango15_17) {
        this.rango15_17 = rango15_17;
    }

    public Long getRango11_14() {
        return rango11_14;
    }

    public void setRango11_14(Long rango11_14) {
        this.rango11_14 = rango11_14;
    }

    public Long getRango0_10() {
        return rango0_10;
    }

    public void setRango0_10(Long rango0_10) {
        this.rango0_10 = rango0_10;
    }
}
