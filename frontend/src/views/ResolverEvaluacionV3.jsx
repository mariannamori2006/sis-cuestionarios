import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    guardarAvanceEvaluacionV3,
    registrarEventoSeguridadV3,
    entregarIntentoEvaluacionV3
} from '../services/v3Service';
import useResponsive from '../hooks/useResponsive';
import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    CloudCheck,
    RefreshCw,
    Send,
    Award,
    XCircle,
    ArrowLeft,
    CheckSquare,
    Square,
    CircleDot
} from 'lucide-react';

const formatearSegundos = (seg) => {
    if (seg == null) return '';
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function ResolverEvaluacionV3() {
    const { intentoId } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useResponsive();

    const [intentoData] = useState(() => {
        try {
            const raw = sessionStorage.getItem(`v3_intento_${intentoId}`);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [respuestas, setRespuestas] = useState(() => {
        if (!intentoData?.respuestasGuardadas) return {};
        const inicial = {};
        intentoData.respuestasGuardadas.forEach((r) => {
            inicial[r.preguntaId] = {
                opcionIds: r.opcionIds || [],
                respuestaTexto: r.respuestaTexto || ''
            };
        });
        return inicial;
    });

    const [estadoSync, setEstadoSync] = useState('saved'); // 'saved' | 'saving' | 'error'
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [advertencias, setAdvertencias] = useState(intentoData?.advertenciasActuales || 0);
    const [modalAdvertencia, setModalAdvertencia] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [errorEnvio, setErrorEnvio] = useState('');

    const respuestasRef = useRef(respuestas);
    const resultadoRef = useRef(resultado);
    const enviandoRef = useRef(enviando);
    const ultimoEventoSegRef = useRef(0);
    const timersTextoRef = useRef({});

    useEffect(() => {
        respuestasRef.current = respuestas;
    }, [respuestas]);

    useEffect(() => {
        resultadoRef.current = resultado;
    }, [resultado]);

    useEffect(() => {
        enviandoRef.current = enviando;
    }, [enviando]);

    // Si no existe sesión cargada, redirigir al portal limpio
    useEffect(() => {
        if (!intentoData) {
            navigate('/unirse', { replace: true });
        }
    }, [intentoData, navigate]);

    // Temporizador real basado en fechaLimiteEntrega del servidor
    useEffect(() => {
        if (!intentoData?.fechaLimiteEntrega || intentoData.tiempoLimiteMinutos <= 0 || resultado) return;

        const limiteMs = new Date(intentoData.fechaLimiteEntrega).getTime();
        if (isNaN(limiteMs)) return;

        const tick = () => {
            const diffSeg = Math.max(0, Math.floor((limiteMs - Date.now()) / 1000));
            setTiempoRestante(diffSeg);
            if (diffSeg <= 0 && !resultadoRef.current && !enviandoRef.current) {
                ejecutarEntrega(true);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [intentoData, resultado]);

    // Modo seguro: detectar cambio de pestaña / pérdida de foco
    useEffect(() => {
        if (!intentoData?.modoSeguro || resultado) return;

        const reportarSalida = async (tipoEvento) => {
            if (resultadoRef.current || enviandoRef.current) return;
            const ahora = Date.now();
            if (ahora - ultimoEventoSegRef.current < 2000) return;
            ultimoEventoSegRef.current = ahora;

            try {
                const res = await registrarEventoSeguridadV3(intentoData.intentoId, {
                    deviceToken: intentoData.deviceToken,
                    tipoEvento,
                    detalle: `Evento registrado en ${new Date().toLocaleTimeString()}`
                });
                setAdvertencias(res.totalAdvertencias);
                if (res.intentoAnulado) {
                    const entrega = await entregarIntentoEvaluacionV3(intentoData.intentoId, {
                        deviceToken: intentoData.deviceToken,
                        expiradoPorTiempo: false,
                        respuestasPendientes: []
                    });
                    setResultado(entrega);
                } else {
                    setModalAdvertencia(true);
                }
            } catch (e) {
                console.warn('No se pudo registrar evento de seguridad:', e);
            }
        };

        const onVisibility = () => {
            if (document.hidden) reportarSalida('CAMBIO_PESTANA');
        };
        const onBlur = () => reportarSalida('PERDIDA_FOCO');

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
        };
    }, [intentoData, resultado]);

    const sincronizarPregunta = async (preguntaId, valor) => {
        if (!intentoData) return;
        try {
            setEstadoSync('saving');
            await guardarAvanceEvaluacionV3(intentoData.intentoId, {
                deviceToken: intentoData.deviceToken,
                preguntaId,
                opcionIds: valor.opcionIds || [],
                respuestaTexto: valor.respuestaTexto ?? null
            });
            setEstadoSync('saved');
        } catch (err) {
            setEstadoSync('error');
        }
    };

    const handleSeleccionUnica = (preguntaId, opcionId) => {
        const nuevo = { opcionIds: [opcionId], respuestaTexto: null };
        setRespuestas((prev) => ({ ...prev, [preguntaId]: nuevo }));
        sincronizarPregunta(preguntaId, nuevo);
    };

    const handleSeleccionMultiple = (preguntaId, opcionId) => {
        setRespuestas((prev) => {
            const actuales = prev[preguntaId]?.opcionIds || [];
            const existe = actuales.includes(opcionId);
            const actualizadas = existe
                ? actuales.filter((id) => id !== opcionId)
                : [...actuales, opcionId];
            const nuevo = { opcionIds: actualizadas, respuestaTexto: null };
            sincronizarPregunta(preguntaId, nuevo);
            return { ...prev, [preguntaId]: nuevo };
        });
    };

    const handleTextoCorto = (preguntaId, texto) => {
        const nuevo = { opcionIds: [], respuestaTexto: texto };
        setRespuestas((prev) => ({ ...prev, [preguntaId]: nuevo }));

        if (timersTextoRef.current[preguntaId]) {
            clearTimeout(timersTextoRef.current[preguntaId]);
        }
        timersTextoRef.current[preguntaId] = setTimeout(() => {
            sincronizarPregunta(preguntaId, nuevo);
        }, 650);
    };

    const totalRespondidas = useMemo(() => {
        if (!intentoData?.preguntas) return 0;
        return intentoData.preguntas.filter((p) => {
            const r = respuestas[p.id];
            if (!r) return false;
            if (p.tipo === 'RESPUESTA_CORTA') return Boolean(r.respuestaTexto && r.respuestaTexto.trim());
            return Array.isArray(r.opcionIds) && r.opcionIds.length > 0;
        }).length;
    }, [intentoData, respuestas]);

    const ejecutarEntrega = async (expiradoPorTiempo = false) => {
        if (!intentoData || enviandoRef.current) return;
        try {
            setEnviando(true);
            setErrorEnvio('');

            const pendientes = Object.entries(respuestasRef.current).map(([preguntaId, val]) => ({
                deviceToken: intentoData.deviceToken,
                preguntaId,
                opcionIds: val.opcionIds || [],
                respuestaTexto: val.respuestaTexto ?? null
            }));

            const res = await entregarIntentoEvaluacionV3(intentoData.intentoId, {
                deviceToken: intentoData.deviceToken,
                expiradoPorTiempo,
                respuestasPendientes: pendientes
            });
            sessionStorage.removeItem(`v3_intento_${intentoData.intentoId}`);
            setResultado(res);
        } catch (err) {
            setErrorEnvio(err.response?.data?.message || 'Error al entregar la evaluación. Intenta nuevamente.');
        } finally {
            setEnviando(false);
        }
    };

    if (!intentoData) return null;

    // VISTA FINAL DE ENTREGA
    if (resultado) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
                padding: isMobile ? '18px 12px' : '36px 20px',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                boxSizing: 'border-box'
            }}>
                <div style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    padding: isMobile ? '24px 18px' : '34px 36px',
                    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '62px', height: '62px', borderRadius: '20px',
                            backgroundColor: resultado.estado === 'ANULADO_INFRACCION' ? '#fef2f2' : '#ecfdf5',
                            color: resultado.estado === 'ANULADO_INFRACCION' ? '#dc2626' : '#10b981',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                        }}>
                            {resultado.estado === 'ANULADO_INFRACCION' ? <ShieldAlert size={32} /> : <CheckCircle2 size={32} />}
                        </div>
                        <h1 style={{ margin: '0 0 6px 0', fontSize: '23px', fontWeight: '800', color: '#0f172a' }}>
                            {resultado.estado === 'ANULADO_INFRACCION'
                                ? 'Evaluación finalizada por límite de advertencias'
                                : resultado.estado === 'EXPIRADO_TIEMPO'
                                    ? 'Tiempo agotado — Respuestas enviadas'
                                    : '¡Evaluación entregada con éxito!'}
                        </h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                            {resultado.apellidos}, {resultado.nombres} {resultado.seccion ? `· ${resultado.seccion}` : ''}
                        </p>
                    </div>

                    {resultado.mostrarNota ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                            gap: '12px',
                            marginBottom: '22px'
                        }}>
                            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Nota Final</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                                    {resultado.notaFinal} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ {resultado.escalaNota}</span>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Puntaje</div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                                    {resultado.puntajeObtenido} / {resultado.puntajeMaximo}
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tiempo Empleado</div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                                    {formatearSegundos(resultado.duracionSegundos || 0)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a',
                            borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', fontSize: '13.5px', fontWeight: '600', textAlign: 'center'
                        }}>
                            Tu docente publicará las calificaciones al finalizar la evaluación.
                        </div>
                    )}

                    {resultado.tienePendientesRevision && (
                        <div style={{
                            backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e',
                            borderRadius: '12px', padding: '12px 14px', marginBottom: '18px', fontSize: '13px', fontWeight: '600'
                        }}>
                            Hay preguntas de respuesta escrita pendientes de revisión manual por tu docente.
                        </div>
                    )}

                    {resultado.mostrarRetroalimentacion && resultado.retroalimentacion?.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                                Revisión de respuestas
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {resultado.retroalimentacion.map((item, idx) => (
                                    <div key={item.preguntaId} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '14px',
                                        padding: '14px',
                                        backgroundColor: item.esCorrecta === true ? '#f0fdf4' : item.esCorrecta === false ? '#fef2f2' : '#fffbeb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                {idx + 1}. {item.enunciado}
                                            </span>
                                            {item.esCorrecta === true && <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />}
                                            {item.esCorrecta === false && <XCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />}
                                        </div>
                                        <div style={{ fontSize: '12.5px', color: '#334155' }}>
                                            <strong>Tu respuesta:</strong>{' '}
                                            {item.tuRespuestaTexto
                                                ? item.tuRespuestaTexto
                                                : (item.tusRespuestas?.length > 0 ? item.tusRespuestas.join(', ') : 'Sin responder')}
                                        </div>
                                        {item.esCorrecta === false && item.respuestasCorrectas?.length > 0 && (
                                            <div style={{ fontSize: '12.5px', color: '#15803d', marginTop: '3px' }}>
                                                <strong>Respuesta correcta:</strong> {item.respuestasCorrectas.join(', ')}
                                            </div>
                                        )}
                                        {item.explicacion && (
                                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', fontStyle: 'italic' }}>
                                                {item.explicacion}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            onClick={() => navigate('/unirse')}
                            style={{
                                padding: '12px 22px', borderRadius: '12px', border: 'none',
                                backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '14px',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <ArrowLeft size={16} /> Volver al portal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA DE RESOLUCIÓN DEL ALUMNO
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f1f5f9',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            paddingBottom: '70px'
        }}>
            {/* Barra superior fija */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                backgroundColor: '#0f172a', color: '#ffffff',
                padding: isMobile ? '12px 14px' : '14px 28px',
                borderBottom: '1px solid #1e293b',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
            }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                        {intentoData.cursoNombre} {intentoData.seccion ? `· ${intentoData.seccion}` : ''}
                    </div>
                    <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '800' }}>
                        {intentoData.tituloEvaluacion}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {intentoData.apellidos}, {intentoData.nombres} · Intento #{intentoData.numeroIntento}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: '12px', fontWeight: '700', padding: '6px 10px', borderRadius: '10px',
                        backgroundColor: estadoSync === 'error' ? '#7f1d1d' : '#1e293b',
                        color: estadoSync === 'saved' ? '#34d399' : estadoSync === 'saving' ? '#fbbf24' : '#fca5a5',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                        {estadoSync === 'saving' ? <RefreshCw size={14} /> : <CloudCheck size={14} />}
                        {estadoSync === 'saving' ? 'Guardando...' : estadoSync === 'error' ? 'Reintentando...' : 'Guardado en servidor'}
                    </span>

                    {tiempoRestante !== null && (
                        <span style={{
                            fontSize: '14px', fontWeight: '800', fontFamily: 'monospace',
                            padding: '6px 12px', borderRadius: '10px',
                            backgroundColor: tiempoRestante < 120 ? '#dc2626' : '#1e293b',
                            color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}>
                            <Clock size={15} /> {formatearSegundos(tiempoRestante)}
                        </span>
                    )}
                </div>
            </header>

            <main style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '16px 12px' : '26px 20px' }}>
                {errorEnvio && (
                    <div style={{
                        backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                        borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', fontSize: '13.5px', fontWeight: '600'
                    }}>
                        {errorEnvio}
                    </div>
                )}

                {intentoData.reanudado && (
                    <div style={{
                        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
                        borderRadius: '12px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', fontWeight: '600'
                    }}>
                        Reanudaste tu intento en progreso. Tus respuestas guardadas se restauraron automáticamente.
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {intentoData.preguntas.map((p, idx) => {
                        const respActual = respuestas[p.id] || { opcionIds: [], respuestaTexto: '' };
                        return (
                            <div key={p.id} style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '18px',
                                padding: isMobile ? '18px 15px' : '22px 24px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '15.5px', fontWeight: '700', color: '#0f172a', lineHeight: 1.45 }}>
                                        <span style={{ color: '#2563eb', marginRight: '6px' }}>{idx + 1}.</span>
                                        {p.enunciado}
                                    </div>
                                    <span style={{
                                        fontSize: '11.5px', fontWeight: '700', color: '#475569',
                                        backgroundColor: '#f1f5f9', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap'
                                    }}>
                                        {p.puntos} pts
                                    </span>
                                </div>

                                {p.tipo === 'SELECCION_MULTIPLE' && (
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>
                                        Puedes marcar más de una opción correcta.
                                    </div>
                                )}

                                {p.imagenUrl && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <img
                                            src={p.imagenUrl}
                                            alt={`Imagen pregunta ${idx + 1}`}
                                            style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                        />
                                    </div>
                                )}

                                {p.tipo === 'RESPUESTA_CORTA' ? (
                                    <textarea
                                        rows={3}
                                        placeholder="Escribe aquí tu respuesta..."
                                        value={respActual.respuestaTexto || ''}
                                        onChange={(e) => handleTextoCorto(p.id, e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 14px', borderRadius: '12px',
                                            border: '1.5px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit',
                                            outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                        {(p.opciones || []).map((opc) => {
                                            const marcada = (respActual.opcionIds || []).includes(opc.id);
                                            const esMulti = p.tipo === 'SELECCION_MULTIPLE';
                                            return (
                                                <button
                                                    key={opc.id}
                                                    type="button"
                                                    onClick={() => esMulti ? handleSeleccionMultiple(p.id, opc.id) : handleSeleccionUnica(p.id, opc.id)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '12px 14px',
                                                        borderRadius: '12px',
                                                        border: marcada ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                                        backgroundColor: marcada ? '#eff6ff' : '#ffffff',
                                                        color: '#0f172a',
                                                        fontSize: '14px',
                                                        fontWeight: marcada ? '700' : '500',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        transition: 'all 0.12s ease'
                                                    }}
                                                >
                                                    {esMulti
                                                        ? (marcada ? <CheckSquare size={18} color="#2563eb" /> : <Square size={18} color="#94a3b8" />)
                                                        : <CircleDot size={18} color={marcada ? '#2563eb' : '#cbd5e1'} />}
                                                    <span>{opc.texto}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pie de entrega */}
                <div style={{
                    marginTop: '24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    padding: '18px 22px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ fontSize: '13.5px', color: '#475569', fontWeight: '700' }}>
                        Respondidas: {totalRespondidas} de {intentoData.preguntas.length}
                    </div>
                    <button
                        type="button"
                        disabled={enviando}
                        onClick={() => ejecutarEntrega(false)}
                        style={{
                            padding: '13px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: enviando ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.28)'
                        }}
                    >
                        <Send size={17} />
                        <span>{enviando ? 'Enviando...' : 'Entregar evaluación'}</span>
                    </button>
                </div>
            </main>

            {/* Modal de advertencia de modo seguro */}
            {modalAdvertencia && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.72)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '20px', padding: '26px', maxWidth: '400px', width: '100%', textAlign: 'center'
                    }}>
                        <AlertTriangle size={40} color="#d97706" style={{ marginBottom: '10px' }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                            Advertencia de Modo Seguro ({advertencias}/{intentoData.limiteAdvertencias})
                        </h3>
                        <p style={{ margin: '0 0 18px 0', fontSize: '13.5px', color: '#475569' }}>
                            Se detectó que saliste de la pantalla de evaluación. Si alcanzas el límite de advertencias, tu intento se enviará automáticamente.
                        </p>
                        <button
                            onClick={() => setModalAdvertencia(false)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                                backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Volver a la evaluación
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

