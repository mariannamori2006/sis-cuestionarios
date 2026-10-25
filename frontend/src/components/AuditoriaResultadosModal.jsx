import React, { useState, useEffect, useMemo } from 'react';
import { obtenerAuditoriaCuestionario, calificarIntento } from '../services/cuestionarioService';
import { exportarNotasExcel } from '../services/excelService';
import GraficasRendimientoAvanzadas from './GraficasRendimientoAvanzadas';
import { X, ChevronDown, ChevronUp, CheckCircle, XCircle, Edit2, Save, Users, Award, Clock, Download, FileSpreadsheet, ShieldAlert, ShieldCheck, AlertTriangle, BarChart3 } from 'lucide-react';

export default function AuditoriaResultadosModal({ isOpen, onClose, cuestionario, onActualizado }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [auditoriaData, setAuditoriaData] = useState(null);
    const [expandedIntentoId, setExpandedIntentoId] = useState(null);

    // Estado para calificación manual de un intento
    const [editandoNotaId, setEditandoNotaId] = useState(null);
    const [notaInput, setNotaInput] = useState('');
    const [guardandoNota, setGuardandoNota] = useState(false);
    const [subVista, setSubVista] = useState('alumnos'); // 'alumnos' o 'graficas'

    useEffect(() => {
        if (!isOpen || !cuestionario?.id) return;

        const cargarAuditoria = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await obtenerAuditoriaCuestionario(cuestionario.id);
                setAuditoriaData(data);
            } catch (err) {
                console.error('Error al cargar la auditoría:', err);
                setError('No se pudo cargar la información de auditoría desde la base de datos.');
            } finally {
                setLoading(false);
            }
        };

        cargarAuditoria();
    }, [isOpen, cuestionario]);

    if (!isOpen) return null;

    const toggleExpand = (id) => {
        setExpandedIntentoId(prev => prev === id ? null : id);
        setEditandoNotaId(null);
    };

    const handleIniciarEditarNota = (intento) => {
        setEditandoNotaId(intento.intentoId);
        setNotaInput(intento.calificacion != null ? intento.calificacion.toString() : '');
    };

    const handleGuardarNota = async (intentoId) => {
        const parsed = parseFloat(notaInput);
        if (isNaN(parsed) || parsed < 0 || parsed > 20) {
            alert('Por favor ingresa una nota válida entre 0 y 20.');
            return;
        }

        try {
            setGuardandoNota(true);
            await calificarIntento(intentoId, parsed);

            // Actualizar localmente la lista de auditoría
            const dataActualizada = await obtenerAuditoriaCuestionario(cuestionario.id);
            setAuditoriaData(dataActualizada);
            setEditandoNotaId(null);

            if (onActualizado) {
                onActualizado();
            }
        } catch (err) {
            console.error('Error al guardar la calificación:', err);
            alert('Error al guardar la calificación en el servidor.');
        } finally {
            setGuardandoNota(false);
        }
    };

    const handleExportarExcel = () => {
        try {
            exportarNotasExcel(cuestionario, auditoriaData);
        } catch (err) {
            console.error('Error al exportar notas a Excel:', err);
            alert('No se pudo exportar el archivo de notas.');
        }
    };

    const titulo = auditoriaData?.titulo || cuestionario?.titulo || 'Cuestionario';
    const totalParticipantes = auditoriaData?.totalParticipantes ?? 0;
    const promedio = auditoriaData?.promedio ?? (cuestionario?.promedioCalificacion || 0.0);
    const intentos = auditoriaData?.intentos || [];

    // Calcular estadísticas por pregunta de este cuestionario para las gráficas
    const preguntasAuditoria = useMemo(() => {
        if (!auditoriaData?.intentos || auditoriaData.intentos.length === 0) return [];
        const stats = {};
        auditoriaData.intentos.forEach(intento => {
            (intento.detalles || []).forEach(d => {
                const pKey = d.preguntaId || `${d.orden}-${d.enunciado}`;
                if (!stats[pKey]) {
                    stats[pKey] = {
                        preguntaId: d.preguntaId || pKey,
                        cuestionarioId: cuestionario?.id,
                        cuestionarioTitulo: titulo,
                        materia: auditoriaData.materia || cuestionario?.materia || 'General',
                        enunciado: d.enunciado || `Pregunta ${d.orden || ''}`,
                        orden: d.orden || 1,
                        tipo: d.tipoPregunta || 'OPCION_MULTIPLE',
                        totalRespuestas: 0,
                        respuestasCorrectas: 0,
                        respuestasIncorrectas: 0
                    };
                }
                stats[pKey].totalRespuestas++;
                if (d.esCorrecta === true) {
                    stats[pKey].respuestasCorrectas++;
                } else if (d.esCorrecta === false) {
                    stats[pKey].respuestasIncorrectas++;
                }
            });
        });

        return Object.values(stats).map(s => {
            const tasa = s.totalRespuestas > 0
                ? Math.round((s.respuestasCorrectas / s.totalRespuestas) * 1000) / 10
                : 0;
            return {
                ...s,
                tasaAciertos: tasa,
                dificultad: tasa >= 75 ? 'Baja' : tasa >= 50 ? 'Media' : 'Alta'
            };
        }).sort((a, b) => a.orden - b.orden);
    }, [auditoriaData, cuestionario, titulo]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '920px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                padding: '28px 32px',
                boxSizing: 'border-box'
            }}>

                {/* ENCABEZADO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a', fontWeight: '700' }}>
                            Auditoría de resultados
                        </h2>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                            {titulo} · {totalParticipantes} {totalParticipantes === 1 ? 'participante' : 'participantes'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={handleExportarExcel}
                            disabled={intentos.length === 0}
                            title={intentos.length === 0 ? "No hay evaluaciones registradas para descargar" : "Descargar notas en Excel"}
                            style={{
                                backgroundColor: intentos.length > 0 ? '#10b981' : '#cbd5e1',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: intentos.length > 0 ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: intentos.length > 0 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <Download size={15} /> Descargar Excel
                        </button>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Promedio
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px' }}>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {promedio > 0 ? promedio.toFixed(1) : '0.0'}
                                </span>
                                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
                                    /20
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                background: '#f1f5f9',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ESTADO DE CARGA O ERROR */}
                {loading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        Cargando resultados de la base de datos...
                    </div>
                ) : error ? (
                    <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                        {error}
                    </div>
                ) : intentos.length === 0 ? (
                    <div style={{
                        padding: '48px 24px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: '14px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <Users size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#334155' }}>Aún no hay respuestas registradas</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                            Comparte el código o enlace de este cuestionario con tus alumnos para ver sus calificaciones aquí.
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* SELECTOR DE PESTAÑA DENTRO DEL MODAL */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setSubVista('alumnos')}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: subVista === 'alumnos' ? '#0f172a' : '#f1f5f9',
                                    color: subVista === 'alumnos' ? '#ffffff' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                👥 Evaluaciones de Alumnos ({intentos.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubVista('graficas')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: subVista === 'graficas' ? '#2563eb' : '#f1f5f9',
                                    color: subVista === 'graficas' ? '#ffffff' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <BarChart3 size={15} /> Gráficas de Rendimiento del Examen
                            </button>
                        </div>

                        {subVista === 'graficas' ? (
                            <GraficasRendimientoAvanzadas
                                rendimientoPreguntas={preguntasAuditoria}
                                rendimientoMaterias={[{
                                    materia: auditoriaData?.materia || cuestionario?.materia || 'General',
                                    totalCuestionarios: 1,
                                    totalPreguntas: preguntasAuditoria.length,
                                    totalRespuestas: intentos.length * preguntasAuditoria.length,
                                    respuestasCorrectas: preguntasAuditoria.reduce((sum, p) => sum + p.respuestasCorrectas, 0),
                                    respuestasIncorrectas: preguntasAuditoria.reduce((sum, p) => sum + p.respuestasIncorrectas, 0),
                                    tasaAciertos: Math.round((promedio / 20) * 100),
                                    promedioNota: promedio,
                                    color: '#2563eb'
                                }]}
                                cuestionarios={cuestionario ? [cuestionario] : []}
                                tituloModulo="Rendimiento de este Cuestionario"
                            />
                        ) : (
                            /* TABLA DE AUDITORÍA */
                            <div>
                                {/* CABECERA DE TABLA */}
                                <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 1.3fr) 100px 140px 90px 70px 36px',
                            padding: '10px 8px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#94a3b8',
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            alignItems: 'center'
                        }}>
                            <div>ALUMNO</div>
                            <div>CALIFICACIÓN</div>
                            <div>MODO SEGURO</div>
                            <div>FECHA</div>
                            <div>HORA</div>
                            <div></div>
                        </div>

                        {/* LISTA DE FILAS DE ALUMNOS */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {intentos.map((intento) => {
                                const isExpanded = expandedIntentoId === intento.intentoId;
                                const calif = intento.calificacion;

                                // Colores de calificación según el rango
                                let scoreColor = '#10b981'; // Verde para >= 14
                                if (calif != null) {
                                    if (calif < 11) {
                                        scoreColor = '#dc2626'; // Rojo
                                    } else if (calif < 14) {
                                        scoreColor = '#d97706'; // Ámbar / naranja
                                    }
                                }

                                const scoreText = calif != null
                                    ? (calif % 1 === 0 ? calif.toFixed(0) : calif.toFixed(1))
                                    : null;

                                return (
                                    <div
                                        key={intento.intentoId}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background-color 0.15s'
                                        }}
                                    >
                                        {/* FILA PRINCIPAL */}
                                        <div
                                            onClick={() => toggleExpand(intento.intentoId)}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(180px, 1.3fr) 100px 140px 90px 70px 36px',
                                                padding: '14px 8px',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                                                borderRadius: isExpanded ? '10px 10px 0 0' : '0'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isExpanded) e.currentTarget.style.backgroundColor = '#fafafa';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff';
                                            }}
                                        >
                                            {/* ALUMNO CON AVATAR */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#1e293b',
                                                    color: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700',
                                                    fontSize: '13px',
                                                    flexShrink: 0
                                                }}>
                                                    {intento.iniciales || 'AL'}
                                                </div>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#0f172a',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {intento.nombreAlumno}
                                                </span>
                                            </div>

                                            {/* CALIFICACIÓN */}
                                            <div>
                                                {scoreText !== null ? (
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: '700', color: scoreColor }}>
                                                            {scoreText}
                                                        </span>
                                                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                                                            /20
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        backgroundColor: '#fef3c7',
                                                        color: '#b45309',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>

                                            {/* MODO SEGURO / INCIDENTES */}
                                            <div>
                                                {intento.finalizadoPorInfraccion ? (
                                                    <span style={{
                                                        backgroundColor: '#fee2e2',
                                                        color: '#dc2626',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }} title={`Examen auto-enviado por superar ${intento.advertencias} advertencias de cambio de pestaña`}>
                                                        <ShieldAlert size={12} /> Bloqueado ({intento.advertencias} adv.)
                                                    </span>
                                                ) : intento.advertencias > 0 ? (
                                                    <span style={{
                                                        backgroundColor: '#fef3c7',
                                                        color: '#d97706',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }} title={`El alumno salió de la pestaña ${intento.advertencias} veces`}>
                                                        <AlertTriangle size={12} /> {intento.advertencias} {intento.advertencias === 1 ? 'salida' : 'salidas'}
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        backgroundColor: '#f0fdf4',
                                                        color: '#16a34a',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <ShieldCheck size={12} /> Limpio
                                                    </span>
                                                )}
                                            </div>

                                            {/* FECHA */}
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                {intento.fecha}
                                            </div>

                                            {/* HORA */}
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                {intento.hora}
                                            </div>

                                            {/* CHEVRON ACCIÓN */}
                                            <div style={{ display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>

                                        {/* DETALLES EXPANDIBLES (REVISIÓN DE RESPUESTAS Y ASIGNACIÓN DE NOTA) */}
                                        {isExpanded && (
                                            <div style={{
                                                backgroundColor: '#f8fafc',
                                                padding: '16px 20px 20px 20px',
                                                borderTop: '1px solid #e2e8f0',
                                                borderRadius: '0 0 10px 10px',
                                                fontSize: '13px'
                                            }}>
                                                {/* ALERTA DE MODO SEGURO SI HUBO SALIDAS DE PESTAÑA */}
                                                {(intento.advertencias > 0 || intento.finalizadoPorInfraccion) && (
                                                    <div style={{
                                                        backgroundColor: intento.finalizadoPorInfraccion ? '#fef2f2' : '#fffbeb',
                                                        border: intento.finalizadoPorInfraccion ? '1px solid #fecaca' : '1px solid #fde68a',
                                                        color: intento.finalizadoPorInfraccion ? '#991b1b' : '#92400e',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        marginBottom: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <ShieldAlert size={16} />
                                                        {intento.finalizadoPorInfraccion
                                                            ? `Infracción de Modo Seguro: El alumno abandonó la pestaña del examen ${intento.advertencias} veces. La prueba fue cerrada y calificada automáticamente.`
                                                            : `Alerta de supervisión: El alumno abandonó o minimizó la pestaña ${intento.advertencias} ${intento.advertencias === 1 ? 'vez' : 'veces'} durante la resolución.`}
                                                    </div>
                                                )}

                                                {/* BARRA DE ACCIÓN PARA CALIFICAR / MODIFICAR NOTA */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '16px',
                                                    paddingBottom: '12px',
                                                    borderBottom: '1px solid #e2e8f0'
                                                }}>
                                                    <div style={{ fontWeight: '700', color: '#334155' }}>
                                                        Desglose de respuestas del alumno:
                                                    </div>

                                                    {editandoNotaId === intento.intentoId ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                max="20"
                                                                value={notaInput}
                                                                onChange={(e) => setNotaInput(e.target.value)}
                                                                placeholder="Nota (0-20)"
                                                                style={{
                                                                    width: '90px',
                                                                    padding: '6px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #3b82f6',
                                                                    fontSize: '13px',
                                                                    fontWeight: 'bold',
                                                                    outline: 'none'
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleGuardarNota(intento.intentoId)}
                                                                disabled={guardandoNota}
                                                                style={{
                                                                    backgroundColor: '#0f172a',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontWeight: '600',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <Save size={13} /> {guardandoNota ? 'Guardando...' : 'Guardar nota'}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditandoNotaId(null)}
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    color: '#64748b',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleIniciarEditarNota(intento)}
                                                            style={{
                                                                backgroundColor: '#ffffff',
                                                                color: '#334155',
                                                                border: '1px solid #cbd5e1',
                                                                padding: '5px 12px',
                                                                borderRadius: '6px',
                                                                fontWeight: '600',
                                                                fontSize: '12px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            <Edit2 size={13} /> {calif != null ? 'Modificar nota' : 'Asignar calificación'}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* PREGUNTAS Y RESPUESTAS */}
                                                {intento.detalles && intento.detalles.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {intento.detalles.map((det, dIndex) => {
                                                            const esCorrecta = det.esCorrecta;
                                                            const esEscrita = det.esEscrita;

                                                            return (
                                                                <div
                                                                    key={dIndex}
                                                                    style={{
                                                                        backgroundColor: '#ffffff',
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: '8px',
                                                                        padding: '12px 16px'
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                                                            {dIndex + 1}. {det.enunciado}
                                                                        </span>
                                                                        {esEscrita ? (
                                                                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '10px' }}>
                                                                                Respuesta escrita
                                                                            </span>
                                                                        ) : esCorrecta ? (
                                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                                                <CheckCircle size={12} /> Correcta
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
                                                                                <XCircle size={12} /> Incorrecta
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {det.imagenUrl && (
                                                                        <div style={{ margin: '8px 0' }}>
                                                                            <img
                                                                                src={det.imagenUrl}
                                                                                alt="Referencia visual"
                                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                                                style={{
                                                                                    maxHeight: '120px',
                                                                                    maxWidth: '220px',
                                                                                    borderRadius: '6px',
                                                                                    border: '1px solid #cbd5e1',
                                                                                    objectFit: 'contain',
                                                                                    backgroundColor: '#ffffff'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                                                                        <strong>Respuesta enviada:</strong>{' '}
                                                                        <span style={{
                                                                            color: esEscrita ? '#0f172a' : (esCorrecta ? '#15803d' : '#b91c1c'),
                                                                            fontWeight: esEscrita ? 'normal' : '600'
                                                                        }}>
                                                                            {det.respuestaAlumno || '(Sin respuesta)'}
                                                                        </span>
                                                                    </div>

                                                                    {!esEscrita && !esCorrecta && det.respuestaCorrecta && (
                                                                        <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                                                                            <strong>Respuesta correcta:</strong> {det.respuestaCorrecta}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                        No hay detalles específicos registrados para este intento.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}
