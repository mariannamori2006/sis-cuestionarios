import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '430px',
                padding: '32px 28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxSizing: 'border-box'
            }}>
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
                        style={{
                            backgroundColor: '#dc2626',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '12px',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: eliminando ? 'not-allowed' : 'pointer',
                            opacity: eliminando ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!eliminando) e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                            if (!eliminando) e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                    >
                        {eliminando ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
