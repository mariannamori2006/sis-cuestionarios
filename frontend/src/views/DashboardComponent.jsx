import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerCuestionarios, obtenerEstadisticas, obtenerActividadReciente, obtenerEstadisticasDetalladas } from '../services/cuestionarioService';
import CuestionariosView from './CuestionariosView';
import EstadisticasView from './EstadisticasView';
import ConfiguracionView from './ConfiguracionView';
import BancoPreguntasView from './BancoPreguntasView';
import NotificationCenter from '../components/common/NotificationCenter';
import ConfirmarLogoutModal from '../components/modals/ConfirmarLogoutModal';
import Sidebar from '../components/common/Sidebar';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
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
    ClipboardList,
    BookOpen,
    Menu,
    X,
    Activity,
    TrendingUp
} from 'lucide-react';

export default function DashboardComponent() {
    const navigate = useNavigate();
    const { isMobile } = useResponsive();
    const [menuAbierto, setMenuAbierto] = useState(false);
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
        alumnosUnicos: 0,
        tasaAprobacion: 0.0,
        totalAprobados: 0,
        totalDesaprobados: 0
    });
    const [vistaActiva, setVistaActiva] = useState('panel');
    const [cuestionarioAConfigurarId, setCuestionarioAConfigurarId] = useState(null);
    const [mostrarModalLogout, setMostrarModalLogout] = useState(false);

    const cargarDatos = () => {
        obtenerCuestionarios()
            .then(data => setCuestionarios(data))
            .catch(err => console.error("Error al cargar cuestionarios:", err));

        obtenerEstadisticas()
            .then(stats => {
                if (stats) {
                    setEstadisticas(prev => ({ ...prev, ...stats }));
                }
            })
            .catch(err => console.error("Error al cargar estadísticas:", err));

        obtenerEstadisticasDetalladas()
            .then(detalladas => {
                if (detalladas) {
                    const aprobados = (detalladas.distribucion?.rango18_20 || 0) + 
                                     (detalladas.distribucion?.rango15_17 || 0) + 
                                     (detalladas.distribucion?.rango11_14 || 0);
                    const desaprobados = detalladas.distribucion?.rango0_10 || 0;
                    setEstadisticas(prev => ({
                        ...prev,
                        tasaAprobacion: detalladas.tasaAprobacion !== undefined ? detalladas.tasaAprobacion : prev.tasaAprobacion,
                        totalAprobados: aprobados,
                        totalDesaprobados: desaprobados
                    }));
                }
            })
            .catch(err => console.error("Error al cargar estadísticas detalladas:", err));

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

    const tasaAprobacionTexto = (estadisticas.tasaAprobacion !== undefined && estadisticas.tasaAprobacion !== null)
        ? `${Number(estadisticas.tasaAprobacion).toFixed(1)}%`
        : '0.0%';

    const aprobadosCount = estadisticas.totalAprobados || 0;
    const desaprobadosCount = estadisticas.totalDesaprobados || 0;
    const subtituloAprobacion = (aprobadosCount > 0 || desaprobadosCount > 0)
        ? `${aprobadosCount} aprobados · ${desaprobadosCount} en riesgo`
        : 'Calificaciones registradas (≥ 11/20)';

    // Cuestionarios ordenados por mayor cantidad de respuestas para la tarjeta "Más respondidos"
    const masRespondidos = [...cuestionarios]
        .sort((a, b) => (b.totalRespuestas || 0) - (a.totalRespuestas || 0))
        .slice(0, 3);

    const maxRespuestas = masRespondidos.length > 0 && (masRespondidos[0].totalRespuestas || 0) > 0
        ? masRespondidos[0].totalRespuestas
        : 1;

    const barColors = ['#10b981', '#1e293b', '#ea580c', '#8b5cf6'];

    const obtenerBadgeNota = (notaTexto, calificacion) => {
        if (!notaTexto || String(notaTexto).toLowerCase().includes('pendiente') || calificacion === null || calificacion === undefined) {
            return {
                bg: '#eff6ff',
                color: '#2563eb',
                border: '#bfdbfe',
                texto: 'Pendiente',
                puntoColor: '#3b82f6'
            };
        }

        const notaNum = typeof calificacion === 'number'
            ? calificacion
            : parseFloat(String(notaTexto).split('/')[0]) || 0;

        if (notaNum >= 14) {
            return {
                bg: '#ecfdf5',
                color: '#059669',
                border: '#a7f3d0',
                texto: `${notaTexto}`,
                puntoColor: '#10b981'
            };
        } else if (notaNum >= 11) {
            return {
                bg: '#fffbeb',
                color: '#d97706',
                border: '#fde68a',
                texto: `${notaTexto}`,
                puntoColor: '#f59e0b'
            };
        } else {
            return {
                bg: '#fef2f2',
                color: '#dc2626',
                border: '#fecaca',
                texto: `${notaTexto}`,
                puntoColor: '#ef4444'
            };
        }
    };

    const obtenerAvatarGradient = (iniciales) => {
        const paletas = [
            'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)'
        ];
        if (!iniciales) return paletas[0];
        const charCode = (iniciales.charCodeAt(0) || 0) + (iniciales.charCodeAt(1) || 0);
        return paletas[charCode % paletas.length];
    };

    const cambiarVista = (vista) => {
        setVistaActiva(vista);
        if (vista !== 'configuracion') {
            setCuestionarioAConfigurarId(null);
        }
        if (isMobile) setMenuAbierto(false);
    };

    const handleConfigurarCuestionario = (cuestionario) => {
        setCuestionarioAConfigurarId(cuestionario?.id || null);
        setVistaActiva('configuracion');
        if (isMobile) setMenuAbierto(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden' }}>

            {/* FONDO OSCURO PARA CERRAR EL MENÚ EN CELULARES */}
            {isMobile && menuAbierto && (
                <div
                    onClick={() => setMenuAbierto(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        zIndex: 1100,
                        backdropFilter: 'blur(3px)'
                    }}
                />
            )}

            {/* BARRA SUPERIOR PARA CELULARES */}
            {isMobile && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderBottom: '1px solid #1e293b',
                    zIndex: 1000,
                    flexShrink: 0
                }}>
                    <button
                        onClick={() => setMenuAbierto(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}
                    >
                        <Menu size={24} />
                    </button>
                    <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                        <img src={logoNativa} alt="NativaTec" style={{ height: '22px', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <NotificationCenter onNavegar={cambiarVista} />
                    </div>
                </div>
            )}

            {/* BARRA LATERAL DINÁMICA (SIDEBAR V2) */}
            <Sidebar
                vistaActiva={vistaActiva}
                cambiarVista={cambiarVista}
                cuestionariosCount={cuestionarios.length}
                userName={userName}
                userEmail={userEmail}
                userInitials={userInitials}
                onLogout={() => setMostrarModalLogout(true)}
                isMobile={isMobile}
                menuAbierto={menuAbierto}
                setMenuAbierto={setMenuAbierto}
            />

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 14px' : '28px 36px', boxSizing: 'border-box' }}>

                {/* BARRA SUPERIOR GLOBAL PARA ESCRITORIO (NOTIFICACIONES) */}
                {!isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px' }}>
                        <NotificationCenter onNavegar={cambiarVista} />
                    </div>
                )}

                {/* VISTA: PANEL PRINCIPAL */}
                {vistaActiva === 'panel' && (
                    <>
                        <div style={{ marginBottom: '22px' }}>
                            <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                                Panel principal
                            </h1>
                            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                                Resumen general del ciclo académico y actividad en tiempo real.
                            </p>
                        </div>
                        <div style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            borderRadius: '16px',
                            padding: isMobile ? '22px 18px' : '26px 30px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            gap: isMobile ? '16px' : '0',
                            marginBottom: '24px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                    border: '1px solid rgba(56, 189, 248, 0.25)',
                                    color: '#38bdf8',
                                    fontSize: '11.5px',
                                    fontWeight: '600',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    marginBottom: '10px'
                                }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                                    Ciclo Académico Activo
                                </div>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '22px' : '25px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                                    ¡Hola, {userName}!
                                </h2>
                                <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8', fontWeight: '400' }}>
                                    Supervisa las entregas en tiempo real y gestiona las evaluaciones de tus estudiantes.
                                </p>
                            </div>
                            <button
                                onClick={() => cambiarVista('cuestionarios')}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '11px 20px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '13.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: isMobile ? '100%' : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    transition: 'all 0.15s ease',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            >
                                <FileText size={16} /> Gestionar cuestionarios
                            </button>
                        </div>

                        {/* Tarjetas de Métricas Clave */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                            marginBottom: '26px'
                        }}>
                            {/* Tarjeta 1: Cuestionarios */}
                            <div style={{ background: '#ffffff', padding: '20px 22px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Cuestionarios</span>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ClipboardList size={18} color="#2563eb" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                                        {cuestionarios.length}
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total creados en plataforma</span>
                                </div>
                            </div>

                            {/* Tarjeta 2: Respuestas totales */}
                            <div style={{ background: '#ffffff', padding: '20px 22px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Entregas Realizadas</span>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit3 size={18} color="#0284c7" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                                        {estadisticas.totalRespuestas}
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Intentos completados</span>
                                </div>
                            </div>

                            {/* Tarjeta 3: Tasa de Aprobación */}
                            <div style={{ background: '#ffffff', padding: '20px 22px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Tasa de Aprobación</span>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={18} color="#059669" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                                        {tasaAprobacionTexto}
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{subtituloAprobacion}</span>
                                </div>
                            </div>

                            {/* Tarjeta 4: Promedio general */}
                            <div style={{ background: '#ffffff', padding: '20px 22px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Promedio General</span>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Star size={18} color="#d97706" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                                        {promedioTexto} <span style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8' }}>/ 20</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Escala vigesimal</span>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN INFERIOR: ACTIVIDAD RECIENTE + MÁS RESPONDIDOS */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>

                            {/* COLUMNA IZQUIERDA: ACTIVIDAD RECIENTE */}
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}>
                                {/* Encabezado Mejorado */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            backgroundColor: '#eff6ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Activity size={18} color="#2563eb" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                                                Actividad reciente
                                            </h3>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Últimas evaluaciones entregadas</span>
                                        </div>
                                    </div>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #a7f3d0',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '700'
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                                        En vivo
                                    </span>
                                </div>

                                {actividadReciente.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {actividadReciente.map((item, index) => {
                                            const badge = obtenerBadgeNota(item.notaTexto, item.calificacion);
                                            const avatarGrad = obtenerAvatarGradient(item.iniciales);

                                            return (
                                                <div
                                                    key={item.intentoId || index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '10px 12px',
                                                        borderRadius: '12px',
                                                        transition: 'all 0.15s ease',
                                                        cursor: 'default'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                >
                                                    {/* ALUMNO CON AVATAR E INFO */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '12px',
                                                            background: avatarGrad,
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: '800',
                                                            fontSize: '13px',
                                                            flexShrink: 0,
                                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {item.iniciales || 'AL'}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.nombreAlumno}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#64748b',
                                                                marginTop: '2px',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <FileText size={12} color="#94a3b8" />
                                                                <span>{item.cuestionarioTitulo}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CALIFICACIÓN CON BADGE DE COLOR Y TIEMPO */}
                                                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '14px' }}>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`,
                                                            padding: '3px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.2px'
                                                        }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.puntoColor }} />
                                                            {badge.texto}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                                                            {item.tiempoRelativo}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                        onConfigurarCuestionario={handleConfigurarCuestionario}
                    />
                )}

                {vistaActiva === 'banco' && (
                    <BancoPreguntasView />
                )}

                {vistaActiva === 'estadisticas' && (
                    <EstadisticasView />
                )}

                {vistaActiva === 'configuracion' && (
                    <ConfiguracionView
                        cuestionarios={cuestionarios}
                        cuestionarioInicialId={cuestionarioAConfigurarId}
                        onCuestionarioActualizado={cargarDatos}
                        onUserUpdated={(u) => setCurrentUser(u)}
                        modo="examenes"
                    />
                )}

                {vistaActiva === 'perfil' && (
                    <ConfiguracionView
                        cuestionarios={cuestionarios}
                        onUserUpdated={(u) => setCurrentUser(u)}
                        modo="perfil"
                    />
                )}
            </div>

            {/* Modal de confirmación para cerrar sesión */}
            <ConfirmarLogoutModal
                isOpen={mostrarModalLogout}
                onClose={() => setMostrarModalLogout(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}