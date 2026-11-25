package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.entity.Cuestionario;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion;
import com.nativatec.cuestionarios.entity.IntentoEvaluacion.EstadoIntento;
import com.nativatec.cuestionarios.repository.IntentoEvaluacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CalificacionV3Service {

    private final IntentoEvaluacionRepository intentoRepository;

    public CalificacionV3Service(IntentoEvaluacionRepository intentoRepository) {
        this.intentoRepository = intentoRepository;
    }

    public BigDecimal calcularNotaFinal(BigDecimal puntajeObtenido, BigDecimal puntajeMaximo, BigDecimal escalaNota) {
        BigDecimal escala = escalaNota != null && escalaNota.compareTo(BigDecimal.ZERO) > 0
                ? escalaNota
                : new BigDecimal("20.00");
        if (puntajeMaximo == null || puntajeMaximo.compareTo(BigDecimal.ZERO) <= 0 || puntajeObtenido == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal nota = puntajeObtenido
                .multiply(escala)
                .divide(puntajeMaximo, 2, RoundingMode.HALF_UP);
        if (nota.compareTo(escala) > 0) {
            return escala.setScale(2, RoundingMode.HALF_UP);
        }
        return nota.max(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    public boolean esAprobado(BigDecimal notaFinal, BigDecimal notaAprobatoria) {
        if (notaFinal == null) return false;
        BigDecimal minimo = notaAprobatoria != null ? notaAprobatoria : new BigDecimal("11.00");
        return notaFinal.compareTo(minimo) >= 0;
    }

    /**
     * Marca exactamente un intento finalizado como oficial para un alumno dentro de una sesión
     * según el criterio configurado en el cuestionario (MEJOR_NOTA, ULTIMO_INTENTO, PRIMER_INTENTO).
     */
    @Transactional
    public void recalcularIntentoOficial(Cuestionario cuestionario, UUID sesionId, String nombreNormalizado) {
        List<IntentoEvaluacion> intentos = intentoRepository
                .findBySesionIdAndNombreNormalizadoOrderByNumeroIntentoAsc(sesionId, nombreNormalizado);

        List<IntentoEvaluacion> finalizados = intentos.stream()
                .filter(i -> i.getEstado() != EstadoIntento.EN_PROGRESO)
                .toList();

        if (finalizados.isEmpty()) {
            return;
        }

        String criterio = cuestionario.getTipoCalificacionIntentos() != null
                ? cuestionario.getTipoCalificacionIntentos().trim().toUpperCase()
                : "MEJOR_NOTA";

        IntentoEvaluacion oficial;
        if ("PRIMER_INTENTO".equals(criterio)) {
            oficial = finalizados.get(0);
        } else if ("ULTIMO_INTENTO".equals(criterio)) {
            oficial = finalizados.get(finalizados.size() - 1);
        } else {
            oficial = finalizados.stream()
                    .max(Comparator
                            .comparing((IntentoEvaluacion i) -> i.getNotaFinal() != null ? i.getNotaFinal() : BigDecimal.ZERO)
                            .thenComparing(IntentoEvaluacion::getNumeroIntento))
                    .orElse(finalizados.get(0));
        }

        for (IntentoEvaluacion intento : intentos) {
            boolean esOficial = intento.getId().equals(oficial.getId());
            if (!Boolean.valueOf(esOficial).equals(intento.getEsIntentoOficial())) {
                intento.setEsIntentoOficial(esOficial);
            }
        }
        intentoRepository.saveAll(intentos);
    }
}

