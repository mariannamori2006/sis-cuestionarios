import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoNativa from '../images/logoNativa.jpeg';
import { Award, CheckCircle, LogOut } from 'lucide-react';
import { responderCuestionario } from '../services/cuestionarioService';

export default function ResolverCuestionario() {
    const { id } = useParams(); // ID o Código del cuestionario
    const navigate = useNavigate();

    const [nombreParticipante, setNombreParticipante] = useState(sessionStorage.getItem('nombreParticipante') || '');
    const [nombreInput, setNombreInput] = useState('');
    const [comenzado, setComenzado] = useState(Boolean(sessionStorage.getItem('nombreParticipante')));

    const [cuestionario, setCuestionario] = useState(null);
    const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({});
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        // Obtenemos los detalles del cuestionario y sus preguntas desde el backend
        axios.get(`http://localhost:8080/api/cuestionarios/resolver/${id}`)
            .then(res => {
                setCuestionario(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar el cuestionario:", err);
                setLoading(false);
            });
    }, [id]);

    const handleIniciarConNombre = (e) => {
        e.preventDefault();
        if (!nombreInput.trim()) return;
        sessionStorage.setItem('nombreParticipante', nombreInput.trim());
        setNombreParticipante(nombreInput.trim());
        setComenzado(true);
    };

    const handleSelectOpcion = (preguntaKey, opcionKey) => {
        setRespuestasSeleccionadas(prev => ({
            ...prev,
            [preguntaKey]: opcionKey
        }));
    };

    const handleSubmitEvaluacion = async (e) => {
        e.preventDefault();

        if (!cuestionario) return;

        setEnviando(true);

        const respuestasPayload = (cuestionario.preguntas || []).map((pregunta, pIndex) => {
            const pKey = pregunta.id || pIndex;
            const opcionId = respuestasSeleccionadas[pKey];
            return {
                preguntaId: pregunta.id || null,
                opcionSeleccionadaId: opcionId || null
            };
        });

        try {
            const resultadoBackend = await responderCuestionario({
                cuestionarioId: cuestionario.id,
                nombreParticipante: (nombreParticipante || 'Anónimo').trim(),
                respuestas: respuestasPayload
            });

            setResultado({
                nota: resultadoBackend.notaFormateada || `${resultadoBackend.calificacion} / 20`,
                mensaje: resultadoBackend.mensaje
            });
        } catch (err) {
            console.error("Error al enviar respuestas a la base de datos:", err);
            // Fallback en caso de error de red
            let totalPreguntas = cuestionario.preguntas?.length || 0;
            let aciertos = 0;
            (cuestionario.preguntas || []).forEach((pregunta, pIndex) => {
                const pKey = pregunta.id || pIndex;
                const opcionSeleccionadaId = respuestasSeleccionadas[pKey];
                if (pregunta.opciones) {
                    const opcionElegida = pregunta.opciones.find((op, oIndex) => (op.id || oIndex) === opcionSeleccionadaId);
                    if (opcionElegida && (opcionElegida.correcta === true || opcionElegida.esCorrecta === true)) {
                        aciertos++;
                    }
                }
            });
            const notaCalculada = totalPreguntas > 0 ? ((aciertos / totalPreguntas) * 20).toFixed(1) : "20.0";
            setResultado({
                nota: `${notaCalculada} / 20`,
                mensaje: `Has completado el cuestionario con ${aciertos} de ${totalPreguntas} aciertos.`
            });
        } finally {
            setEnviando(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Segoe UI' }}>Cargando evaluación...</div>;
    }

    if (!cuestionario) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Segoe UI' }}>
                <h3 style={{ color: '#0f172a' }}>Cuestionario no encontrado</h3>
                <p style={{ color: '#64748b' }}>No se encontró ningún cuestionario activo con el código o ID: <strong>{id}</strong>.</p>
                <button
                    onClick={() => navigate('/alumno/login')}
                    style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', marginTop: '12px' }}
                >
                    Volver a intentar
                </button>
            </div>
        );
    }

    // Ingreso directo por QR o enlace ingresar nombre
    if (!comenzado) {
        return (
            <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '36px', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '42px', objectFit: 'contain' }} />
                        </div>
                        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a' }}>{cuestionario.titulo}</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{cuestionario.descripcion || 'Evaluación académica'}</p>
                    </div>

                    <form onSubmit={handleIniciarConNombre} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                Tu Nombre o Apodo *
                            </label>
                            <input
                                type="text"
                                value={nombreInput}
                                onChange={(e) => setNombreInput(e.target.value)}
                                placeholder="Ej. Sofía Ramírez"
                                required
                                autoFocus
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
                            Comenzar Evaluación
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                {/* Cabecera del Examen */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={logoNativa} alt="NativaTec" style={{ height: '32px', objectFit: 'contain' }} />
                        <div>
                            <h2 style={{ margin: '0', fontSize: '20px', color: '#0f172a' }}>{cuestionario.titulo}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>{cuestionario.descripcion}</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Participante:</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{nombreParticipante}</strong>
                    </div>
                </div>

                {resultado ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: '#10b981' }}>
                                <Award size={48} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0' }}>¡Resultado Final!</h3>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', margin: '15px 0' }}>{resultado.nota}</div>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>{resultado.mensaje}</p>
                        <button
                            onClick={() => navigate('/alumno/login')}
                            style={{ marginTop: '20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <LogOut size={16} /> Finalizar y Salir
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitEvaluacion} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {cuestionario.preguntas && cuestionario.preguntas.length > 0 ? (
                            cuestionario.preguntas.map((pregunta, index) => {
                                const pKey = pregunta.id || index;
                                return (
                                    <div key={pKey} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1e293b' }}>
                                            {index + 1}. {pregunta.enunciado || pregunta.textoPregunta}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {pregunta.opciones && pregunta.opciones.map((opcion, oIndex) => {
                                                const oKey = opcion.id || oIndex;
                                                return (
                                                    <label key={oKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1' }}>
                                                        <input
                                                            type="radio"
                                                            name={`pregunta_${pKey}`}
                                                            checked={respuestasSeleccionadas[pKey] === oKey}
                                                            onChange={() => handleSelectOpcion(pKey, oKey)}
                                                            required
                                                        />
                                                        {opcion.texto || opcion.textoOpcion}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Este cuestionario aún no tiene preguntas registradas.</p>
                        )}

                        <button
                            type="submit"
                            style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '15px',
                                marginTop: '10px'
                            }}
                        >
                            Enviar Respuestas y Calificar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}