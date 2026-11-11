import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';

export default function EliminarCuestionarioModal({ isOpen, onClose, cuestionario, onConfirmarEliminacion }) {
    const [eliminando, setEliminando] = useState(false);

    if (!isOpen || !cuestionario) return null;

    const handleConfirmar = async () => {
        try {
            setEliminando(true);
            await onConfirmarEliminacion(cuestionario);
            onClose();
        } catch (err) {
            console.error('Error al eliminar cuestionario:', err);
        } finally {
            setEliminando(false);
        }
    };

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
                zIndex: 1100,
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
                    width: '90%',
                    maxWidth: '430px',
                    padding: '36px 30px',
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
                        transition: 'all 0.2s'
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <Trash2 size={24} color="#dc2626" />
                </div>

                {/* TÍTULO */}
                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#0f172a'
                }}>
                    Eliminar cuestionario
                </h3>

                {/* TEXTO DE CONFIRMACIÓN */}
                <p style={{
                    margin: '0 0 28px 0',
                    fontSize: '14px',
                    color: '#64748b',
                    lineHeight: '1.5',
                    maxWidth: '340px'
                }}>
                    ¿Estás seguro de que deseas eliminar <strong style={{ color: '#0f172a', fontWeight: '700' }}>{cuestionario.titulo}</strong>? Esta acción no se puede deshacer.
                </p>

                {/* BOTONES DE ACCIÓN */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    width: '100%'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={eliminando}
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            borderRadius: '12px',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmar}
                        disabled={eliminando}
                        className="interactive-card"
                        style={{
                            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '12px',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: eliminando ? 'not-allowed' : 'pointer',
                            opacity: eliminando ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
                        }}
                    >
                        {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
