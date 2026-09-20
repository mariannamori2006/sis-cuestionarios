import React, { useState } from 'react';

export default function CompartirCuestionarioModal({ isOpen, onClose, cuestionario }) {
    const [copiado, setCopiado] = useState(false);

    if (!isOpen || !cuestionario) return null;

    const codigo = cuestionario.codigoAcceso || (cuestionario.id ? cuestionario.id.substring(0, 8).toUpperCase() : '');
    const enlaceDirecto = `${window.location.origin}/resolver/${codigo || cuestionario.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(enlaceDirecto)}&color=0f172a`;

    const handleCopiar = () => {
        navigator.clipboard.writeText(enlaceDirecto).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
        }).catch(() => {
            // Fallback
            const input = document.getElementById('input-enlace-compartir');
            if (input) {
                input.select();
                document.execCommand('copy');
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2500);
            }
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '430px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '24px',
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                {/* ENCABEZADO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>
                            Compartir examen
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                            {cuestionario.titulo}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            lineHeight: 1,
                            padding: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* ENLACE DIRECTO */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#64748b',
                        letterSpacing: '0.6px',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                    }}>
                        ENLACE DIRECTO
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            id="input-enlace-compartir"
                            type="text"
                            readOnly
                            value={enlaceDirecto}
                            style={{
                                flex: 1,
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                fontSize: '13px',
                                color: '#334155',
                                outline: 'none',
                                boxSizing: 'border-box',
                                textOverflow: 'ellipsis'
                            }}
                        />
                        <button
                            onClick={handleCopiar}
                            style={{
                                backgroundColor: copiado ? '#10b981' : '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background-color 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span>{copiado ? '✓' : '📋'}</span>
                            <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                    </div>
                </div>

                {/* CÓDIGO QR */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#64748b',
                        letterSpacing: '0.6px',
                        marginBottom: '14px',
                        textTransform: 'uppercase'
                    }}>
                        CÓDIGO QR PARA ESCANEO MÓVIL
                    </div>

                    <div style={{
                        display: 'inline-flex',
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                        <img
                            src={qrUrl}
                            alt="Código QR del cuestionario"
                            style={{
                                width: '180px',
                                height: '180px',
                                display: 'block',
                                borderRadius: '8px'
                            }}
                        />
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                        Escanea con la cámara para abrir el examen
                    </div>
                </div>

                {/* BANNER INFORMATIVO INFERIOR */}
                <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                    }}>
                        👥
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                            Sin registro requerido
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            Los alumnos solo ingresan su nombre para participar
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
