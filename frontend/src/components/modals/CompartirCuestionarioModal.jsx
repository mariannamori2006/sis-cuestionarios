import React, { useState } from 'react';
import { X, Copy, Check, Users, KeyRound, Link, QrCode } from 'lucide-react';

export default function CompartirCuestionarioModal({ isOpen, onClose, cuestionario }) {
    const [copiadoEnlace, setCopiadoEnlace] = useState(false);
    const [copiadoCodigo, setCopiadoCodigo] = useState(false);

    if (!isOpen || !cuestionario) return null;

    const codigo = cuestionario.codigoAcceso || (cuestionario.id ? cuestionario.id.substring(0, 6).toUpperCase() : '');
    const enlacePortal = `${window.location.origin}/unirse`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(enlacePortal)}&color=0f172a`;

    const handleCopiarEnlace = () => {
        navigator.clipboard.writeText(enlacePortal).then(() => {
            setCopiadoEnlace(true);
            setTimeout(() => setCopiadoEnlace(false), 2500);
        }).catch(() => {
            const input = document.getElementById('input-enlace-compartir');
            if (input) {
                input.select();
                document.execCommand('copy');
                setCopiadoEnlace(true);
                setTimeout(() => setCopiadoEnlace(false), 2500);
            }
        });
    };

    const handleCopiarCodigo = () => {
        navigator.clipboard.writeText(codigo).then(() => {
            setCopiadoCodigo(true);
            setTimeout(() => setCopiadoCodigo(false), 2500);
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
                maxWidth: '460px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '28px',
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                {/* ENCABEZADO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>
                            Compartir Cuestionario
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
                            cursor: 'pointer',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 1. CÓDIGO NUMÉRICO DE 6 DÍGITOS */}
                <div style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    color: '#ffffff',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                            CÓDIGO NUMÉRICO DE ACCESO
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '4px', fontFamily: 'monospace', color: '#38bdf8' }}>
                            {codigo}
                        </div>
                    </div>
                    <button
                        onClick={handleCopiarCodigo}
                        style={{
                            backgroundColor: copiadoCodigo ? '#10b981' : '#1e293b',
                            color: '#ffffff',
                            border: '1px solid #334155',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {copiadoCodigo ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiadoCodigo ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                </div>

                {/* 2. ENLACE PARA EL ALUMNO */}
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
                        ENLACE DIRECTO DEL PORTAL
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            id="input-enlace-compartir"
                            type="text"
                            readOnly
                            value={enlacePortal}
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
                            onClick={handleCopiarEnlace}
                            style={{
                                backgroundColor: copiadoEnlace ? '#10b981' : '#0f172a',
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
                            {copiadoEnlace ? <Check size={15} /> : <Copy size={15} />}
                            <span>{copiadoEnlace ? '¡Copiado!' : 'Copiar Link'}</span>
                        </button>
                    </div>
                </div>

                {/* 3. CÓDIGO QR */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#64748b',
                        letterSpacing: '0.6px',
                        marginBottom: '12px',
                        textTransform: 'uppercase'
                    }}>
                        CÓDIGO QR PARA ACCESO RÁPIDO AL PORTAL
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
                            alt="Código QR del portal de evaluación"
                            style={{
                                width: '160px',
                                height: '160px',
                                display: 'block',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                </div>

                {/* 4. GUÍA DEL FLUJO DEL ALUMNO */}
                <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '12px',
                    color: '#1e3a8a',
                    lineHeight: '1.5'
                }}>
                    <strong>Instrucciones para el alumno:</strong>
                    <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                        <li>Ingresa al enlace o escanea el QR.</li>
                        <li>Escribe el código numérico: <strong>{codigo}</strong>.</li>
                        <li>Ingresa su nombre o apodo y podrá resolver el examen.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

