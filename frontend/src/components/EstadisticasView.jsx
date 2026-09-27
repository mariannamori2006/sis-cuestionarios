import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasDetalladas } from '../services/cuestionarioService';
import { Edit3, CheckSquare, Star, BarChart2 } from 'lucide-react';

export default function EstadisticasView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                setLoading(true);
                const stats = await obtenerEstadisticasDetalladas();
                setData(stats);
            } catch (err) {
                console.error('Error al cargar estadísticas detalladas:', err);
                setError('No se pudieron cargar las estadísticas de la base de datos.');
            } finally {
                setLoading(false);
            }
        };

        cargarEstadisticas();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                Cargando análisis de participación y rendimiento...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '12px', fontSize: '14px' }}>
                {error}
            </div>
        );
    }

    const totalRespuestas = data?.totalRespuestas ?? 0;
    const tasaAprobacion = data?.tasaAprobacion != null ? Math.round(data.tasaAprobacion) : 0;
    const promedioGeneral = data?.promedioGeneral ?? 0.0;
    const cuestionarios = data?.cuestionarios || [];
    const distribucion = data?.distribucion || { rango18_20: 0, rango15_17: 0, rango11_14: 0, rango0_10: 0 };

    // Cuestionarios ordenados para "Respuestas por cuestionario"
    const maxRespuestas = cuestionarios.reduce((max, c) => Math.max(max, c.totalRespuestas || 0), 1);

    // Valores para el gráfico de barras de distribución
    const c18_20 = distribucion.rango18_20 || 0;
    const c15_17 = distribucion.rango15_17 || 0;
    const c11_14 = distribucion.rango11_14 || 0;
    const c0_10 = distribucion.rango0_10 || 0;

    const maxAlumnosRango = Math.max(c18_20, c15_17, c11_14, c0_10, 1);

    const getMateriaStyle = (materia) => {
        const mat = (materia || '').toLowerCase();
        if (mat.includes('historia')) return { bg: '#fef3c7', color: '#b45309' };
        if (mat.includes('biología') || mat.includes('biologia')) return { bg: '#dcfce7', color: '#15803d' };
        if (mat.includes('informática') || mat.includes('informatica') || mat.includes('programación') || mat.includes('programacion')) return { bg: '#f3e8ff', color: '#7e22ce' };
        if (mat.includes('mate')) return { bg: '#dbeafe', color: '#1e40af' };
        if (mat.includes('química') || mat.includes('quimica')) return { bg: '#ffedd5', color: '#c2410c' };
        if (mat.includes('física') || mat.includes('fisica')) return { bg: '#e0e7ff', color: '#4338ca' };
        return { bg: '#f1f5f9', color: '#475569' };
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
            {/* CABECERA */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Estadísticas</h1>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Análisis de participación y rendimiento</span>
            </div>

            {/* TARJETAS MÉTRICAS SUPERIORES (3 COLUMNAS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* 1. Total de respuestas */}
                <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Edit3 size={18} color="#ea580c" />
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', lineHeight: '1.1', marginBottom: '4px' }}>
                            {totalRespuestas}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Total de respuestas
                        </div>
                    </div>
                </div>

                {/* 2. Tasa de aprobación */}
                <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckSquare size={18} color="#10b981" />
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.1', marginBottom: '4px' }}>
                            {tasaAprobacion}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Tasa de aprobación
                        </div>
                    </div>
                </div>

                {/* 3. Promedio general */}
                <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={18} color="#eab308" fill="#eab308" />
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', lineHeight: '1.1', marginBottom: '4px' }}>
                            {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : '0.0'}/20
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Promedio general
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN INTERMEDIA (2 COLUMNAS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* CARD IZQUIERDA: RESPUESTAS POR CUESTIONARIO */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 22px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                        Respuestas por cuestionario
                    </h3>

                    {cuestionarios.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cuestionarios.map((c, idx) => {
                                const resp = c.totalRespuestas || 0;
                                const pct = Math.max(12, Math.round((resp / maxRespuestas) * 100));

                                return (
                                    <div key={c.id || idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                                {c.titulo}
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                                                {resp}
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '26px', backgroundColor: '#f1f5f9', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                backgroundColor: '#1e3a8a',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingLeft: '12px',
                                                boxSizing: 'border-box',
                                                transition: 'width 0.4s ease'
                                            }}>
                                                <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                                    {resp} resp.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
                            No hay cuestionarios con respuestas registradas.
                        </div>
                    )}
                </div>

                {/* CARD DERECHA: DISTRIBUCIÓN DE CALIFICACIONES */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: '0 0 22px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                            Distribución de calificaciones
                        </h3>

                        {/* GRÁFICO DE BARRAS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', height: '140px', alignItems: 'end', marginBottom: '18px', padding: '0 10px' }}>
                            {/* Barra 18-20 pts */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>{c18_20}</span>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(12, Math.round((c18_20 / maxAlumnosRango) * 85))}px`,
                                    backgroundColor: '#22c55e',
                                    borderRadius: '6px',
                                    transition: 'height 0.4s ease'
                                }} />
                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>18–20</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>pts</div>
                                </div>
                            </div>

                            {/* Barra 15-17 pts */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>{c15_17}</span>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(12, Math.round((c15_17 / maxAlumnosRango) * 85))}px`,
                                    backgroundColor: '#3b516b',
                                    borderRadius: '6px',
                                    transition: 'height 0.4s ease'
                                }} />
                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>15–17</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>pts</div>
                                </div>
                            </div>

                            {/* Barra 11-14 pts */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', marginBottom: '6px' }}>{c11_14}</span>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(12, Math.round((c11_14 / maxAlumnosRango) * 85))}px`,
                                    backgroundColor: '#e68a1d',
                                    borderRadius: '6px',
                                    transition: 'height 0.4s ease'
                                }} />
                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>11–14</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>pts</div>
                                </div>
                            </div>

                            {/* Barra 0-10 pts */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>{c0_10}</span>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(12, Math.round((c0_10 / maxAlumnosRango) * 85))}px`,
                                    backgroundColor: '#ef4444',
                                    borderRadius: '6px',
                                    transition: 'height 0.4s ease'
                                }} />
                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>0–10</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>pts</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LEYENDA INFERIOR */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                                <span>18–20 pts</span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{c18_20} {c18_20 === 1 ? 'alumno' : 'alumnos'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b516b' }} />
                                <span>15–17 pts</span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{c15_17} {c15_17 === 1 ? 'alumno' : 'alumnos'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e68a1d' }} />
                                <span>11–14 pts</span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{c11_14} {c11_14 === 1 ? 'alumno' : 'alumnos'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                <span>0–10 pts</span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{c0_10} {c0_10 === 1 ? 'alumno' : 'alumnos'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN INFERIOR: RESUMEN POR CUESTIONARIO */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    Resumen por cuestionario
                </h3>

                {cuestionarios.length > 0 ? (
                    <div>
                        {/* CABECERA DE TABLA */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                            padding: '10px 8px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#94a3b8',
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            alignItems: 'center'
                        }}>
                            <div>CUESTIONARIO</div>
                            <div>MATERIA</div>
                            <div>RESPUESTAS</div>
                            <div>PREGUNTAS</div>
                            <div>CREADO</div>
                        </div>

                        {/* FILAS DE CUESTIONARIOS */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {cuestionarios.map((c, idx) => {
                                const matStyle = getMateriaStyle(c.materia);

                                return (
                                    <div
                                        key={c.id || idx}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                                            padding: '16px 8px',
                                            alignItems: 'center',
                                            borderBottom: idx < cuestionarios.length - 1 ? '1px solid #f8fafc' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                            {c.titulo}
                                        </div>
                                        <div>
                                            <span style={{
                                                backgroundColor: matStyle.bg,
                                                color: matStyle.color,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'inline-block'
                                            }}>
                                                {c.materia || 'General'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                                            {c.totalRespuestas || 0}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                                            {c.totalPreguntas || 0}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                            {c.fechaCreacion || '2026-09-01'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#94a3b8', fontSize: '13px', padding: '30px 0', textAlign: 'center' }}>
                        No hay cuestionarios registrados para mostrar estadísticas.
                    </div>
                )}
            </div>
        </div>
    );
}
