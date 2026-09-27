package com.nativatec.cuestionarios.dto;

import java.util.List;
import java.util.UUID;

public class ResponderCuestionarioDTO {
    private UUID cuestionarioId;
    private String nombreParticipante;
    private UUID usuarioId;
    private List<RespuestaItemDTO> respuestas;

    public ResponderCuestionarioDTO() {
    }

    public UUID getCuestionarioId() {
        return cuestionarioId;
    }

    public void setCuestionarioId(UUID cuestionarioId) {
        this.cuestionarioId = cuestionarioId;
    }

    public String getNombreParticipante() {
        return nombreParticipante;
    }

    public void setNombreParticipante(String nombreParticipante) {
        this.nombreParticipante = nombreParticipante;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public List<RespuestaItemDTO> getRespuestas() {
        return respuestas;
    }

    public void setRespuestas(List<RespuestaItemDTO> respuestas) {
        this.respuestas = respuestas;
    }

    public static class RespuestaItemDTO {
        private UUID preguntaId;
        private UUID opcionSeleccionadaId;
        private String respuestaTexto;

        public RespuestaItemDTO() {
        }

        public UUID getPreguntaId() {
            return preguntaId;
        }

        public void setPreguntaId(UUID preguntaId) {
            this.preguntaId = preguntaId;
        }

        public UUID getOpcionSeleccionadaId() {
            return opcionSeleccionadaId;
        }

        public void setOpcionSeleccionadaId(UUID opcionSeleccionadaId) {
            this.opcionSeleccionadaId = opcionSeleccionadaId;
        }

        public String getRespuestaTexto() {
            return respuestaTexto;
        }

        public void setRespuestaTexto(String respuestaTexto) {
            this.respuestaTexto = respuestaTexto;
        }
    }
}
