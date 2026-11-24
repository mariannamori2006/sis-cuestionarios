import React, { useState } from 'react';
import CrearCuestionarioModal from '../components/modals/CrearCuestionarioModal';
import CompartirCuestionarioModal from '../components/modals/CompartirCuestionarioModal';
import AuditoriaResultadosModal from '../components/modals/AuditoriaResultadosModal';
import EliminarCuestionarioModal from '../components/modals/EliminarCuestionarioModal';
import AlertaModal from '../components/modals/AlertaModal';
import useResponsive from '../hooks/useResponsive';
import { obtenerCuestionarioPorId, eliminarCuestionario, obtenerAuditoriaCuestionario } from '../services/cuestionarioService';
import { exportarNotasExcel } from '../services/excelService';
import {
    Search,
    Plus,
    FileText,
    Calendar,
    Share2,
    Edit3,
    Trash2,
    Clock,
    Download,
    RotateCcw,
    LayoutGrid,
    List,
    Copy,
    Check,
    BarChart3,
    Shield
} from 'lucide-react';

const obtenerEstadoBadge = (c) => {
    if (!c.fechaInicio && !c.fechaFin) return { texto: 'Abierto', color: '#16a34a' };
    const ahora = new Date();
    const inicio = c.fechaInicio ? new Date(c.fechaInicio) : null;
    const fin = c.fechaFin ? new Date(c.fechaFin) : null;

    if (inicio && ahora < inicio) return { texto: 'Programado', color: '#d97706' };
    if (fin && ahora > fin) return { texto: 'Cerrado', color: '#dc2626' };
    return { texto: 'Abierto', color: '#16a34a' };
};

