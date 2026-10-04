import React, { useState } from 'react';
import CrearCuestionarioModal from './CrearCuestionarioModal';
import CompartirCuestionarioModal from './CompartirCuestionarioModal';
import AuditoriaResultadosModal from './AuditoriaResultadosModal';
import EliminarCuestionarioModal from './EliminarCuestionarioModal';
import { obtenerCuestionarioPorId, eliminarCuestionario } from '../services/cuestionarioService';
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
    Clock
} from 'lucide-react';

export default function CuestionariosView({ cuestionarios, estadisticas, onRecargarCuestionarios }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuestionarioAEditar, setCuestionarioAEditar] = useState(null);
    const [cargandoEdicionId, setCargandoEdicionId] = useState(null);
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

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

            {/* Cabecera y Buscador */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Mis cuestionarios</h2>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Panel de gestión · Ciclo 2026-B</span>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Barra de Búsqueda */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar cuestionario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                padding: '10px 14px 10px 36px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '13px',
                                width: '240px',
                                backgroundColor: '#ffffff',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Botón Nuevo Cuestionario */}
                    <button
                        onClick={handleNuevoCuestionario}
                        style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={16} /> Nuevo cuestionario
                    </button>
                </div>
            </div>

            {/* Tarjetas de Métricas Dinámicas desde Base de Datos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>CUESTIONARIOS</span>
                        <FileText size={18} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{cuestionarios.length}</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>RESPUESTAS TOTALES</span>
                        <MessageSquare size={18} color="#ea580c" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
                        {totalRespuestasTexto}
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ALUMNOS ÚNICOS</span>
                        <Users size={18} color="#7c3aed" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
                        {alumnosUnicosTexto}
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>PROMEDIO GENERAL</span>
                        <Award size={18} color="#9333ea" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea' }}>
                        {promedioGeneralTexto}
                    </div>
                </div>
            </div>

            {/* Grid de Tarjetas de Cuestionarios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {cuestionariosFiltrados.length > 0 ? (
                    cuestionariosFiltrados.map((cuestionario) => {
                        const respuestasCount = cuestionario.totalRespuestas || 0;
                        const promCuestionario = (cuestionario.promedioCalificacion && cuestionario.promedioCalificacion > 0)
                            ? `${cuestionario.promedioCalificacion.toFixed(1)} / 20`
                            : 'Sin intentos';

                        return (
                            <div key={cuestionario.id} style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    {/* Categoría, Respuestas y Temporizador */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>
                                            {respuestasCount} {respuestasCount === 1 ? 'respuesta' : 'respuestas'}
                                        </span>
                                        {cuestionario.tiempoLimiteMinutos > 0 ? (
                                            <span style={{
                                                backgroundColor: '#fef3c7',
                                                color: '#b45309',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <Clock size={12} /> {cuestionario.tiempoLimiteMinutos} min
                                            </span>
                                        ) : (
                                            <span style={{
                                                backgroundColor: '#f1f5f9',
                                                color: '#64748b',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '500'
                                            }}>
                                                Sin límite
                                            </span>
                                        )}
                                    </div>

                                    {/* Título y Descripción */}
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
                                        {cuestionario.titulo}
                                    </h3>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                                        {cuestionario.descripcion || 'Sin descripción detallada registrada.'}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={13} /> Creado recientemente
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: '600' }}>
                                            <Award size={13} color="#9333ea" /> Promedio: {promCuestionario}
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de Acción Inferiores */}
                                <div style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    <button onClick={() => setCuestionarioParaCompartir(cuestionario)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                        <Share2 size={16} /> Compartir
                                    </button>
                                    <button
                                        onClick={() => handleEditarCuestionario(cuestionario)}
                                        disabled={cargandoEdicionId === cuestionario.id}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            opacity: cargandoEdicionId === cuestionario.id ? 0.6 : 1
                                        }}
                                    >
                                        <Edit3 size={16} /> {cargandoEdicionId === cuestionario.id ? 'Cargando...' : 'Editar'}
                                    </button>
                                    <button
                                        onClick={() => setCuestionarioParaAuditar(cuestionario)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <ClipboardCheck size={16} /> Auditar
                                    </button>
                                    <button
                                        onClick={() => setCuestionarioParaEliminar(cuestionario)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                        No se encontraron cuestionarios coincidentes.
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