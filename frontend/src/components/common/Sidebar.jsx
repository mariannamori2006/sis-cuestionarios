import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    BarChart3,
    Sliders,
    User,
    LogOut,
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
    // Estado de hover: se expande al entrar el mouse y se contrae al salir
    const [isHovered, setIsHovered] = useState(false);

    // En escritorio se expande cuando el cursor entra; en móvil se rige por menuAbierto
    const isExpanded = isMobile ? menuAbierto : isHovered;

    // Ítems de navegación del docente
    const navItems = [
        { id: 'panel', label: 'Panel principal', icon: LayoutDashboard },
        { id: 'cuestionarios', label: 'Cuestionarios', icon: FileText, count: cuestionariosCount },
        { id: 'banco', label: 'Banco de Preguntas', icon: BookOpen },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
        { id: 'configuracion', label: 'Configuración de exámenes', icon: Sliders },
    ];

    // Ancho: 68px colapsado (solo iconos), 260px expandido al hacer hover
    const ancho = isMobile ? '280px' : (isExpanded ? '260px' : '68px');

    return (
        <>
            {/* Overlay para móvil */}
            {isMobile && menuAbierto && (
                <div
                    onClick={() => setMenuAbierto(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(7, 9, 20, 0.75)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 1100
                    }}
                />
            )}

            <aside
                onMouseEnter={() => {
                    if (!isMobile) setIsHovered(true);
                }}
                onMouseLeave={() => {
                    if (!isMobile) setIsHovered(false);
                }}
                style={{
                    width: ancho,
                    minWidth: ancho,
                    background: 'linear-gradient(180deg, #070914 0%, #0a0d1e 50%, #060814 100%)',
                    color: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: isExpanded ? '22px 14px' : '22px 10px',
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0,
                    bottom: 0,
                    left: isMobile ? (menuAbierto ? 0 : '-300px') : 0,
                    zIndex: isMobile ? 1200 : 30,
                    borderRight: '1px solid rgba(99, 102, 241, 0.18)',
                    boxSizing: 'border-box',
                    transition: 'width 0.26s cubic-bezier(0.25, 1, 0.5, 1), padding 0.26s ease, left 0.25s ease, box-shadow 0.26s ease',
                    boxShadow: isExpanded ? '6px 0 30px rgba(0, 0, 0, 0.55), 2px 0 15px rgba(99, 102, 241, 0.12)' : 'none',
                    overflow: 'hidden',
                    userSelect: 'none'
                }}
            >
                {/* RESPLANDORES CÓSMICOS DE FONDO (PALETA LOGIN NEXUS) */}
                <div style={{
                    position: 'absolute',
                    top: '-45px',
                    left: '-45px',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-35px',
                    right: '-35px',
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* SECCIÓN SUPERIOR: LOGO Y NAVEGACIÓN */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header: Logo squircle con neón Nexus */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isExpanded ? 'space-between' : 'center',
                        marginBottom: '28px',
                        padding: isExpanded ? '0 6px' : '0',
                        height: '36px'
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                            onClick={() => cambiarVista('panel')}
                            title="NativaTec"
                        >
                            {/* Squircle icono con gradiente cósmico y borde cian neón */}
                            <div style={{
                                width: '28px',
                                height: '26px',
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.35) 100%)',
                                border: '1.5px solid rgba(56, 189, 248, 0.65)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 0 14px rgba(56, 189, 248, 0.35), inset 0 0 8px rgba(99, 102, 241, 0.25)'
                            }}>
                                <span style={{
                                    color: '#ffffff',
                                    fontWeight: '900',
                                    fontSize: '13px',
                                    lineHeight: 1,
                                    filter: 'drop-shadow(0 0 4px #38bdf8)'
                                }}>
                                    N
                                </span>
                            </div>

                            {/* Nombre de la marca con gradiente neón como en el Login */}
                            <span style={{
                                background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 45%, #38bdf8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '700',
                                fontSize: '15px',
                                letterSpacing: '-0.02em',
                                whiteSpace: 'nowrap',
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'opacity 0.2s ease 0.04s, transform 0.2s ease 0.04s',
                                overflow: 'hidden',
                                filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.25))'
                            }}>
                                NativaTec
                            </span>
                        </div>

                        {/* Botón cerrar en móvil */}
                        {isMobile && (
                            <button
                                onClick={() => setMenuAbierto(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Menú de navegación */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = vistaActiva === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        cambiarVista(item.id);
                                        if (isMobile) setMenuAbierto(false);
                                    }}
                                    title={!isExpanded ? item.label : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: isExpanded ? 'flex-start' : 'center',
                                        gap: '12px',
                                        width: '100%',
                                        padding: isExpanded ? '10px 12px' : '10px 0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13.5px',
                                        fontWeight: isActive ? '600' : '500',
                                        background: isActive
                                            ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.24) 0%, rgba(168, 85, 247, 0.14) 100%)'
                                            : 'transparent',
                                        border: isActive
                                            ? '1px solid rgba(99, 102, 241, 0.45)'
                                            : '1px solid transparent',
                                        boxShadow: isActive
                                            ? '0 0 16px rgba(99, 102, 241, 0.22), inset 0 0 8px rgba(99, 102, 241, 0.1)'
                                            : 'none',
                                        color: isActive ? '#ffffff' : '#94a3b8',
                                        transition: 'all 0.18s ease',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.color = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                            e.currentTarget.style.color = '#94a3b8';
                                        }
                                    }}
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={isActive ? 2.2 : 1.8}
                                        style={{
                                            color: isActive ? '#38bdf8' : 'currentColor',
                                            filter: isActive ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' : 'none',
                                            flexShrink: 0,
                                            transition: 'color 0.18s ease'
                                        }}
                                    />

                                    {/* Texto del ítem con transición suave */}
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        opacity: isExpanded ? 1 : 0,
                                        transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                        transition: 'opacity 0.2s ease 0.04s, transform 0.2s ease 0.04s',
                                        overflow: 'hidden',
                                        maxWidth: isExpanded ? '180px' : '0px',
                                        display: 'inline-block'
                                    }}>
                                        {item.label}
                                    </span>

                                    {/* Contador de cuestionarios con estilo neón */}
                                    {item.count !== undefined && item.count > 0 && isExpanded && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: 'rgba(99, 102, 241, 0.25)',
                                            border: '1px solid rgba(99, 102, 241, 0.45)',
                                            color: '#38bdf8',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            padding: '2px 7px',
                                            borderRadius: '6px',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 0 8px rgba(99, 102, 241, 0.25)'
                                        }}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* BOTÓN CERRAR SESIÓN EN EL MENÚ SUPERIOR */}
                        <button
                            onClick={() => {
                                onLogout();
                                if (isMobile) setMenuAbierto(false);
                            }}
                            title={!isExpanded ? 'Cerrar sesión' : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                gap: '12px',
                                width: '100%',
                                padding: isExpanded ? '10px 12px' : '10px 0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: '1px solid transparent',
                                fontSize: '13.5px',
                                fontWeight: '500',
                                background: 'transparent',
                                color: '#94a3b8',
                                transition: 'all 0.18s ease',
                                marginTop: '4px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                                e.currentTarget.style.color = '#f87171';
                                e.currentTarget.style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.color = '#94a3b8';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <LogOut
                                size={19}
                                strokeWidth={1.8}
                                style={{ flexShrink: 0 }}
                            />
                            <span style={{
                                whiteSpace: 'nowrap',
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'opacity 0.2s ease 0.04s, transform 0.2s ease 0.04s',
                                overflow: 'hidden',
                                maxWidth: isExpanded ? '180px' : '0px',
                                display: 'inline-block'
                            }}>
                                Cerrar sesión
                            </span>
                        </button>
                    </nav>
                </div>

                {/* SECCIÓN INFERIOR: SOLO AVATAR Y NOMBRE (PALETA CÓSMICA NEXUS) */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    marginTop: 'auto',
                    borderTop: '1px solid rgba(99, 102, 241, 0.18)',
                    paddingTop: '14px'
                }}>
                    <div
                        onClick={() => {
                            cambiarVista('perfil');
                            if (isMobile) setMenuAbierto(false);
                        }}
                        title={!isExpanded ? `${userName} (Mi Perfil)` : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            gap: '12px',
                            padding: isExpanded ? '6px 8px' : '6px 0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: vistaActiva === 'perfil'
                                ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.24) 0%, rgba(168, 85, 247, 0.14) 100%)'
                                : 'transparent',
                            border: vistaActiva === 'perfil'
                                ? '1px solid rgba(99, 102, 241, 0.45)'
                                : '1px solid transparent',
                            boxShadow: vistaActiva === 'perfil'
                                ? '0 0 14px rgba(99, 102, 241, 0.22)'
                                : 'none',
                            transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (vistaActiva !== 'perfil') {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (vistaActiva !== 'perfil') {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }
                        }}
                    >
                        {/* Avatar circular con el gradiente cósmico oficial de Nexus */}
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                            flexShrink: 0,
                            boxShadow: '0 0 12px rgba(99, 102, 241, 0.45)',
                            border: '1.5px solid rgba(56, 189, 248, 0.55)'
                        }}>
                            {userInitials}
                        </div>

                        {/* SOLO EL NOMBRE (ESTILO MANU ARORA) */}
                        <span style={{
                            fontSize: '13.5px',
                            fontWeight: '600',
                            color: '#f8fafc',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            maxWidth: isExpanded ? '180px' : '0px',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                            transition: 'opacity 0.2s ease 0.04s, transform 0.2s ease 0.04s, max-width 0.2s ease',
                            display: 'inline-block'
                        }}>
                            {userName}
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
}
