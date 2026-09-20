import React, { useState } from 'react';
import CrearCuestionarioModal from './CrearCuestionarioModal';
import CompartirCuestionarioModal from './CompartirCuestionarioModal';

export default function CuestionariosView({ cuestionarios, onRecargarCuestionarios }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuestionarioParaCompartir, setCuestionarioParaCompartir] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Filtramos los cuestionarios según lo que escriban en el buscador
    const cuestionariosFiltrados = cuestionarios.filter(c =>
        c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

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
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
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
                                backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    {/* Botón Nuevo Cuestionario */}
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                            gap: '6px'
                        }}
                    >
                        + Nuevo cuestionario
                    </button>
                </div>
            </div>

            {/* Tarjetas de Métricas Dinámicas basadas en la Base de Datos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{cuestionarios.length}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Cuestionarios</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* Aquí puedes enlazar la suma de intentos o respuestas reales si tu backend los provee */}
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c', marginBottom: '4px' }}>
                        {cuestionarios.reduce((acc, curr) => acc + (curr.totalRespuestas || 0), 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Respuestas totales</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
                        {cuestionarios.reduce((acc, curr) => acc + (curr.alumnosUnicos || 0), 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Alumnos únicos</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea', marginBottom: '4px' }}>16.4/20</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Promedio general</div>
                </div>
            </div>

            {/* Grid de Tarjetas de Cuestionarios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {cuestionariosFiltrados.length > 0 ? (
                    cuestionariosFiltrados.map((cuestionario) => {
                        const codigo = cuestionario.codigoAcceso || (cuestionario.id ? cuestionario.id.substring(0, 8).toUpperCase() : 'N/A');
                        const compartirInfo = () => {
                            const link = `${window.location.origin}/alumno/login`;
                            const msg = `Código de acceso: ${codigo}\nEnlace para alumnos: ${link}`;
                            navigator.clipboard?.writeText(codigo);
                            alert(`¡Código copiado al portapapeles!\n\n${msg}`);
                        };

                        return (
                            <div key={cuestionario.id} style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div>
                                    {/* Categoría, Respuestas y Código de Acceso */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>
                                            Evaluación
                                        </span>

                                        {/* Código de acceso visible */}
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#0f172a',
                                            fontFamily: 'monospace'
                                        }}>
                                            <span>🔑 {codigo}</span>
                                        </div>
                                    </div>

                                    {/* Título y Descripción */}
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
                                        {cuestionario.titulo}
                                    </h3>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                                        {cuestionario.descripcion || 'Sin descripción detallada registrada.'}
                                    </p>

                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
                                        📅 Creado recientemente
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
                                        <span>🔗</span> Compartir
                                    </button>
                                    <button onClick={() => alert(`Editar cuestionario`)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span>✏️</span> Editar
                                    </button>
                                    <button onClick={() => alert(`Auditar resultados`)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span>📋</span> Auditar
                                    </button>
                                    <button onClick={() => alert(`Eliminar cuestionario`)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span>🗑️</span> Eliminar
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

            {/* Modal para Crear Cuestionario */}
            <CrearCuestionarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCuestionarioCreado={onRecargarCuestionarios}
            />

            {/* Modal para Compartir Cuestionario con QR */}
            <CompartirCuestionarioModal
                isOpen={Boolean(cuestionarioParaCompartir)}
                onClose={() => setCuestionarioParaCompartir(null)}
                cuestionario={cuestionarioParaCompartir}
            />
        </div>
    );
}