import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerCuestionarios, obtenerEstadisticas, obtenerActividadReciente } from '../services/cuestionarioService';
import CuestionariosView from './CuestionariosView';
import EstadisticasView from './EstadisticasView';
import ConfiguracionView from './ConfiguracionView';
import BancoPreguntasView from './BancoPreguntasView';
import ConfirmarLogoutModal from '../components/modals/ConfirmarLogoutModal';
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
    X
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
        alumnosUnicos: 0
    });
    const [vistaActiva, setVistaActiva] = useState('panel');
    const [mostrarModalLogout, setMostrarModalLogout] = useState(false);

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

    const cambiarVista = (vista) => {
        setVistaActiva(vista);
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
                    <div style={{ width: '28px' }}></div>
                </div>
            )}

            {/* BARRA LATERAL (SIDEBAR) */}
            <div style={{
                width: isMobile ? '280px' : '260px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 16px',
                position: isMobile ? 'fixed' : 'relative',
                top: 0,
                bottom: 0,
                left: isMobile ? (menuAbierto ? 0 : '-300px') : 0,
                zIndex: isMobile ? 1200 : 10,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isMobile && menuAbierto ? '0 0 35px rgba(0,0,0,0.5)' : 'none',
                boxSizing: 'border-box'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '32px', padding: '4px' }}>
                        <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                        {isMobile && (
                            <button
                                onClick={() => setMenuAbierto(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        )}
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button 
                            onClick={() => cambiarVista('panel')} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                padding: '12px 14px', 
                                background: vistaActiva === 'panel' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent', 
                                color: vistaActiva === 'panel' ? '#60a5fa' : '#94a3b8', 
                                border: 'none', 
                                borderLeft: vistaActiva === 'panel' ? '3px solid #3b82f6' : '3px solid transparent', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                fontWeight: vistaActiva === 'panel' ? '600' : '500', 
                                textAlign: 'left', 
                                transition: 'all 0.2s ease' 
                            }}
                        >
                            <LayoutDashboard size={18} /> <span>Panel principal</span>
                        </button>
                        <button 
                            onClick={() => cambiarVista('cuestionarios')} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                padding: '12px 14px', 
                                background: vistaActiva === 'cuestionarios' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent', 
                                color: vistaActiva === 'cuestionarios' ? '#60a5fa' : '#94a3b8', 
                                border: 'none', 
                                borderLeft: vistaActiva === 'cuestionarios' ? '3px solid #3b82f6' : '3px solid transparent', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                fontWeight: vistaActiva === 'cuestionarios' ? '600' : '500', 
                                textAlign: 'left', 
                                transition: 'all 0.2s ease' 
                            }}
                        >
                            <FileText size={18} /> <span>Cuestionarios</span>
                            {cuestionarios.length > 0 && (
                                <span style={{ marginLeft: 'auto', backgroundColor: vistaActiva === 'cuestionarios' ? '#2563eb' : '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                    {cuestionarios.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => cambiarVista('banco')} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                padding: '12px 14px', 
                                background: vistaActiva === 'banco' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent', 
                                color: vistaActiva === 'banco' ? '#60a5fa' : '#94a3b8', 
                                border: 'none', 
                                borderLeft: vistaActiva === 'banco' ? '3px solid #3b82f6' : '3px solid transparent', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                fontWeight: vistaActiva === 'banco' ? '600' : '500', 
                                textAlign: 'left', 
                                transition: 'all 0.2s ease' 
                            }}
                        >
                            <BookOpen size={18} /> <span>Banco de Preguntas</span>
                        </button>
                        <button 
                            onClick={() => cambiarVista('estadisticas')} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                padding: '12px 14px', 
                                background: vistaActiva === 'estadisticas' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent', 
                                color: vistaActiva === 'estadisticas' ? '#60a5fa' : '#94a3b8', 
                                border: 'none', 
                                borderLeft: vistaActiva === 'estadisticas' ? '3px solid #3b82f6' : '3px solid transparent', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                fontWeight: vistaActiva === 'estadisticas' ? '600' : '500', 
                                textAlign: 'left', 
                                transition: 'all 0.2s ease' 
                            }}
                        >
                            <BarChart3 size={18} /> <span>Estadísticas</span>
                        </button>
                        <button 
                            onClick={() => cambiarVista('configuracion')} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                padding: '12px 14px', 
                                background: vistaActiva === 'configuracion' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent', 
                                color: vistaActiva === 'configuracion' ? '#60a5fa' : '#94a3b8', 
                                border: 'none', 
                                borderLeft: vistaActiva === 'configuracion' ? '3px solid #3b82f6' : '3px solid transparent', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                fontWeight: vistaActiva === 'configuracion' ? '600' : '500', 
                                textAlign: 'left', 
                                transition: 'all 0.2s ease' 
                            }}
                        >
                            <Settings size={18} /> <span>Configuración</span>
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
                    <button onClick={() => setMostrarModalLogout(true)} title="Cerrar sesión" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 14px' : '30px 40px', boxSizing: 'border-box' }}>

                {/* TÍTULO DINÁMICO SEGÚN LA VISTA ACTIVA */}
                {vistaActiva === 'panel' && (
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '20px' : '24px', color: '#0f172a' }}>Panel principal</h1>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Resumen general · Ciclo 2026-B</span>
                    </div>
                )}

                {vistaActiva === 'panel' && (
                    <>
                        <div style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
                            color: '#ffffff',
                            borderRadius: '20px',
                            padding: isMobile ? '22px 18px' : '32px 36px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            gap: isMobile ? '16px' : '0',
                            marginBottom: '28px',
                            boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Brillo radial decorativo de fondo */}
                            <div style={{
                                position: 'absolute',
                                right: '-40px',
                                top: '-40px',
                                width: '240px',
                                height: '240px',
                                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{ zIndex: 1 }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#34d399',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    marginBottom: '10px'
                                }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                                    Ciclo Académico 2026-B • SENATI
                                </div>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                                    ¡Hola, {userName}!
                                </h2>
                                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '520px', lineHeight: '1.5' }}>
                                    Supervisa el rendimiento académico de tus estudiantes, gestiona reactivos en el banco y administra evaluaciones con ponderación automática.
                                </p>
                            </div>
                            <button 
                                onClick={() => cambiarVista('cuestionarios')} 
                                style={{ 
                                    backgroundColor: '#10b981', 
                                    backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '13px 24px', 
                                    borderRadius: '12px', 
                                    fontWeight: '700', 
                                    cursor: 'pointer', 
                                    fontSize: '14px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    width: isMobile ? '100%' : 'auto', 
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
                                    transition: 'all 0.2s ease',
                                    zIndex: 1
                                }}
                            >
                                <Plus size={18} /> Nuevo cuestionario
                            </button>
                        </div>

                        {/* Tarjetas de Métricas Dinámicas desde Base de Datos (Auto-fit responsivo) */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '18px',
                            marginBottom: '30px'
                        }}>
                            {/* Tarjeta 1: Cuestionarios */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Cuestionarios</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ClipboardList size={20} color="#3b82f6" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                        {cuestionarios.length}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                        Exámenes activos este ciclo
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 2: Respuestas totales */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Entregas Realizadas</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit3 size={19} color="#10b981" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#059669', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                        {estadisticas.totalRespuestas}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                        Intentos calificados
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 3: Alumnos únicos */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Alumnos Evaluados</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={19} color="#7c3aed" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#7c3aed', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                        {estadisticas.alumnosUnicos}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                        Estudiantes únicos participantes
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 4: Promedio general */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Promedio General</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Star size={19} color="#d97706" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#d97706', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                        {promedioTexto} <span style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8' }}>/ 20</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                        Escala vigesimal de rendimiento
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN INFERIOR: ACTIVIDAD RECIENTE + MÁS RESPONDIDOS */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>
                            
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

                {vistaActiva === 'banco' && (
                    <BancoPreguntasView />
                )}

                {vistaActiva === 'estadisticas' && (
                    <EstadisticasView />
                )}

                {vistaActiva === 'configuracion' && (
                    <ConfiguracionView onUserUpdated={(u) => setCurrentUser(u)} />
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