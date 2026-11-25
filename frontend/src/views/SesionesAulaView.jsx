import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
    listarSesionesV3,
    crearSesionV3,
    actualizarEstadoSesionV3,
    regenerarCodigoSesionV3,
    obtenerMonitorSesionV3,
    obtenerActaSesionV3,
    obtenerDetalleIntentoDocenteV3,
    ajustarCalificacionIntentoV3,
    listarCursosV3
} from '../services/v3Service';
import useResponsive from '../hooks/useResponsive';
import {
    Radio,
    Plus,
    QrCode,
    Copy,
    Check,
    RefreshCw,
    Pause,
    Play,
    Lock,
    Unlock,
    Users,
    FileSpreadsheet,
    Eye,
    BarChart3,
    X,
    ShieldAlert,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Save
} from 'lucide-react';

const BADGE_ESTADO_SESION = {
    ABIERTA: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', texto: 'Abierta' },
    PAUSADA: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', texto: 'Pausada' },
    PROGRAMADA: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', texto: 'Programada' },
    CERRADA: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', texto: 'Cerrada' }
};

const formatDuracion = (seg) => {
    if (seg == null) return '—';
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
};

export default function SesionesAulaView({ cuestionarios = [] }) {
    const { isMobile } = useResponsive();
    const [sesiones, setSesiones] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Form crear sesión
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [cuestionarioId, setCuestionarioId] = useState('');
    const [cursoFiltroId, setCursoFiltroId] = useState('');
    const [seccionId, setSeccionId] = useState('');
    const [tituloSesion, setTituloSesion] = useState('');
    const [tiempoOverride, setTiempoOverride] = useState('');
    const [pedirSeccion, setPedirSeccion] = useState(true);
    const [creando, setCreando] = useState(false);

    // Panel activo para una sesión seleccionada
    const [sesionActiva, setSesionActiva] = useState(null);
    const [subVista, setSubVista] = useState('compartir'); // 'compartir' | 'monitor' | 'acta'
    const [monitorData, setMonitorData] = useState(null);
    const [actaData, setActaData] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    // Copiado + host local para QR
    const [copiadoCodigo, setCopiadoCodigo] = useState(false);
    const [copiadoLink, setCopiadoLink] = useState(false);
    const [ipLocal, setIpLocal] = useState('192.168.100.112');
    const esLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const [usarIpWifi, setUsarIpWifi] = useState(false);

    // Modal detalle / calificación manual de un alumno
    const [intentoDetalle, setIntentoDetalle] = useState(null);
    const [notaManualInput, setNotaManualInput] = useState('');
    const [observacionInput, setObservacionInput] = useState('');
    const [ajustesRespuestas, setAjustesRespuestas] = useState({});
    const [guardandoNota, setGuardandoNota] = useState(false);

    const cargarTodo = useCallback(async () => {
        try {
            setCargando(true);
            const [sesData, curData] = await Promise.all([
                listarSesionesV3(),
                listarCursosV3(true).catch(() => [])
            ]);
            setSesiones(sesData);
            setCursos(curData);
        } catch (err) {
            setError('No se pudieron cargar las sesiones de evaluación.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarTodo();
    }, [cargarTodo]);

    useEffect(() => {
        if (!cuestionarioId && cuestionarios.length > 0) {
            setCuestionarioId(cuestionarios[0].id);
        }
    }, [cuestionarios, cuestionarioId]);

    // Auto-refresh en Monitor en Vivo cada 5 segundos
    useEffect(() => {
        if (!sesionActiva || subVista !== 'monitor') return;
        const refrescar = async () => {
            try {
                const mon = await obtenerMonitorSesionV3(sesionActiva.id);
                setMonitorData(mon);
            } catch {
                // Silencioso en polling
            }
        };
        refrescar();
        const id = setInterval(refrescar, 5000);
        return () => clearInterval(id);
    }, [sesionActiva, subVista]);

    const seccionesDelCursoSeleccionado = cursos
        .find((c) => c.id === cursoFiltroId)?.secciones || [];

    const handleCrearSesion = async (e) => {
        e.preventDefault();
        if (!cuestionarioId) return;
        try {
            setCreando(true);
            setError('');
            const nueva = await crearSesionV3({
                cuestionarioId,
                seccionId: seccionId || null,
                tituloSesion: tituloSesion.trim() || null,
                permitirNuevosIngresos: true,
                pedirSeccion,
                tiempoLimiteOverride: tiempoOverride !== '' ? parseInt(tiempoOverride, 10) : null
            });
            setMostrarCrear(false);
            setTituloSesion('');
            setTiempoOverride('');
            await cargarTodo();
            setSesionActiva(nueva);
            setSubVista('compartir');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al abrir la sesión.');
        } finally {
            setCreando(false);
        }
    };

    const abrirPanelSesion = async (sesion, vista = 'compartir') => {
        setSesionActiva(sesion);
        setSubVista(vista);
        if (vista === 'monitor') {
            setCargandoDetalle(true);
            try {
                setMonitorData(await obtenerMonitorSesionV3(sesion.id));
            } finally {
                setCargandoDetalle(false);
            }
        } else if (vista === 'acta') {
            setCargandoDetalle(true);
            try {
                setActaData(await obtenerActaSesionV3(sesion.id, true));
            } finally {
                setCargandoDetalle(false);
            }
        }
    };

    const handleCambiarEstado = async (sesion, nuevoEstado, permitirIngresos) => {
        try {
            const actualizada = await actualizarEstadoSesionV3(sesion.id, {
                estado: nuevoEstado,
                permitirNuevosIngresos: permitirIngresos
            });
            setSesiones((prev) => prev.map((s) => (s.id === actualizada.id ? actualizada : s)));
            if (sesionActiva?.id === actualizada.id) setSesionActiva(actualizada);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo cambiar el estado de la sesión.');
        }
    };

    const handleRegenerarCodigo = async (sesion) => {
        try {
            const actualizada = await regenerarCodigoSesionV3(sesion.id);
            setSesiones((prev) => prev.map((s) => (s.id === actualizada.id ? actualizada : s)));
            if (sesionActiva?.id === actualizada.id) setSesionActiva(actualizada);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo regenerar el código.');
        }
    };

    const handleAbrirDetalleIntento = async (intentoId) => {
        try {
            const det = await obtenerDetalleIntentoDocenteV3(intentoId);
            setIntentoDetalle(det);
            setNotaManualInput(det.notaFinal != null ? String(det.notaFinal) : '');
            setObservacionInput(det.observacionDocente || '');
            setAjustesRespuestas({});
        } catch (err) {
            setError('No se pudo cargar el detalle del intento.');
        }
    };

    const handleGuardarCalificacion = async () => {
        if (!intentoDetalle) return;
        try {
            setGuardandoNota(true);
            const respuestasAjustadas = Object.entries(ajustesRespuestas).map(([preguntaId, val]) => ({
                preguntaId,
                puntosObtenidos: val.puntosObtenidos !== '' ? parseFloat(val.puntosObtenidos) : null,
                esCorrecta: val.esCorrecta
            }));

            const payload = {
                notaFinal: notaManualInput !== '' && Object.keys(ajustesRespuestas).length === 0
                    ? parseFloat(notaManualInput)
                    : null,
                observacionDocente: observacionInput,
                respuestasAjustadas
            };

            const actualizado = await ajustarCalificacionIntentoV3(intentoDetalle.intentoId, payload);
            setIntentoDetalle(actualizado);
            setNotaManualInput(actualizado.notaFinal != null ? String(actualizado.notaFinal) : '');
            if (sesionActiva) {
                setActaData(await obtenerActaSesionV3(sesionActiva.id, true));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar la calificación.');
        } finally {
            setGuardandoNota(false);
        }
    };

    const exportarActaExcel = () => {
        if (!actaData) return;
        const filas = [...(actaData.acta || [])]
            .sort((a, b) => {
                const secCmp = (a.seccion || '').localeCompare(b.seccion || '');
                if (secCmp !== 0) return secCmp;
                const apeCmp = (a.apellidos || '').localeCompare(b.apellidos || '');
                return apeCmp !== 0 ? apeCmp : (a.nombres || '').localeCompare(b.nombres || '');
            })
            .map((f, idx) => ({
                'N°': idx + 1,
                Apellidos: f.apellidos,
                Nombres: f.nombres,
                Sección: f.seccion || '—',
                Estado: f.estado,
                Puntaje: `${f.puntajeObtenido} / ${f.puntajeMaximo}`,
                [`Nota (/${actaData.escalaNota})`]: f.notaFinal,
                Resultado: f.aprobado ? 'Aprobado' : 'Desaprobado',
                'Tiempo Empleado': formatDuracion(f.duracionSegundos),
                Advertencias: f.totalAdvertencias,
                Observación: f.observacionDocente || ''
            }));

        const ws = XLSX.utils.json_to_sheet(filas);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Acta de Notas');
        XLSX.writeFile(wb, `Acta_${(actaData.tituloSesion || 'Sesion').replace(/\s+/g, '_')}.xlsx`);
    };

    // Enlace limpio SIN PIN en URL: el alumno entra al portal y digita el código numérico
    const basePortal = esLocalhost && usarIpWifi ? `http://${ipLocal}:5173` : window.location.origin;
    const enlaceLimpio = `${basePortal}/unirse`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(enlaceLimpio)}&color=0f172a`;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                marginBottom: '22px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a' }}>
                        Sesiones de Evaluación en Aula
                    </h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                        Abre una sesión con código de 6 dígitos, comparte el link o QR limpio, monitorea en vivo y descarga el acta ordenada por apellidos.
                    </p>
                </div>

                <button
                    onClick={() => setMostrarCrear((v) => !v)}
                    style={{
                        backgroundColor: '#2563eb', color: '#ffffff', border: 'none',
                        padding: '11px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13.5px',
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Plus size={17} /> {mostrarCrear ? 'Cancelar' : 'Abrir Nueva Sesión'}
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                    borderRadius: '12px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <AlertCircle size={17} /> {error}
                </div>
            )}

            {mostrarCrear && (
                <form onSubmit={handleCrearSesion} style={{
                    backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0',
                    marginBottom: '22px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                        Configurar sesión en aula
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Cuestionario *
                            </label>
                            <select
                                required
                                value={cuestionarioId}
                                onChange={(e) => setCuestionarioId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                            >
                                <option value="">Selecciona un cuestionario...</option>
                                {cuestionarios.map((c) => (
                                    <option key={c.id} value={c.id}>{c.titulo}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Curso (para filtrar sección)
                            </label>
                            <select
                                value={cursoFiltroId}
                                onChange={(e) => {
                                    setCursoFiltroId(e.target.value);
                                    setSeccionId('');
                                }}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                            >
                                <option value="">Todas / Libre</option>
                                {cursos.map((cur) => (
                                    <option key={cur.id} value={cur.id}>{cur.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Sección fija (opcional)
                            </label>
                            <select
                                value={seccionId}
                                onChange={(e) => setSeccionId(e.target.value)}
                                disabled={!cursoFiltroId}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                            >
                                <option value="">Que el alumno elija</option>
                                {seccionesDelCursoSeleccionado.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Nombre de esta sesión (opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Parcial Unidad 1 - 5to A"
                                value={tituloSesion}
                                onChange={(e) => setTituloSesion(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Tiempo límite (min, opcional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Heredar del examen"
                                value={tiempoOverride}
                                onChange={(e) => setTiempoOverride(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#334155', marginTop: '18px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={pedirSeccion}
                                onChange={(e) => setPedirSeccion(e.target.checked)}
                            />
                            Pedir sección al alumno
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={creando || !cuestionarioId}
                        style={{
                            backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                            padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer'
                        }}
                    >
                        {creando ? 'Abriendo sesión...' : 'Generar Código y Abrir Sesión'}
                    </button>
                </form>
            )}

            {/* LISTA DE SESIONES */}
            {cargando ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando sesiones...</div>
            ) : sesiones.length === 0 ? (
                <div style={{
                    backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px 20px', textAlign: 'center',
                    border: '1px dashed #cbd5e1'
                }}>
                    <Radio size={38} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Sin sesiones creadas</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                        Abre una sesión para obtener un código numérico de 6 dígitos y compartir el enlace o QR con tus alumnos.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '26px' }}>
                    {sesiones.map((s) => {
                        const badge = BADGE_ESTADO_SESION[s.estado] || BADGE_ESTADO_SESION.ABIERTA;
                        const seleccionada = sesionActiva?.id === s.id;
                        return (
                            <div key={s.id} style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                padding: '18px 20px',
                                border: seleccionada ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#2563eb' }}>
                                            {s.cursoNombre} {s.seccionNombre ? `· ${s.seccionNombre}` : ''}
                                        </span>
                                        <h3 style={{ margin: '2px 0 0 0', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                                            {s.tituloSesion || s.cuestionarioTitulo}
                                        </h3>
                                    </div>
                                    <span style={{
                                        fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px',
                                        backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                                    }}>
                                        {badge.texto}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px',
                                    padding: '10px 14px', marginBottom: '12px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Código Numérico</div>
                                        <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '3px', color: '#38bdf8' }}>
                                            {s.codigoNumerico}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#cbd5e1' }}>
                                        <div><strong>{s.totalEnProgreso}</strong> en curso</div>
                                        <div><strong>{s.totalEntregados}</strong> entregados</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => abrirPanelSesion(s, 'compartir')}
                                        style={{
                                            flex: 1, padding: '8px 10px', borderRadius: '9px', border: '1px solid #cbd5e1',
                                            backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '12px',
                                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                        }}
                                    >
                                        <QrCode size={14} /> Link / QR
                                    </button>
                                    <button
                                        onClick={() => abrirPanelSesion(s, 'monitor')}
                                        style={{
                                            flex: 1, padding: '8px 10px', borderRadius: '9px', border: 'none',
                                            backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', fontSize: '12px',
                                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                        }}
                                    >
                                        <Radio size={14} /> En vivo
                                    </button>
                                    <button
                                        onClick={() => abrirPanelSesion(s, 'acta')}
                                        style={{
                                            flex: 1, padding: '8px 10px', borderRadius: '9px', border: 'none',
                                            backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '12px',
                                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                        }}
                                    >
                                        <BarChart3 size={14} /> Acta
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PANEL DETALLADO DE LA SESIÓN SELECCIONADA */}
            {sesionActiva && (
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: isMobile ? '18px 14px' : '24px 26px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
                                {sesionActiva.tituloSesion || sesionActiva.cuestionarioTitulo}
                            </h2>
                            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                Código: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{sesionActiva.codigoNumerico}</strong> · Estado: <strong>{sesionActiva.estado}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {sesionActiva.estado === 'ABIERTA' ? (
                                <button
                                    onClick={() => handleCambiarEstado(sesionActiva, 'PAUSADA', sesionActiva.permitirNuevosIngresos)}
                                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #fde68a', backgroundColor: '#fffbeb', color: '#b45309', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Pause size={14} /> Pausar
                                </button>
                            ) : sesionActiva.estado !== 'CERRADA' && (
                                <button
                                    onClick={() => handleCambiarEstado(sesionActiva, 'ABIERTA', true)}
                                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Play size={14} /> Reabrir
                                </button>
                            )}

                            {sesionActiva.estado !== 'CERRADA' && (
                                <>
                                    <button
                                        onClick={() => handleCambiarEstado(sesionActiva, null, !sesionActiva.permitirNuevosIngresos)}
                                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        {sesionActiva.permitirNuevosIngresos ? <Lock size={14} /> : <Unlock size={14} />}
                                        {sesionActiva.permitirNuevosIngresos ? 'Bloquear nuevos ingresos' : 'Permitir ingresos'}
                                    </button>
                                    <button
                                        onClick={() => handleCambiarEstado(sesionActiva, 'CERRADA', false)}
                                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Cerrar sesión
                                    </button>
                                </>
                            )}
                            <button onClick={() => setSesionActiva(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* TABS DEL PANEL */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'compartir', label: 'Link, QR y Código', icon: QrCode },
                            { id: 'monitor', label: 'Monitor en Vivo', icon: Radio },
                            { id: 'acta', label: 'Acta de Notas y Análisis', icon: BarChart3 }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const activo = subVista === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => abrirPanelSesion(sesionActiva, tab.id)}
                                    style={{
                                        padding: '9px 14px',
                                        borderRadius: '10px',
                                        border: activo ? 'none' : '1px solid #e2e8f0',
                                        backgroundColor: activo ? '#0f172a' : '#f8fafc',
                                        color: activo ? '#ffffff' : '#475569',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Icon size={15} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* SUBVISTA 1: COMPARTIR (LINK LIMPIO + QR + CÓDIGO SEPARADO) */}
                    {subVista === 'compartir' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '20px', alignItems: 'center' }}>
                            <div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
                                    borderRadius: '16px', padding: '18px 20px', color: '#ffffff', marginBottom: '16px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                                            Código numérico de acceso (dictar en aula)
                                        </div>
                                        <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '5px', color: '#38bdf8' }}>
                                            {sesionActiva.codigoNumerico}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(sesionActiva.codigoNumerico);
                                                setCopiadoCodigo(true);
                                                setTimeout(() => setCopiadoCodigo(false), 2000);
                                            }}
                                            style={{ backgroundColor: copiadoCodigo ? '#10b981' : '#334155', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 13px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            {copiadoCodigo ? <Check size={14} /> : <Copy size={14} />}
                                            {copiadoCodigo ? 'Copiado' : 'Copiar'}
                                        </button>
                                        {sesionActiva.estado !== 'CERRADA' && (
                                            <button
                                                onClick={() => handleRegenerarCodigo(sesionActiva)}
                                                title="Generar nuevo código numérico"
                                                style={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '10px', padding: '9px 12px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <RefreshCw size={14} /> Nuevo
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {esLocalhost && (
                                    <div style={{ marginBottom: '12px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={usarIpWifi} onChange={(e) => setUsarIpWifi(e.target.checked)} />
                                            Probar en celular (Wi-Fi)
                                        </label>
                                        {usarIpWifi && (
                                            <input
                                                type="text"
                                                value={ipLocal}
                                                onChange={(e) => setIpLocal(e.target.value)}
                                                placeholder="IP local ej. 192.168.1.25"
                                                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', width: '160px' }}
                                            />
                                        )}
                                    </div>
                                )}

                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Enlace limpio del portal (sin código incrustado)
                                </label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                    <input
                                        type="text"
                                        readOnly
                                        value={enlaceLimpio}
                                        style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px' }}
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(enlaceLimpio);
                                            setCopiadoLink(true);
                                            setTimeout(() => setCopiadoLink(false), 2000);
                                        }}
                                        style={{ backgroundColor: copiadoLink ? '#10b981' : '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 15px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        {copiadoLink ? '¡Copiado!' : 'Copiar Link'}
                                    </button>
                                </div>

                                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px', fontSize: '12.5px', color: '#1e3a8a' }}>
                                    <strong>Flujo del alumno:</strong>
                                    <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                                        <li>Abre el enlace o escanea el código QR.</li>
                                        <li>Ingresa el código numérico <strong>{sesionActiva.codigoNumerico}</strong>.</li>
                                        <li>Escribe sus <strong>nombres y apellidos</strong> para iniciar sin crear cuenta.</li>
                                    </ol>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    QR de acceso al portal
                                </div>
                                <img src={qrUrl} alt="QR Portal Alumno" style={{ width: '190px', height: '190px', borderRadius: '12px', backgroundColor: '#fff', padding: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                        </div>
                    )}

                    {/* SUBVISTA 2: MONITOR EN VIVO */}
                    {subVista === 'monitor' && (
                        cargandoDetalle && !monitorData ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Cargando monitor en vivo...</div>
                        ) : monitorData && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '12px', border: '1px solid #bfdbfe' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb' }}>EN CURSO</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a' }}>{monitorData.enProgreso}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#ecfdf5', borderRadius: '12px', padding: '12px', border: '1px solid #a7f3d0' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>ENTREGADOS</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#065f46' }}>{monitorData.entregados}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#fffbeb', borderRadius: '12px', padding: '12px', border: '1px solid #fde68a' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#d97706' }}>EXPIRADOS</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#92400e' }}>{monitorData.expirados}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '12px', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>ANULADOS</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#991b1b' }}>{monitorData.anulados}</div>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                                                <th style={{ padding: '10px' }}>Apellidos, Nombres</th>
                                                <th style={{ padding: '10px' }}>Sección</th>
                                                <th style={{ padding: '10px' }}>Estado</th>
                                                <th style={{ padding: '10px' }}>Progreso</th>
                                                <th style={{ padding: '10px' }}>Alertas</th>
                                                <th style={{ padding: '10px' }}>Nota</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(monitorData.alumnos || []).length === 0 ? (
                                                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Aún no ingresa ningún alumno con este código.</td></tr>
                                            ) : monitorData.alumnos.map((al) => (
                                                <tr key={al.intentoId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px', fontWeight: '700', color: '#0f172a' }}>
                                                        {al.apellidos}, {al.nombres}
                                                    </td>
                                                    <td style={{ padding: '10px', color: '#475569' }}>{al.seccion || '—'}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px',
                                                            backgroundColor: al.estado === 'EN_PROGRESO' ? '#dbeafe' : al.estado === 'ENTREGADO' ? '#dcfce7' : '#fee2e2',
                                                            color: al.estado === 'EN_PROGRESO' ? '#1d4ed8' : al.estado === 'ENTREGADO' ? '#15803d' : '#b91c1c'
                                                        }}>
                                                            {al.estado}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px', fontWeight: '600' }}>
                                                        {al.preguntasRespondidas} / {al.totalPreguntas}
                                                    </td>
                                                    <td style={{ padding: '10px', color: al.totalAdvertencias > 0 ? '#dc2626' : '#64748b', fontWeight: '700' }}>
                                                        {al.totalAdvertencias}
                                                    </td>
                                                    <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>
                                                        {al.notaFinal != null ? al.notaFinal : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}

                    {/* SUBVISTA 3: ACTA DE NOTAS Y ANÁLISIS REAL */}
                    {subVista === 'acta' && (
                        cargandoDetalle && !actaData ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Generando acta de notas...</div>
                        ) : actaData && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13.5px', color: '#334155' }}>
                                        <span><strong>Evaluados:</strong> {actaData.totalAlumnosOficiales}</span>
                                        <span><strong>Promedio:</strong> {actaData.promedioGeneral} / {actaData.escalaNota}</span>
                                        <span style={{ color: '#059669' }}><strong>Aprobados:</strong> {actaData.aprobados}</span>
                                        <span style={{ color: '#dc2626' }}><strong>Desaprobados:</strong> {actaData.desaprobados}</span>
                                    </div>
                                    <button
                                        onClick={exportarActaExcel}
                                        style={{
                                            backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '10px',
                                            padding: '9px 15px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: '7px'
                                        }}
                                    >
                                        <FileSpreadsheet size={16} /> Exportar Acta Excel
                                    </button>
                                </div>

                                <div style={{ overflowX: 'auto', marginBottom: '22px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                                                <th style={{ padding: '10px' }}>Apellidos, Nombres</th>
                                                <th style={{ padding: '10px' }}>Sección</th>
                                                <th style={{ padding: '10px' }}>Tiempo</th>
                                                <th style={{ padding: '10px' }}>Puntaje</th>
                                                <th style={{ padding: '10px' }}>Nota (/{actaData.escalaNota})</th>
                                                <th style={{ padding: '10px' }}>Resultado</th>
                                                <th style={{ padding: '10px' }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(actaData.acta || []).length === 0 ? (
                                                <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Sin entregas registradas todavía.</td></tr>
                                            ) : actaData.acta.map((f) => (
                                                <tr key={f.intentoId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px', fontWeight: '700', color: '#0f172a' }}>
                                                        {f.apellidos}, {f.nombres}
                                                        {f.requiereRevisionManual && (
                                                            <span style={{ marginLeft: '6px', fontSize: '10.5px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '6px' }}>
                                                                Revisar escrita
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px', color: '#475569' }}>{f.seccion || '—'}</td>
                                                    <td style={{ padding: '10px', color: '#475569' }}>{formatDuracion(f.duracionSegundos)}</td>
                                                    <td style={{ padding: '10px' }}>{f.puntajeObtenido} / {f.puntajeMaximo}</td>
                                                    <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>
                                                        {f.notaFinal != null ? f.notaFinal : '—'}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        {f.aprobado == null ? '—' : (
                                                            <span style={{
                                                                fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px',
                                                                backgroundColor: f.aprobado ? '#ecfdf5' : '#fef2f2',
                                                                color: f.aprobado ? '#059669' : '#dc2626'
                                                            }}>
                                                                {f.aprobado ? 'Aprobado' : 'Desaprobado'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <button
                                                            onClick={() => handleAbrirDetalleIntento(f.intentoId)}
                                                            style={{
                                                                backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                                                                borderRadius: '8px', padding: '5px 10px', fontWeight: '700', fontSize: '12px',
                                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                            }}
                                                        >
                                                            <Eye size={13} /> Revisar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ANÁLISIS REAL POR PREGUNTA */}
                                {(actaData.analisisPreguntas || []).length > 0 && (
                                    <div>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
                                            Diagnóstico real por pregunta
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {actaData.analisisPreguntas.map((pq) => (
                                                <div key={pq.preguntaId} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px'
                                                }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                                        {pq.orden}. {pq.enunciado}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                            {pq.respuestasCorrectas}/{pq.totalRespuestas} aciertos
                                                        </span>
                                                        <span style={{
                                                            fontSize: '12px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px',
                                                            backgroundColor: pq.tasaAciertos >= 70 ? '#ecfdf5' : pq.tasaAciertos >= 45 ? '#fffbeb' : '#fef2f2',
                                                            color: pq.tasaAciertos >= 70 ? '#059669' : pq.tasaAciertos >= 45 ? '#d97706' : '#dc2626'
                                                        }}>
                                                            {pq.tasaAciertos}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* MODAL DE REVISIÓN Y CALIFICACIÓN MANUAL */}
            {intentoDetalle && (
                <div onClick={() => setIntentoDetalle(null)} style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1200
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '720px',
                        maxHeight: '90vh', overflowY: 'auto', padding: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                    {intentoDetalle.apellidos}, {intentoDetalle.nombres}
                                </h3>
                                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                                    Nota actual: <strong>{intentoDetalle.notaFinal} / {intentoDetalle.escalaNota}</strong> · Tiempo: {formatDuracion(intentoDetalle.duracionSegundos)}
                                </div>
                            </div>
                            <button onClick={() => setIntentoDetalle(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {intentoDetalle.eventosSeguridad?.length > 0 && (
                            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#92400e' }}>
                                <strong>Eventos de seguridad ({intentoDetalle.eventosSeguridad.length}):</strong>{' '}
                                {intentoDetalle.eventosSeguridad.map((ev) => `${ev.tipoEvento} (${new Date(ev.occurredAt).toLocaleTimeString()})`).join(' · ')}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                            {intentoDetalle.respuestas.map((r) => {
                                const ajuste = ajustesRespuestas[r.preguntaId];
                                return (
                                    <div key={r.respuestaId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                                            {r.orden}. {r.enunciado}
                                        </div>
                                        <div style={{ fontSize: '12.5px', color: '#334155', marginBottom: '6px' }}>
                                            <strong>Respuesta:</strong>{' '}
                                            {r.respuestaTexto || (r.opcionesSeleccionadasTexto?.length ? r.opcionesSeleccionadasTexto.join(', ') : 'Sin responder')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                                            <span>Puntos:</span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max={r.puntosAsignados}
                                                value={ajuste?.puntosObtenidos ?? r.puntosObtenidos}
                                                onChange={(e) => setAjustesRespuestas((prev) => ({
                                                    ...prev,
                                                    [r.preguntaId]: {
                                                        puntosObtenidos: e.target.value,
                                                        esCorrecta: parseFloat(e.target.value) > 0
                                                    }
                                                }))}
                                                style={{ width: '75px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                            <span style={{ color: '#64748b' }}>/ {r.puntosAsignados}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '10px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                    Nota final directa (opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={intentoDetalle.escalaNota}
                                    value={notaManualInput}
                                    onChange={(e) => setNotaManualInput(e.target.value)}
                                    style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                    Observación del docente
                                </label>
                                <input
                                    type="text"
                                    value={observacionInput}
                                    onChange={(e) => setObservacionInput(e.target.value)}
                                    placeholder="Comentario para el acta..."
                                    style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setIntentoDetalle(null)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                                Cerrar
                            </button>
                            <button
                                onClick={handleGuardarCalificacion}
                                disabled={guardandoNota}
                                style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Save size={15} /> {guardandoNota ? 'Guardando...' : 'Guardar Calificación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

