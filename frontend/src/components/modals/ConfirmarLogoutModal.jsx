import React from 'react';
import { LogOut, X } from 'lucide-react';

export default function ConfirmarLogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '20px',
                boxSizing: 'border-box'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-scale-up"
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '22px',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '34px 28px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    position: 'relative',
                    border: '1px solid #e2e8f0'
                }}
            >
                {/* BOTÓN CERRAR X */}
                <button
                    onClick={onClose}
                    title="Cerrar ventana"
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <X size={18} />
                </button>

                {/* ICONO SUPERIOR */}
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <LogOut size={26} />
                </div>

                {/* TÍTULO Y MENSAJE */}
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#0f172a',
                    letterSpacing: '-0.02em'
                }}>
                    Cerrar sesión
                </h3>
                <p style={{
                    margin: '0 0 24px 0',
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.5'
                }}>
                    ¿Estás seguro de que deseas salir de tu cuenta?
                </p>

                {/* BOTONES DE ACCIÓN: NO / SÍ */}
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '11px 16px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        No, cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '11px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '13px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Sí, salir
                    </button>
                </div>
            </div>
        </div>
    );
}

