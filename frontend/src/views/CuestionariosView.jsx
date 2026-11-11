import React, { useState } from 'react';
import CrearCuestionarioModal from '../components/modals/CrearCuestionarioModal';
import CompartirCuestionarioModal from '../components/modals/CompartirCuestionarioModal';
import AuditoriaResultadosModal from '../components/modals/AuditoriaResultadosModal';
import EliminarCuestionarioModal from '../components/modals/EliminarCuestionarioModal';
import useResponsive from '../hooks/useResponsive';
import { obtenerCuestionarioPorId, eliminarCuestionario, obtenerAuditoriaCuestionario } from '../services/cuestionarioService';
import { exportarNotasExcel } from '../services/excelService';
import {
    Search,
    Plus,
    FileText,
    MessageSquare,
    Users,
    Award,
    Key,
    Calendar,
    Share2,
    Edit3,
    ClipboardCheck,
    Trash2,
    Clock,
    Shuffle,
    ShieldAlert,
    Download,
    RotateCcw
} from 'lucide-react';

const obtenerEstadoDisponibilidadBadge = (c) => {
    if (!c.fechaInicio && !c.fechaFin) return null;
    const ahora = new Date();
    const inicio = c.fechaInicio ? new Date(c.fechaInicio) : null;
    const fin = c.fechaFin ? new Date(c.fechaFin) : null;

    if (inicio && ahora < inicio) {
        return {
            texto: 'Programado',
            color: '#b45309',
            bg: '#fef3c7',
            border: '#fde68a'
        };
    }
    if (fin && ahora > fin) {
        return {
            texto: 'Cerrado',
            color: '#b91c1c',
            bg: '#fee2e2',
            border: '#fca5a5'
        };
    }
    return {
        texto: 'Abierto',
        color: '#15803d',
        bg: '#dcfce7',
        border: '#86efac'
    };
};

