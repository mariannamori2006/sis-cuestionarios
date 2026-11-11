import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X, Lightbulb } from 'lucide-react';

export default function AlertaModal({
    isOpen,
    onClose,
    tipo = 'warning',
    titulo = 'Atención',
    mensaje = '',
    sugerencia = '',
    textoBoton = 'Entendido'
}) {
    // Cerrar con Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Configuración según tipo
    const configTipos = {
        warning: {
            icono: AlertTriangle,
            badge: 'Aviso del Sistema',
            colorBadgeBg: '#fef3c7',
            colorBadgeText: '#b45309',
            iconBg: '#fffbeb',
            iconBorder: '#fde68a',
            iconColor: '#d97706',
            glow: 'rgba(245, 158, 11, 0.18)',
            botonBg: '#0f172a',
            botonHover: '#1e293b'
        },
        error: {
            icono: AlertCircle,
            badge: 'Validación',
            colorBadgeBg: '#fee2e2',
            colorBadgeText: '#b91c1c',
            iconBg: '#fff1f2',
            iconBorder: '#fecdd3',
            iconColor: '#dc2626',
            glow: 'rgba(220, 38, 38, 0.18)',
            botonBg: '#dc2626',
            botonHover: '#b91c1c'
        },
        success: {
            icono: CheckCircle2,
            badge: 'Operación Exitosa',
            colorBadgeBg: '#dcfce7',
            colorBadgeText: '#15803d',
            iconBg: '#ecfdf5',
            iconBorder: '#a7f3d0',
            iconColor: '#16a34a',
            glow: 'rgba(22, 163, 74, 0.18)',
            botonBg: '#16a34a',
            botonHover: '#15803d'
        },
        info: {
            icono: Info,
            badge: 'Información',
            colorBadgeBg: '#e0f2fe',
            colorBadgeText: '#0369a1',
            iconBg: '#f0f9ff',
            iconBorder: '#bae6fd',
            iconColor: '#0284c7',
            glow: 'rgba(2, 132, 199, 0.18)',
            botonBg: '#0f172a',
            botonHover: '#1e293b'
        }
    };

    const cfg = configTipos[tipo] || configTipos.warning;
    const IconComponent = cfg.icono;

    // Formatear mensaje para resaltar textos entre comillas (por ejemplo 'Matemáticas')
    const renderMensaje = () => {
        if (!mensaje) return null;
        const partes = mensaje.split(/('.*?'|".*?")/g);
        return partes.map((parte, i) => {
            if ((parte.startsWith("'") && parte.endsWith("'")) || (parte.startsWith('"') && parte.endsWith('"'))) {
                return (
                    <strong
                        key={i}
                        style={{
                            color: '#0f172a',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontWeight: '700'
                        }}
                    >
                        {parte.slice(1, -1)}
                    </strong>
                );
            }
            return <span key={i}>{parte}</span>;
        });
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 99999,
                padding: '20px',
                boxSizing: 'border-box'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-scale-up"
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '430px',
                    padding: '32px 28px 24px',
                    boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.28), 0 0 1px 1px rgba(15, 23, 42, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    position: 'relative',
                    border: '1px solid #e2e8f0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
                }}
            >
                {/* BOTÓN CERRAR X */}
                <button
                    onClick={onClose}
                    type="button"
                    title="Cerrar"
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#64748b';
                    }}
                >
                    <X size={16} />
                </button>

                {/* ICONO DESTACADO CON AURA */}
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        backgroundColor: cfg.iconBg,
                        border: `2px solid ${cfg.iconBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: `0 10px 25px -5px ${cfg.glow}`
                    }}
                >
                    <IconComponent size={30} color={cfg.iconColor} strokeWidth={2.2} />
                </div>

                {/* BADGE CATEGORÍA */}
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: cfg.colorBadgeText,
                        backgroundColor: cfg.colorBadgeBg,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        marginBottom: '10px'
                    }}
                >
                    {cfg.badge}
                </span>

                {/* TÍTULO */}
                <h3
                    style={{
                        margin: '0 0 10px 0',
                        fontSize: '20px',
                        fontWeight: '800',
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.25'
                    }}
                >
                    {titulo}
                </h3>

                {/* MENSAJE PRINCIPAL */}
                <div
                    style={{
                        margin: '0 0 18px 0',
                        fontSize: '14.5px',
                        color: '#475569',
                        lineHeight: '1.55',
                        wordBreak: 'break-word'
                    }}
                >
                    {renderMensaje()}
                </div>

                {/* SUGERENCIA / CONSEJO ÚTIL (OPCIONAL) */}
                {sugerencia && (
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            textAlign: 'left',
                            boxSizing: 'border-box'
                        }}
                    >
                        <Lightbulb
                            size={18}
                            color="#eab308"
                            style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <div
                            style={{
                                fontSize: '12.5px',
                                color: '#64748b',
                                lineHeight: '1.45'
                            }}
                        >
                            {sugerencia}
                        </div>
                    </div>
                )}

                {/* BOTÓN DE ACCIÓN PRINCIPAL */}
                <button
                    onClick={onClose}
                    type="button"
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: cfg.botonBg,
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = cfg.botonHover;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = cfg.botonBg;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {textoBoton}
                </button>
            </div>
        </div>
    );
}

