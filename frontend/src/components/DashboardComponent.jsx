import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerCuestionarios, obtenerEstadisticas, obtenerActividadReciente } from '../services/cuestionarioService';
import CuestionariosView from './CuestionariosView';
import EstadisticasView from './EstadisticasView';
import ConfiguracionView from './ConfiguracionView';
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
    Award,
    Edit3,
    Star,
    ClipboardList
} from 'lucide-react';

export default function DashboardComponent() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    const userNombre = currentUser?.nombre || '';
    const userApellido = currentUser?.apellido || '';
    const fullName = `${userNombre} ${userApellido}`.trim() || 'Profesor';
    const userName = fullName.startsWith('Mtro.') ? fullName : `Mtro. ${fullName}`;
    const userEmail = currentUser?.email || 'profesor@nativatec.edu';

    const userInitials = ((userNombre ? userNombre[0] : '') + (userApellido ? userApellido[0] : '') || 'P').toUpperCase();

    const [cuestionarios, setCuestionarios] = useState([]);
    const [actividadReciente, setActividadReciente] = useState([]);
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

        obtenerActividadReciente()
            .then(act => setActividadReciente(act))
            .catch(err => console.error("Error al cargar actividad reciente:", err));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const promedioTexto = (estadisticas.promedioGeneral > 0)
        ? `${estadisticas.promedioGeneral.toFixed(1)}`
        : '0.0';

    // Cuestionarios ordenados por mayor cantidad de respuestas para la tarjeta "Más respondidos"
    const masRespondidos = [...cuestionarios]
        .sort((a, b) => (b.totalRespuestas || 0) - (a.totalRespuestas || 0))
        .slice(0, 3);
    
    const maxRespuestas = masRespondidos.length > 0 && (masRespondidos[0].totalRespuestas || 0) > 0
        ? masRespondidos[0].totalRespuestas
        : 1;

    const barColors = ['#10b981', '#1e293b', '#ea580c', '#8b5cf6'];

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
                            {/* Tarjeta 1: Cuestionarios */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                                    <ClipboardList size={20} color="#3b82f6" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                                        {cuestionarios.length}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.3' }}>
                                        Cuestionarios<br />activos este ciclo
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 2: Respuestas totales */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                                    <Edit3 size={18} color="#10b981" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                                        {estadisticas.totalRespuestas}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.3' }}>
                                        Respuestas totales<br />de todos los exámenes
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 3: Alumnos únicos */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                                    <Users size={18} color="#7c3aed" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#854d0e', marginBottom: '4px' }}>
                                        {estadisticas.alumnosUnicos}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.3' }}>
                                        Alumnos únicos<br />han participado
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 4: Promedio general */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                                    <Star size={18} color="#eab308" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', marginBottom: '4px' }}>
                                        {promedioTexto}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.3' }}>
                                        Promedio general<br />sobre 20 puntos
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN INFERIOR: ACTIVIDAD RECIENTE + MÁS RESPONDIDOS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'start' }}>
                            
                            {/* COLUMNA IZQUIERDA: ACTIVIDAD RECIENTE */}
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                    Actividad reciente
                                </h3>

                                {actividadReciente.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {actividadReciente.map((item, index) => (
                                            <div
                                                key={item.intentoId || index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '14px 0',
                                                    borderBottom: index < actividadReciente.length - 1 ? '1px solid #f1f5f9' : 'none'
                                                }}
                                            >
                                                {/* ALUMNO CON AVATAR E INFO */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: item.colorAvatar || '#10b981',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: '700',
                                                        fontSize: '13px',
                                                        flexShrink: 0
                                                    }}>
                                                        {item.iniciales || 'AL'}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {item.nombreAlumno}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {item.cuestionarioTitulo}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CALIFICACIÓN Y TIEMPO */}
                                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                                                        {item.notaTexto}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                        {item.tiempoRelativo}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '36px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                        Aún no hay actividad reciente de alumnos registrada en este ciclo.
                                    </div>
                                )}
                            </div>

                            {/* COLUMNA DERECHA: MÁS RESPONDIDOS Y ACCESOS RÁPIDOS */}
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                        Más respondidos
                                    </h3>

                                    {masRespondidos.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {masRespondidos.map((c, idx) => {
                                                const respCount = c.totalRespuestas || 0;
                                                const pct = Math.max(8, Math.round((respCount / maxRespuestas) * 100));
                                                const color = barColors[idx % barColors.length];

                                                return (
                                                    <div key={c.id || idx}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                                                                {c.titulo}
                                                            </span>
                                                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                                                                {respCount}
                                                            </span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px 0' }}>
                                            Sin cuestionarios registrados todavía.
                                        </div>
                                    )}
                                </div>

                                {/* ACCESOS RÁPIDOS */}
                                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        ACCESOS RÁPIDOS
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button
                                            onClick={() => setVistaActiva('cuestionarios')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#334155',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                padding: '4px 0',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
                                        >
                                            <FileText size={16} color="#3b82f6" /> Ver cuestionarios
                                        </button>
                                        <button
                                            onClick={() => setVistaActiva('estadisticas')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#334155',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                padding: '4px 0',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
                                        >
                                            <BarChart3 size={16} color="#8b5cf6" /> Ver estadísticas
                                        </button>
                                    </div>
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
                    <EstadisticasView />
                )}

                {vistaActiva === 'configuracion' && (
                    <ConfiguracionView onUserUpdated={(u) => setCurrentUser(u)} />
                )}
            </div>
        </div>
    );
}