const formatearRangoFechas = (c) => {
    if (!c.fechaInicio && !c.fechaFin) return null;
    const pad = (n) => String(n).padStart(2, '0');
    const formatF = (dStr) => {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return '';
        return `${d.getDate()}/${d.getMonth() + 1} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    if (c.fechaInicio && c.fechaFin) {
        return `${formatF(c.fechaInicio)} al ${formatF(c.fechaFin)}`;
    }
    if (c.fechaInicio) {
        return `Abre: ${formatF(c.fechaInicio)}`;
    }
    return `Cierra: ${formatF(c.fechaFin)}`;
};

export default function CuestionariosView({ cuestionarios, estadisticas, onRecargarCuestionarios }) {
    const { isMobile } = useResponsive();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuestionarioAEditar, setCuestionarioAEditar] = useState(null);
    const [cargandoEdicionId, setCargandoEdicionId] = useState(null);
    const [descargandoExcelId, setDescargandoExcelId] = useState(null);
    const [cuestionarioParaCompartir, setCuestionarioParaCompartir] = useState(null);
    const [cuestionarioParaAuditar, setCuestionarioParaAuditar] = useState(null);
    const [cuestionarioParaEliminar, setCuestionarioParaEliminar] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Filtramos los cuestionarios según lo que escriban en el buscador
    const cuestionariosFiltrados = cuestionarios.filter(c =>
        c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const promedioGeneralTexto = (estadisticas?.promedioGeneral > 0)
        ? `${estadisticas.promedioGeneral.toFixed(1)} / 20`
        : '0.0 / 20';

    const totalRespuestasTexto = estadisticas?.totalRespuestas ?? cuestionarios.reduce((acc, curr) => acc + (curr.totalRespuestas || 0), 0);
    const alumnosUnicosTexto = estadisticas?.alumnosUnicos ?? 0;

    const handleNuevoCuestionario = () => {
        setCuestionarioAEditar(null);
        setIsModalOpen(true);
    };

    const handleEditarCuestionario = async (cuestionario) => {
        try {
            setCargandoEdicionId(cuestionario.id);
            const cuestionarioCompleto = await obtenerCuestionarioPorId(cuestionario.id);
            setCuestionarioAEditar(cuestionarioCompleto);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error al cargar cuestionario para editar:', err);
            setCuestionarioAEditar(cuestionario);
            setIsModalOpen(true);
        } finally {
            setCargandoEdicionId(null);
        }
    };

    const handleCerrarModal = () => {
        setIsModalOpen(false);
        setCuestionarioAEditar(null);
    };

    const handleConfirmarEliminacion = async (cuestionario) => {
        try {
            await eliminarCuestionario(cuestionario.id);
            if (onRecargarCuestionarios) {
                onRecargarCuestionarios();
            }
        } catch (err) {
            console.error('Error al eliminar el cuestionario:', err);
            alert('No se pudo eliminar el cuestionario.');
            throw err;
        }
    };

    const handleDescargarExcelDirecto = async (cuestionario) => {
        try {
            setDescargandoExcelId(cuestionario.id);
            const dataAuditoria = await obtenerAuditoriaCuestionario(cuestionario.id);
            exportarNotasExcel(cuestionario, dataAuditoria);
        } catch (err) {
            console.error('Error al descargar las notas en Excel:', err);
            alert('No se pudieron exportar las notas del cuestionario. Asegúrate de que el servidor esté activo.');
        } finally {
            setDescargandoExcelId(null);
        }
    };

    return (
        <div>

            {/* Cabecera y Buscador */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '0',
                marginBottom: '28px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Mis Cuestionarios
                    </h2>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        Gestión académica y control de evaluaciones · Ciclo 2026-B
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '10px' : '12px',
                    alignItems: isMobile ? 'stretch' : 'center',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    {/* Barra de Búsqueda */}
                    <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar por título o materia..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                padding: '11px 16px 11px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '13px',
                                width: isMobile ? '100%' : '260px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                color: '#1e293b'
                            }}
                        />
                    </div>

                    {/* Botón Nuevo Cuestionario */}
                    <button
                        onClick={handleNuevoCuestionario}
                        className="interactive-card"
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '11px 20px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: isMobile ? '100%' : 'auto',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Plus size={18} strokeWidth={2.5} /> Crear Cuestionario
                    </button>
                </div>
            </div>

            {/* Tarjetas de Métricas Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {/* 1. Total Cuestionarios */}
                <div className="interactive-card" style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #3b82f6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Cuestionarios
                        </span>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={17} color="#2563eb" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>{cuestionarios.length}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Activos en plataforma</div>
                    </div>
                </div>

                {/* 2. Total Respuestas */}
                <div className="interactive-card" style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #f59e0b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Respuestas Totales
                        </span>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={17} color="#d97706" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', letterSpacing: '-0.02em' }}>
                            {totalRespuestasTexto}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Entregas recibidas</div>
                    </div>
                </div>

                {/* 3. Alumnos Únicos */}
                <div className="interactive-card" style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #8b5cf6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Alumnos Únicos
                        </span>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={17} color="#7c3aed" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed', letterSpacing: '-0.02em' }}>
                            {alumnosUnicosTexto}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Estudiantes evaluados</div>
                    </div>
                </div>

                {/* 4. Promedio General */}
                <div className="interactive-card" style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #10b981',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Promedio General
                        </span>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={17} color="#059669" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669', letterSpacing: '-0.02em' }}>
                            {promedioGeneralTexto}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Escala vigesimal (0-20)</div>
                    </div>
                </div>
            </div>

            {/* Grid de Tarjetas de Cuestionarios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                {cuestionariosFiltrados.length > 0 ? (
                    cuestionariosFiltrados.map((cuestionario) => {
                        const respuestasCount = cuestionario.totalRespuestas || 0;
                        const promCuestionario = (cuestionario.promedioCalificacion && cuestionario.promedioCalificacion > 0)
                            ? `${cuestionario.promedioCalificacion.toFixed(1)} / 20`
                            : 'Sin intentos';

                        const badgeEstado = obtenerEstadoDisponibilidadBadge(cuestionario);
                        const rangoFechas = formatearRangoFechas(cuestionario);

                        return (
                            <div key={cuestionario.id} className="interactive-card" style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '18px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid #e2e8f0',
                                position: 'relative'
                            }}>
                                <div>
                                    {/* Chips de estado y configuración */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '14px' }}>
                                        {badgeEstado ? (
                                            <span style={{
                                                backgroundColor: badgeEstado.bg,
                                                color: badgeEstado.color,
                                                border: `1px solid ${badgeEstado.border}`,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badgeEstado.color }} />
                                                {badgeEstado.texto}
                                            </span>
                                        ) : (
                                            <span style={{
                                                backgroundColor: '#dcfce7',
                                                color: '#15803d',
                                                border: '1px solid #86efac',
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }} />
                                                Activo
                                            </span>
                                        )}

                                        <span style={{
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            border: '1px solid #bfdbfe',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>
                                            {respuestasCount} {respuestasCount === 1 ? 'respuesta' : 'respuestas'}
                                        </span>

                                        {/* Límite de Intentos */}
                                        <span style={{
                                            backgroundColor: '#f5f3ff',
                                            color: '#6d28d9',
                                            border: '1px solid #ddd6fe',
                                            padding: '3px 9px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <RotateCcw size={11} /> {cuestionario.limiteIntentos === 0 
                                                ? 'Ilimitado' 
                                                : cuestionario.limiteIntentos ? `${cuestionario.limiteIntentos} intento${cuestionario.limiteIntentos > 1 ? 's' : ''}` : '1 intento'}
                                        </span>

                                        {cuestionario.tiempoLimiteMinutos > 0 && (
                                            <span style={{
                                                backgroundColor: '#fffbeb',
                                                color: '#b45309',
                                                border: '1px solid #fde68a',
                                                padding: '3px 9px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <Clock size={11} /> {cuestionario.tiempoLimiteMinutos}m
                                            </span>
                                        )}

                                        {cuestionario.modoSeguro && (
                                            <span style={{
                                                backgroundColor: '#fef2f2',
                                                color: '#b91c1c',
                                                border: '1px solid #fecaca',
                                                padding: '3px 9px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <ShieldAlert size={11} /> Seguro
                                            </span>
                                        )}
                                    </div>

                                    {/* Título y Descripción */}
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                                        {cuestionario.titulo}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '13px',
                                        color: '#64748b',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {cuestionario.descripcion || 'Sin descripción detallada registrada.'}
                                    </p>

                                    {/* Metadatos (Fechas y Calificación) */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginBottom: '20px',
                                        backgroundColor: '#f8fafc',
                                        padding: '10px 12px',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '500' }}>
                                            <Calendar size={13} color="#64748b" /> {rangoFechas ? rangoFechas : 'Sin límite de fecha'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontWeight: '700' }}>
                                            <Award size={14} color="#059669" /> {promCuestionario}
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de Acción Reorganizados e Intuitivos */}
                                <div style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px'
                                }}>
                                    {/* Acción Principal: Compartir */}
                                    <button
                                        onClick={() => setCuestionarioParaCompartir(cuestionario)}
                                        title="Compartir enlace o código QR con los alumnos"
                                        style={{
                                            backgroundColor: '#ecfdf5',
                                            color: '#059669',
                                            border: '1px solid #a7f3d0',
                                            borderRadius: '8px',
                                            padding: '7px 12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontWeight: '700',
                                            fontSize: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Share2 size={14} /> Compartir
                                    </button>

                                    {/* Acciones Secundarias agrupadas */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {/* Descargar Excel */}
                                        <button
                                            onClick={() => handleDescargarExcelDirecto(cuestionario)}
                                            disabled={descargandoExcelId === cuestionario.id}
                                            title="Exportar notas a Excel (.xlsx)"
                                            style={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                color: '#047857',
                                                borderRadius: '8px',
                                                padding: '7px 10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontWeight: '600',
                                                fontSize: '12px',
                                                opacity: descargandoExcelId === cuestionario.id ? 0.6 : 1,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Download size={13} /> {descargandoExcelId === cuestionario.id ? '...' : 'Excel'}
                                        </button>

                                        {/* Auditar Resultados */}
                                        <button
                                            onClick={() => setCuestionarioParaAuditar(cuestionario)}
                                            title="Ver respuestas detalladas y auditoría de participantes"
                                            style={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                color: '#334155',
                                                borderRadius: '8px',
                                                padding: '7px 10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontWeight: '600',
                                                fontSize: '12px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <ClipboardCheck size={14} color="#6366f1" /> Auditar
                                        </button>

                                        {/* Editar */}
                                        <button
                                            onClick={() => handleEditarCuestionario(cuestionario)}
                                            disabled={cargandoEdicionId === cuestionario.id}
                                            title="Modificar preguntas y configuración"
                                            style={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                color: '#475569',
                                                borderRadius: '8px',
                                                padding: '7px 9px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                opacity: cargandoEdicionId === cuestionario.id ? 0.6 : 1,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Edit3 size={14} />
                                        </button>

                                        {/* Eliminar */}
                                        <button
                                            onClick={() => setCuestionarioParaEliminar(cuestionario)}
                                            title="Eliminar este cuestionario"
                                            style={{
                                                backgroundColor: '#fff1f2',
                                                border: '1px solid #fecdd3',
                                                color: '#e11d48',
                                                borderRadius: '8px',
                                                padding: '7px 9px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        background: '#ffffff',
                        padding: '60px 20px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            color: '#94a3b8'
                        }}>
                            <FileText size={26} />
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                            {busqueda ? 'No se encontraron resultados' : 'Aún no tienes cuestionarios'}
                        </h4>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', maxWidth: '380px', marginInline: 'auto' }}>
                            {busqueda
                                ? `No hay cuestionarios que coincidan con "${busqueda}". Intenta con otros términos.`
                                : 'Comienza a crear tu primer cuestionario evaluativo para compartirlo con tus alumnos.'}
                        </p>
                        {busqueda ? (
                            <button
                                onClick={() => setBusqueda('')}
                                style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                Limpiar búsqueda
                            </button>
                        ) : (
                            <button
                                onClick={handleNuevoCuestionario}
                                style={{
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                + Crear mi primer cuestionario
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal para Crear / Editar Cuestionario */}
            <CrearCuestionarioModal
                isOpen={isModalOpen}
                onClose={handleCerrarModal}
                cuestionarioAEditar={cuestionarioAEditar}
                onCuestionarioCreado={(resultado) => {
                    if (onRecargarCuestionarios) {
                        onRecargarCuestionarios();
                    }
                    if (resultado && !cuestionarioAEditar) {
                        // Solo abrir modal de compartir si fue creación nueva
                        setCuestionarioParaCompartir(resultado);
                    }
                    handleCerrarModal();
                }}
            />

            {/* Modal para Compartir Cuestionario con QR */}
            <CompartirCuestionarioModal
                isOpen={Boolean(cuestionarioParaCompartir)}
                onClose={() => setCuestionarioParaCompartir(null)}
                cuestionario={cuestionarioParaCompartir}
            />

            {/* Modal para Auditoría de Resultados */}
            <AuditoriaResultadosModal
                isOpen={Boolean(cuestionarioParaAuditar)}
                onClose={() => setCuestionarioParaAuditar(null)}
                cuestionario={cuestionarioParaAuditar}
                onActualizado={() => {
                    if (onRecargarCuestionarios) {
                        onRecargarCuestionarios();
                    }
                }}
            />

            {/* Modal para Confirmar Eliminación */}
            <EliminarCuestionarioModal
                isOpen={Boolean(cuestionarioParaEliminar)}
                onClose={() => setCuestionarioParaEliminar(null)}
                cuestionario={cuestionarioParaEliminar}
                onConfirmarEliminacion={handleConfirmarEliminacion}
            />
        </div>
    );
}