import React, { useState } from 'react';
import logoNativa from '../../images/logoNativa.jpeg';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    BarChart3,
    Sliders,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

export default function Sidebar({
    vistaActiva,
    cambiarVista,
    cuestionariosCount = 0,
    userName = 'Profesor',
    userEmail = 'docente@nativatec.edu',
    userInitials = 'P',
    onLogout,
    isMobile = false,
    menuAbierto = false,
    setMenuAbierto = () => {}
}) {
    const [colapsado, setColapsado] = useState(() => {
        return localStorage.getItem('nativatec_sidebar_collapsed') === 'true';
    });

    const toggleColapso = () => {
        const nuevoEstado = !colapsado;
        setColapsado(nuevoEstado);
        localStorage.setItem('nativatec_sidebar_collapsed', String(nuevoEstado));
    };

    // Ítems de navegación principal (la configuración ahora es exclusiva de cuestionarios/exámenes)
    const navItems = [
        { id: 'panel', label: 'Panel principal', icon: LayoutDashboard },
        { id: 'cuestionarios', label: 'Cuestionarios', icon: FileText, count: cuestionariosCount },
        { id: 'banco', label: 'Banco de Preguntas', icon: BookOpen },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
        { id: 'configuracion', label: 'Configuración de exámenes', icon: Sliders },
    ];

    // Ancho cómodo: 320px expandido, 80px colapsado
    const ancho = isMobile ? '320px' : (colapsado ? '80px' : '320px');

    return (
        <>
            {isMobile && menuAbierto && (
                <div
                    onClick={() => setMenuAbierto(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 1100
                    }}
                />
            )}

            <aside
                style={{
                    width: ancho,
                    minWidth: ancho,
                    backgroundColor: '#090d16',
                    color: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: isMobile ? '24px 18px' : (colapsado ? '22px 14px' : '26px 18px'),
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0,
                    bottom: 0,
                    left: isMobile ? (menuAbierto ? 0 : '-330px') : 0,
                    zIndex: isMobile ? 1200 : 20,
                    borderRight: '1px solid #1e293b',
                    boxSizing: 'border-box',
                    transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s ease'
                }}
            >
                {/* PARTE SUPERIOR */}
                <div>
                    {/* Header: Logo institucional y Botón colapsar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: colapsado && !isMobile ? 'center' : 'space-between',
                        marginBottom: '30px',
                        padding: '0 2px'
                    }}>
                        {colapsado && !isMobile ? (
                            <button
                                onClick={toggleColapso}
                                title="Expandir menú"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: '#1e293b',
                                    color: '#ffffff',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '15px'
                                }}
                            >
                                N
                            </button>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#ffffff',
                                padding: '6px 14px',
                                borderRadius: '10px',
                                maxWidth: '190px'
                            }}>
                                <img src={logoNativa} alt="NativaTec" style={{ height: '22px', objectFit: 'contain' }} />
                            </div>
                        )}

                        {isMobile ? (
                            <button
                                onClick={() => setMenuAbierto(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                            >
                                <X size={20} />
                            </button>
                        ) : (
                            !colapsado && (
                                <button
                                    onClick={toggleColapso}
                                    title="Colapsar menú"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#1e293b'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )
                        )}
                    </div>

                    {/* Menú de navegación con botones cómodos y bien espaciados */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = vistaActiva === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => cambiarVista(item.id)}
                                    title={colapsado ? item.label : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: colapsado && !isMobile ? 'center' : 'flex-start',
                                        gap: '12px',
                                        width: '100%',
                                        padding: colapsado && !isMobile ? '12px' : '12px 16px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: isActive ? '600' : '500',
                                        backgroundColor: isActive ? '#1e293b' : 'transparent',
                                        color: isActive ? '#ffffff' : '#94a3b8',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.55)';
                                            e.currentTarget.style.color = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#94a3b8';
                                        }
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.2 : 1.8}
                                        style={{ color: isActive ? '#38bdf8' : 'currentColor', flexShrink: 0 }}
                                    />

                                    {(!colapsado || isMobile) && (
                                        <span style={{ whiteSpace: 'nowrap' }}>
                                            {item.label}
                                        </span>
                                    )}

                                    {item.count !== undefined && item.count > 0 && (!colapsado || isMobile) && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: '#1e293b',
                                            color: '#94a3b8',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '2px 8px',
                                            borderRadius: '6px'
                                        }}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* TARJETA DE PERFIL DEL USUARIO REGISTRADO (MÁS PEGADO A ABAJO QUE A ARRIBA) */}
                <div style={{
                    marginTop: 'auto',
                    marginBottom: '16px',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '16px'
                }}>
                    <div
                        onClick={() => cambiarVista('perfil')}
                        title={colapsado ? 'Mi Perfil y Cuenta' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: colapsado && !isMobile ? 'center' : 'space-between',
                            gap: '12px',
                            padding: colapsado && !isMobile ? '8px 0' : '9px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: vistaActiva === 'perfil' ? '#1e293b' : 'rgba(15, 23, 42, 0.45)',
                            border: vistaActiva === 'perfil' ? '1px solid #334155' : '1px solid transparent',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (vistaActiva !== 'perfil') {
                                e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.55)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (vistaActiva !== 'perfil') {
                                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.45)';
                            }
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                overflow: 'hidden',
                                flex: 1,
                                minWidth: 0
                            }}
                        >
                            {/* Avatar con iniciales */}
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                flexShrink: 0,
                                boxShadow: vistaActiva === 'perfil' ? '0 0 0 2px #38bdf8' : 'none',
                                transition: 'all 0.15s ease'
                            }}>
                                {userInitials}
                            </div>

                            {(!colapsado || isMobile) && (
                                <div style={{ overflow: 'hidden', lineHeight: 1.35, minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {userName}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {userEmail}
                                    </div>
                                </div>
                            )}
                        </div>

                        {(!colapsado || isMobile) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLogout();
                                }}
                                title="Cerrar sesión"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                <LogOut size={17} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
