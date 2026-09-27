import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerCuestionarios, obtenerEstadisticas } from '../services/cuestionarioService';
import CuestionariosView from './CuestionariosView';
import logoNativa from '../images/logoNativa.jpeg';
import { 
    LayoutDashboard, 
    FileText, 
    BarChart3, 
    Settings, 
    LogOut, 
    Plus, 
    Users, 
    MessageSquare, 
    Award 
} from 'lucide-react';

export default function DashboardComponent() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const userNombre = currentUser?.nombre || '';
    const userApellido = currentUser?.apellido || '';
    const fullName = `${userNombre} ${userApellido}`.trim() || 'Profesor';
    const userName = fullName.startsWith('Mtro.') ? fullName : `Mtro. ${fullName}`;
    const userEmail = currentUser?.email || 'profesor@nativatec.edu';

    const userInitials = ((userNombre ? userNombre[0] : '') + (userApellido ? userApellido[0] : '') || 'P').toUpperCase();

    const [cuestionarios, setCuestionarios] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        promedioGeneral: 0.0,
        totalCuestionarios: 0,
        totalRespuestas: 0,
        alumnosUnicos: 0
    });
    const [vistaActiva, setVistaActiva] = useState('panel');

    const cargarDatos = () => {
        obtenerCuestionarios()
            .then(data => setCuestionarios(data))
            .catch(err => console.error("Error al cargar cuestionarios:", err));

        obtenerEstadisticas()
            .then(stats => setEstadisticas(stats))
            .catch(err => console.error("Error al cargar estadísticas:", err));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const promedioTexto = (estadisticas.promedioGeneral > 0)
        ? `${estadisticas.promedioGeneral.toFixed(1)} / 20`
        : '0.0 / 20';

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', overflow: 'hidden' }}>

            {/* BARRA LATERAL (SIDEBAR) */}
            <div style={{ width: '260px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '4px' }}>
                        <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button onClick={() => setVistaActiva('panel')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: vistaActiva === 'panel' ? '#1e293b' : 'transparent', color: vistaActiva === 'panel' ? '#ffffff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left', transition: 'all 0.2s' }}>
                            <LayoutDashboard size={18} /> Panel principal
                        </button>
                        <button onClick={() => setVistaActiva('cuestionarios')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: vistaActiva === 'cuestionarios' ? '#1e293b' : 'transparent', color: vistaActiva === 'cuestionarios' ? '#ffffff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left', transition: 'all 0.2s' }}>
                            <FileText size={18} /> Cuestionarios
                        </button>
                        <button onClick={() => setVistaActiva('estadisticas')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: vistaActiva === 'estadisticas' ? '#1e293b' : 'transparent', color: vistaActiva === 'estadisticas' ? '#ffffff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left', transition: 'all 0.2s' }}>
                            <BarChart3 size={18} /> Estadísticas
                        </button>
                        <button onClick={() => setVistaActiva('configuracion')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: vistaActiva === 'configuracion' ? '#1e293b' : 'transparent', color: vistaActiva === 'configuracion' ? '#ffffff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left', transition: 'all 0.2s' }}>
                            <Settings size={18} /> Configuración
                        </button>
                    </nav>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ background: '#3b82f6', color: '#fff', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: '0' }}>{userInitials}</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} title="Cerrar sesión" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px' }}>

                {/* TÍTULO DINÁMICO SEGÚN LA VISTA ACTIVA */}
                {vistaActiva === 'panel' && (
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Panel principal</h1>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Resumen general · Ciclo 2026-B</span>
                    </div>
                )}

                {vistaActiva === 'panel' && (
                    <>
                        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Buenos días,</span>
                                <h2 style={{ margin: '4px 0 8px 0', fontSize: '22px' }}>{userName}</h2>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Ciclo 2026-B · Tienes {cuestionarios.length} cuestionarios activos</span>
                            </div>
                            <button onClick={() => setVistaActiva('cuestionarios')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Plus size={18} /> Nuevo cuestionario
                            </button>
                        </div>

                        {/* Tarjetas de Métricas Dinámicas desde Base de Datos */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>CUESTIONARIOS</span>
                                    <FileText size={18} color="#3b82f6" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {cuestionarios.length}
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>RESPUESTAS TOTALES</span>
                                    <MessageSquare size={18} color="#ea580c" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
                                    {estadisticas.totalRespuestas}
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ALUMNOS ÚNICOS</span>
                                    <Users size={18} color="#7c3aed" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
                                    {estadisticas.alumnosUnicos}
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>PROMEDIO GENERAL</span>
                                    <Award size={18} color="#9333ea" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea' }}>
                                    {promedioTexto}
                                </div>
                            </div>
                        </div>

                    </>
                )}

                {/* Vista de Cuestionarios */}
                {vistaActiva === 'cuestionarios' && (
                    <CuestionariosView
                        cuestionarios={cuestionarios}
                        estadisticas={estadisticas}
                        onRecargarCuestionarios={cargarDatos}
                    />
                )}

                {vistaActiva === 'estadisticas' && (
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ marginTop: 0 }}>Estadísticas Académicas</h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Métricas de rendimiento y tasas de aprobación por evaluación.</p>
                    </div>
                )}

                {vistaActiva === 'configuracion' && (
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ marginTop: 0 }}>Configuración de Perfil</h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Preferencias de cuenta y notificaciones.</p>
                    </div>
                )}
            </div>
        </div>
    );
}