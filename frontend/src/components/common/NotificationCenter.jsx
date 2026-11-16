import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    Clock,
    ShieldAlert,
    Trash2,
    X,
    ExternalLink,
    Sparkles,
    Calendar,
    AlertCircle
} from 'lucide-react';
import {
    obtenerNotificaciones,
    obtenerConteoNoLeidas,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    eliminarNotificacion
} from '../../services/notificacionService';

// Formateador de tiempo relativo amigable
const formatearTiempoRelativo = (fechaStr) => {
    if (!fechaStr) return '';
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return '';
        const ahora = new Date();
        const diffSegundos = Math.floor((ahora - fecha) / 1000);

        if (diffSegundos < 60) return 'Hace un momento';
        const diffMinutos = Math.floor(diffSegundos / 60);
        if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
        const diffHoras = Math.floor(diffMinutos / 60);
        if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
        const diffDias = Math.floor(diffHoras / 24);
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;

        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
    } catch {
        return '';
    }
};

export default function NotificationCenter({ onAbrirAuditoria = null, onNavegar = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidasCount, setNoLeidasCount] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [filtro, setFiltro] = useState('todas'); // 'todas' | 'no_leidas'
    const dropdownRef = useRef(null);

    // Cargar conteo y lista inicial
    const cargarDatos = async (silencioso = false) => {
        try {
            if (!silencioso) setCargando(true);
            const [lista, conteoObj] = await Promise.all([
                obtenerNotificaciones(),
                obtenerConteoNoLeidas()
            ]);
            setNotificaciones(Array.isArray(lista) ? lista : []);
            setNoLeidasCount(typeof conteoObj?.count === 'number' ? conteoObj.count : 0);
        } catch (err) {
            console.warn('[NotificationCenter] Error al sincronizar notificaciones:', err);
        } finally {
            if (!silencioso) setCargando(false);
        }
    };

    // Sincronización inicial y polling periódico cada 30 segundos
    useEffect(() => {
        cargarDatos(false);

        const interval = setInterval(() => {
            cargarDatos(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickAfuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickAfuera);
        }
        return () => document.removeEventListener('mousedown', handleClickAfuera);
    }, [isOpen]);

    const handleMarcarLeida = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await marcarNotificacionLeida(id);
            setNotificaciones(prev =>
                prev.map(n => n.id === id ? { ...n, leido: true } : n)
            );
            setNoLeidasCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error al marcar notificación como leída:', err);
        }
    };

    const handleMarcarTodas = async () => {
        try {
            await marcarTodasLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
            setNoLeidasCount(0);
        } catch (err) {
            console.error('Error al marcar todas como leídas:', err);
        }
    };

    const handleEliminar = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await eliminarNotificacion(id);
            const eliminada = notificaciones.find(n => n.id === id);
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            if (eliminada && !eliminada.leido) {
                setNoLeidasCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error al eliminar notificación:', err);
        }
    };

    const handleClickItem = (notif) => {
        if (!notif.leido) {
            handleMarcarLeida(notif.id);
        }

        // Navegación contextual si incluye cuestionarioId
        if (notif.cuestionarioId && onAbrirAuditoria) {
            onAbrirAuditoria(notif.cuestionarioId);
            setIsOpen(false);
        } else if (onNavegar) {
            onNavegar('cuestionarios');
            setIsOpen(false);
        }
    };

    // Render de icono según el tipo de notificación
    const renderIcono = (tipo) => {
        switch (tipo) {
            case 'ENTREGA':
                return (
                    <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={18} />
                    </div>
                );
            case 'REVISION_PENDIENTE':
                return (
                    <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={18} />
                    </div>
                );
            case 'MODO_SEGURO':
                return (
                    <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={18} />
                    </div>
                );
            case 'FECHA_LIMITE':
                return (
                    <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={18} />
                    </div>
                );
            default:
                return (
                    <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={18} />
                    </div>
                );
        }
    };

    const notificacionesFiltradas = filtro === 'no_leidas'
        ? notificaciones.filter(n => !n.leido)
        : notificaciones;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            
            {/* BOTÓN CAMPANA DISPARADOR */}
            <button
                type="button"
                onClick={() => {
                    const nuevoEstado = !isOpen;
                    setIsOpen(nuevoEstado);
                    if (nuevoEstado) {
                        cargarDatos(true);
                    }
                }}
                title="Centro de notificaciones"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: isOpen ? '#e2e8f0' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <Bell size={19} color={noLeidasCount > 0 ? '#0f172a' : '#64748b'} />

                {/* BADGE DE NO LEÍDAS */}
                {noLeidasCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        borderRadius: '9999px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 0 2px #ffffff',
                        animation: 'pulse 2s infinite'
                    }}>
                        {noLeidasCount > 99 ? '99+' : noLeidasCount}
                    </span>
                )}
            </button>

            {/* PANEL DESPLEGABLE (POPOVER) */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '360px',
                    maxWidth: '90vw',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    
                    {/* ENCABEZADO DEL CENTRO DE NOTIFICACIONES */}
                    <div style={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                Notificaciones
                            </h3>
                            {noLeidasCount > 0 && (
                                <span style={{
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '1px 7px',
                                    borderRadius: '10px'
                                }}>
                                    {noLeidasCount} nuevas
                                </span>
                            )}
                        </div>

                        {noLeidasCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarcarTodas}
                                title="Marcar todas como leídas"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 6px',
                                    borderRadius: '6px'
                                }}
                            >
                                <CheckCheck size={14} /> Marcar leídas
                            </button>
                        )}
                    </div>

                    {/* FILTROS (TODAS / NO LEÍDAS) */}
                    <div style={{
                        display: 'flex',
                        padding: '6px 12px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        gap: '6px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setFiltro('todas')}
                            style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filtro === 'todas' ? '#ffffff' : 'transparent',
                                color: filtro === 'todas' ? '#0f172a' : '#64748b',
                                fontWeight: filtro === 'todas' ? '700' : '500',
                                fontSize: '12px',
                                cursor: 'pointer',
                                boxShadow: filtro === 'todas' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            Todas ({notificaciones.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltro('no_leidas')}
                            style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filtro === 'no_leidas' ? '#ffffff' : 'transparent',
                                color: filtro === 'no_leidas' ? '#0f172a' : '#64748b',
                                fontWeight: filtro === 'no_leidas' ? '700' : '500',
                                fontSize: '12px',
                                cursor: 'pointer',
                                boxShadow: filtro === 'no_leidas' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            No leídas ({noLeidasCount})
                        </button>
                    </div>

                    {/* LISTA CON SCROLL */}
                    <div style={{
                        maxHeight: '380px',
                        overflowY: 'auto',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        {cargando && notificaciones.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                                Sincronizando notificaciones...
                            </div>
                        ) : notificacionesFiltradas.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 10px auto',
                                    color: '#64748b'
                                }}>
                                    <Sparkles size={20} />
                                </div>
                                <strong style={{ fontSize: '13px', color: '#475569', display: 'block' }}>
                                    {filtro === 'no_leidas' ? '¡Todo al día!' : 'Sin notificaciones'}
                                </strong>
                                <span style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {filtro === 'no_leidas' ? 'No tienes alertas pendientes de lectura.' : 'Aquí recibirás entregas de alumnos, alertas de modo seguro y avisos.'}
                                </span>
                            </div>
                        ) : (
                            notificacionesFiltradas.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleClickItem(n)}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        backgroundColor: n.leido ? '#ffffff' : '#f8fafc',
                                        border: n.leido ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = n.leido ? '#f8fafc' : '#f1f5f9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = n.leido ? '#ffffff' : '#f8fafc';
                                    }}
                                >
                                    {/* Icono temático */}
                                    <div style={{ flexShrink: 0 }}>
                                        {renderIcono(n.tipo)}
                                    </div>

                                    {/* Contenido */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: '13px',
                                                fontWeight: n.leido ? '600' : '700',
                                                color: '#0f172a',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {n.titulo}
                                            </h4>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                                {formatearTiempoRelativo(n.createdAt)}
                                            </span>
                                        </div>

                                        <p style={{
                                            margin: '4px 0 0 0',
                                            fontSize: '12px',
                                            color: '#475569',
                                            lineHeight: '1.45',
                                            wordBreak: 'break-word'
                                        }}>
                                            {n.mensaje}
                                        </p>

                                        {/* Acciones de la tarjeta */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                                            {!n.leido && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarcarLeida(n.id, e)}
                                                    title="Marcar como leída"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#2563eb',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        padding: '2px 4px'
                                                    }}
                                                >
                                                    Leída
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => handleEliminar(n.id, e)}
                                                title="Eliminar notificación"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    padding: '2px 4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indicador de punto no leído */}
                                    {!n.leido && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#2563eb'
                                        }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* PIE DEL PANEL */}
                    <div style={{
                        padding: '10px 16px',
                        borderTop: '1px solid #f1f5f9',
                        backgroundColor: '#ffffff',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Centro de notificaciones académicas · NativaTec
                        </span>
                    </div>

                </div>
            )}
        </div>
    );
}

