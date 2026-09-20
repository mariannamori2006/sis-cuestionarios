import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ParticipanteLogin() {
    const [nombreParticipante, setNombreParticipante] = useState('');
    const [codigoAcceso, setCodigoAcceso] = useState('');
    const navigate = useNavigate();

    const handleIngresar = (e) => {
        e.preventDefault();
        if (!nombreParticipante.trim()) return;

        // Guardamos temporalmente el nombre del alumno en sessionStorage
        sessionStorage.setItem('nombreParticipante', nombreParticipante);

        // Redirigimos al examen (asumiendo una ruta por ID o código)
        navigate(`/resolver/${codigoAcceso || 'default-id'}`);
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#0f172a',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ background: '#10b981', color: '#fff', width: '45px', height: '45px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                        🛡️
                    </div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#0f172a' }}>Nativatec Alumnos</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Ingresa tus datos para comenzar el cuestionario.</p>
                </div>

                <form onSubmit={handleIngresar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Tu Nombre o Apodo *
                        </label>
                        <input
                            type="text"
                            value={nombreParticipante}
                            onChange={(e) => setNombreParticipante(e.target.value)}
                            placeholder="Ej. Sofía Ramírez"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Código del Cuestionario
                        </label>
                        <input
                            type="text"
                            value={codigoAcceso}
                            onChange={(e) => setCodigoAcceso(e.target.value)}
                            placeholder="Código o ID proporcionado"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px',
                            marginTop: '10px'
                        }}
                    >
                        Comenzar Cuestionario
                    </button>
                </form>
            </div>
        </div>
    );
}