const formatearRangoFechas = (c) => {
    if (!c.fechaInicio && !c.fechaFin) return null;
    const pad = (n) => String(n).padStart(2, '0');
    const formatF = (dStr) => {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return '';
        return `${d.getDate()}/${d.getMonth() + 1} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    if (c.fechaInicio && c.fechaFin) return `${formatF(c.fechaInicio)} – ${formatF(c.fechaFin)}`;
    if (c.fechaInicio) return `Abre: ${formatF(c.fechaInicio)}`;
    return `Cierra: ${formatF(c.fechaFin)}`;
};

export default function CuestionariosView({ cuestionarios, estadisticas, onRecargarCuestionarios, onConfigurarCuestionario }) {
    const { isMobile } = useResponsive();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuestionarioAEditar, setCuestionarioAEditar] = useState(null);
    const [cargandoEdicionId, setCargandoEdicionId] = useState(null);
    const [descargandoExcelId, setDescargandoExcelId] = useState(null);
    const [cuestionarioParaCompartir, setCuestionarioParaCompartir] = useState(null);
    const [cuestionarioParaAuditar, setCuestionarioParaAuditar] = useState(null);
    const [cuestionarioParaEliminar, setCuestionarioParaEliminar] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [vistaModo, setVistaModo] = useState(() => localStorage.getItem('nativatec_cuestionarios_view') || 'grid');
    const [copiadoId, setCopiadoId] = useState(null);

    const [alerta, setAlerta] = useState({
        isOpen: false,
        tipo: 'warning',
        titulo: '',
        mensaje: '',
        sugerencia: '',
        textoBoton: 'Entendido'
    });

    const cambiarVistaModo = (modo) => {
        setVistaModo(modo);
        localStorage.setItem('nativatec_cuestionarios_view', modo);
    };

    const copiarPin = (e, cuestionario) => {
        e.stopPropagation();
        const pin = cuestionario.codigoAcceso || cuestionario.pin || cuestionario.id;
        navigator.clipboard.writeText(String(pin));
        setCopiadoId(cuestionario.id);
        setTimeout(() => setCopiadoId(null), 1500);
    };

    const mostrarAlerta = (titulo, mensaje, tipo = 'warning', sugerencia = '', textoBoton = 'Entendido') => {
        setAlerta({ isOpen: true, tipo, titulo, mensaje, sugerencia, textoBoton });
    };

    const cerrarAlerta = () => {
        setAlerta(prev => ({ ...prev, isOpen: false }));
    };

    // Conteo para filtros
    const totalAbiertos = cuestionarios.filter(c => obtenerEstadoBadge(c).texto === 'Abierto').length;
    const totalProgramados = cuestionarios.filter(c => obtenerEstadoBadge(c).texto === 'Programado').length;
    const totalCerrados = cuestionarios.filter(c => obtenerEstadoBadge(c).texto === 'Cerrado').length;

    // Filtrado
    const cuestionariosFiltrados = cuestionarios.filter(c => {
        const coincide = c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        if (!coincide) return false;
        if (filtroEstado === 'TODOS') return true;
        return obtenerEstadoBadge(c).texto.toUpperCase() === filtroEstado;
    });

    const promedioGeneralTexto = (estadisticas?.promedioGeneral > 0)
        ? `${estadisticas.promedioGeneral.toFixed(1)} / 20`
        : '—';
    const totalRespuestasTexto = estadisticas?.totalRespuestas ?? cuestionarios.reduce((acc, curr) => acc + (curr.totalRespuestas || 0), 0);

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
            setCuestionarioAEditar(cuestionario);
            setIsModalOpen(true);
        } finally {
            setCargandoEdicionId(null);
        }
    };

    const handleConfirmarEliminacion = async (cuestionario) => {
        try {
            await eliminarCuestionario(cuestionario.id);
            if (onRecargarCuestionarios) onRecargarCuestionarios();
        } catch (err) {
            mostrarAlerta('No se pudo eliminar', 'Ocurrió un error al intentar eliminar.', 'error');
            throw err;
        }
    };

    const handleDescargarExcelDirecto = async (cuestionario) => {
        try {
            setDescargandoExcelId(cuestionario.id);
            const dataAuditoria = await obtenerAuditoriaCuestionario(cuestionario.id);
            exportarNotasExcel(cuestionario, dataAuditoria);
        } catch (err) {
            mostrarAlerta('Error al exportar', 'No se pudieron descargar las notas en Excel.', 'error');
        } finally {
            setDescargandoExcelId(null);
        }
    };

    if (isModalOpen) {
        return (
            <CrearCuestionarioModal
                isOpen={true}
                onClose={() => { setIsModalOpen(false); setCuestionarioAEditar(null); }}
                cuestionarioAEditar={cuestionarioAEditar}
                onIrAConfiguracion={(c) => {
                    setIsModalOpen(false);
                    if (onConfigurarCuestionario) onConfigurarCuestionario(c);
                }}
                onCuestionarioCreado={(resultado) => {
                    if (onRecargarCuestionarios) onRecargarCuestionarios();
                    if (resultado && !cuestionarioAEditar) setCuestionarioParaCompartir(resultado);
                    setIsModalOpen(false);
                    setCuestionarioAEditar(null);
                }}
            />
        );
    }

    return (
        <div style={{ maxWidth: '1280px', boxSizing: 'border-box' }}>

            {/* HEADER SUPERIOR: Limpio y directo */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '20px',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Cuestionarios
                    </h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', fontWeight: '400' }}>
                        Gestiona tus evaluaciones, revisa notas y comparte accesos con tus alumnos.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    {/* Buscador limpio */}
                    <div style={{ position: 'relative', flex: isMobile ? 1 : 'unset' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar cuestionario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                width: isMobile ? '100%' : '240px',
                                padding: '8px 12px 8px 36px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '13px',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Botón Crear */}
                    <button
                        onClick={handleNuevoCuestionario}
                        style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; }}
                    >
                        <Plus size={16} />
                        <span>Crear examen</span>
                    </button>
                </div>
            </div>

            {/* BARRA DE METRICAS SUTILES (Estilo Stripe/Linear) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Total Cuestionarios</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{cuestionarios.length}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Entregas Realizadas</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{totalRespuestasTexto}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Promedio Calificación</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#059669' }}>{promedioGeneralTexto}</div>
                </div>
            </div>

            {/* FILTROS Y VISTAS: Segment control limpio */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                gap: '10px',
                flexWrap: 'wrap'
            }}>
                {/* Pestañas */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                    {[
                        { id: 'TODOS', label: 'Todos', count: cuestionarios.length },
                        { id: 'ABIERTO', label: 'Abiertos', count: totalAbiertos },
                        { id: 'PROGRAMADO', label: 'Programados', count: totalProgramados },
                        { id: 'CERRADO', label: 'Cerrados', count: totalCerrados }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFiltroEstado(tab.id)}
                            style={{
                                border: 'none',
                                background: filtroEstado === tab.id ? '#ffffff' : 'transparent',
                                color: filtroEstado === tab.id ? '#0f172a' : '#64748b',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: filtroEstado === tab.id ? '600' : '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: filtroEstado === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <span>{tab.label}</span>
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Grid / Lista */}
                <div style={{ display: 'flex', gap: '2px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                    <button
                        onClick={() => cambiarVistaModo('grid')}
                        title="Cuadrícula"
                        style={{
                            border: 'none',
                            background: vistaModo === 'grid' ? '#ffffff' : 'transparent',
                            color: vistaModo === 'grid' ? '#0f172a' : '#64748b',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <LayoutGrid size={15} />
                    </button>
                    <button
                        onClick={() => cambiarVistaModo('tabla')}
                        title="Lista"
                        style={{
                            border: 'none',
                            background: vistaModo === 'tabla' ? '#ffffff' : 'transparent',
                            color: vistaModo === 'tabla' ? '#0f172a' : '#64748b',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <List size={15} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            {vistaModo === 'grid' ? (
                /* GRID DE TARJETAS LIMPIAS */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '14px'
                }}>
                    {cuestionariosFiltrados.length > 0 ? (
                        cuestionariosFiltrados.map((cuestionario) => {
                            const badge = obtenerEstadoBadge(cuestionario);
                            const pinCodigo = cuestionario.codigoAcceso || cuestionario.pin || cuestionario.id;
                            const prom = (cuestionario.promedioCalificacion && cuestionario.promedioCalificacion > 0)
                                ? `${cuestionario.promedioCalificacion.toFixed(1)} / 20`
                                : '—';
                            const rango = formatearRangoFechas(cuestionario);

                            return (
                                <div
                                    key={cuestionario.id}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div>
                                        {/* Barra superior: Estado discreto + PIN */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: badge.color }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color }} />
                                                <span>{badge.texto}</span>
                                            </div>

                                            <button
                                                onClick={(e) => copiarPin(e, cuestionario)}
                                                title="Copiar código PIN"
                                                style={{
                                                    background: copiadoId === cuestionario.id ? '#ecfdf5' : '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    color: copiadoId === cuestionario.id ? '#059669' : '#64748b',
                                                    borderRadius: '6px',
                                                    padding: '3px 7px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontFamily: 'monospace'
                                                }}
                                            >
                                                {copiadoId === cuestionario.id ? <Check size={11} /> : <Copy size={11} />}
                                                <span>{copiadoId === cuestionario.id ? 'Copiado' : pinCodigo}</span>
                                            </button>
                                        </div>

                                        {/* Título y Descripción */}
                                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: 1.3 }}>
                                            {cuestionario.titulo}
                                        </h3>
                                        <p style={{
                                            margin: '0 0 14px 0',
                                            fontSize: '13px',
                                            color: '#64748b',
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {cuestionario.descripcion || 'Sin descripción.'}
                                        </p>

                                        {/* Metadata discreta en una sola línea */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                                            <span><b>{cuestionario.totalRespuestas || 0}</b> entregas</span>
                                            {cuestionario.tiempoLimiteMinutos > 0 && <span>• <b>{cuestionario.tiempoLimiteMinutos}m</b> tiempo</span>}
                                            {cuestionario.modoSeguro && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#b91c1c' }}>
                                                    • <Shield size={11} /> Antifraude
                                                </span>
                                            )}
                                        </div>

                                        {/* Promedio y Fechas */}
                                        <div style={{
                                            borderTop: '1px solid #f1f5f9',
                                            paddingTop: '10px',
                                            marginBottom: '14px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '11px',
                                            color: '#64748b'
                                        }}>
                                            <span>{rango || 'Sin límite de fecha'}</span>
                                            <span style={{ fontWeight: '700', color: '#0f172a' }}>Nota prom: {prom}</span>
                                        </div>
                                    </div>

                                    {/* Botones de Acción: Limpios y funcionales */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <button
                                            onClick={() => setCuestionarioParaAuditar(cuestionario)}
                                            style={{
                                                flex: 1,
                                                padding: '7px 12px',
                                                background: '#0f172a',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; }}
                                        >
                                            Ver notas
                                        </button>

                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => setCuestionarioParaCompartir(cuestionario)}
                                                title="Compartir QR"
                                                style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDescargarExcelDirecto(cuestionario)}
                                                title="Excel"
                                                style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#16a34a' }}
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleEditarCuestionario(cuestionario)}
                                                title="Editar preguntas"
                                                style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setCuestionarioParaEliminar(cuestionario)}
                                                title="Eliminar"
                                                style={{ padding: '6px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '6px', cursor: 'pointer', color: '#e11d48' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '48px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                                {busqueda ? `No hay resultados para "${busqueda}"` : 'No hay cuestionarios registrados en esta sección'}
                            </div>
                            <button
                                onClick={handleNuevoCuestionario}
                                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Crear cuestionario
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* MODO TABLA COMPACTA */
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px' }}>
                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Cuestionario</th>
                                <th style={{ padding: '12px 12px', fontWeight: '600' }}>Estado</th>
                                <th style={{ padding: '12px 12px', fontWeight: '600' }}>PIN</th>
                                <th style={{ padding: '12px 12px', fontWeight: '600' }}>Entregas</th>
                                <th style={{ padding: '12px 12px', fontWeight: '600' }}>Promedio</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuestionariosFiltrados.map((cuestionario) => {
                                const badge = obtenerEstadoBadge(cuestionario);
                                const pin = cuestionario.codigoAcceso || cuestionario.pin || cuestionario.id;
                                const prom = (cuestionario.promedioCalificacion && cuestionario.promedioCalificacion > 0)
                                    ? `${cuestionario.promedioCalificacion.toFixed(1)} / 20`
                                    : '—';

                                return (
                                    <tr key={cuestionario.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                                            {cuestionario.titulo}
                                        </td>
                                        <td style={{ padding: '12px 12px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: badge.color, fontWeight: '600', fontSize: '12px' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color }} />
                                                {badge.texto}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 12px', fontFamily: 'monospace', fontSize: '12px', color: '#334155' }}>
                                            {pin}
                                        </td>
                                        <td style={{ padding: '12px 12px', color: '#334155' }}>
                                            {cuestionario.totalRespuestas || 0}
                                        </td>
                                        <td style={{ padding: '12px 12px', fontWeight: '600', color: '#0f172a' }}>
                                            {prom}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => setCuestionarioParaAuditar(cuestionario)}
                                                    style={{ padding: '4px 8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    Notas
                                                </button>
                                                <button
                                                    onClick={() => setCuestionarioParaCompartir(cuestionario)}
                                                    title="QR"
                                                    style={{ padding: '4px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Share2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDescargarExcelDirecto(cuestionario)}
                                                    title="Excel"
                                                    style={{ padding: '4px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', color: '#16a34a' }}
                                                >
                                                    <Download size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditarCuestionario(cuestionario)}
                                                    title="Editar"
                                                    style={{ padding: '4px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setCuestionarioParaEliminar(cuestionario)}
                                                    title="Eliminar"
                                                    style={{ padding: '4px 6px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '4px', cursor: 'pointer', color: '#e11d48' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODALES DEL SISTEMA */}
            <CompartirCuestionarioModal
                isOpen={Boolean(cuestionarioParaCompartir)}
                onClose={() => setCuestionarioParaCompartir(null)}
                cuestionario={cuestionarioParaCompartir}
            />

            <AuditoriaResultadosModal
                isOpen={Boolean(cuestionarioParaAuditar)}
                onClose={() => setCuestionarioParaAuditar(null)}
                cuestionario={cuestionarioParaAuditar}
                onActualizado={() => { if (onRecargarCuestionarios) onRecargarCuestionarios(); }}
            />

            <EliminarCuestionarioModal
                isOpen={Boolean(cuestionarioParaEliminar)}
                onClose={() => setCuestionarioParaEliminar(null)}
                cuestionario={cuestionarioParaEliminar}
                onConfirmarEliminacion={handleConfirmarEliminacion}
            />

            <AlertaModal
                isOpen={alerta.isOpen}
                onClose={cerrarAlerta}
                tipo={alerta.tipo}
                titulo={alerta.titulo}
                mensaje={alerta.mensaje}
                sugerencia={alerta.sugerencia}
                textoBoton={alerta.textoBoton}
            />
        </div>
    );
}
