import React, { useState } from 'react';
import { crearCuestionario } from '../services/cuestionarioService';
import { X, UploadCloud, Download, Plus } from 'lucide-react';

export default function CrearCuestionarioModal({ isOpen, onClose, onCuestionarioCreado }) {
    const [tabActiva, setTabActiva] = useState('manual'); // 'manual' o 'importar'

    // Campos del cuestionario
    const [titulo, setTitulo] = useState('');
    const [materia, setMateria] = useState('Matemáticas');
    const [descripcion, setDescripcion] = useState('');

    // Lista de preguntas para la creación manual
    const [preguntas, setPreguntas] = useState([
        {
            enunciado: '',
            tipo: 'Opción múltiple',
            opciones: [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Manejar cambios en las preguntas
    const handlePreguntaChange = (index, value) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].enunciado = value;
        setPreguntas(nuevasPreguntas);
    };

    // Manejar cambios en las opciones de una pregunta
    const handleOpcionChange = (pIndex, oIndex, texto) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].opciones[oIndex].texto = texto;
        setPreguntas(nuevasPreguntas);
    };

    // Marcar opción correcta
    const handleSeleccionarCorrecta = (pIndex, oIndex) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].opciones.forEach((op, idx) => {
            op.correcta = (idx === oIndex);
        });
        setPreguntas(nuevasPreguntas);
    };

    // Añadir nueva pregunta
    const agregarPregunta = () => {
        setPreguntas([...preguntas, {
            enunciado: '',
            tipo: 'Opción múltiple',
            opciones: [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]
        }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setError('El título del cuestionario es obligatorio.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const preguntasFormateadas = preguntas.map((p, index) => ({
                enunciado: p.enunciado,
                tipo: p.tipo === 'Verdadero/Falso' ? 'VERDADERO_FALSO' : 'OPCION_MULTIPLE',
                orden: index + 1,
                opciones: p.opciones.map(o => ({
                    texto: o.texto,
                    correcta: Boolean(o.correcta)
                }))
            }));

            const cuestionarioData = {
                titulo: titulo.trim(),
                descripcion: `[${materia}] ${descripcion.trim()}`,
                preguntas: preguntasFormateadas
            };

            const cuestionarioCreado = await crearCuestionario(cuestionarioData);

            // Limpiar formulario
            setTitulo('');
            setDescripcion('');
            setPreguntas([{ enunciado: '', tipo: 'Opción múltiple', opciones: [{ texto: '', correcta: true }, { texto: '', correcta: false }, { texto: '', correcta: false }, { texto: '', correcta: false }] }]);
            
            // Notificar y cerrar
            if (onCuestionarioCreado) {
                onCuestionarioCreado(cuestionarioCreado);
            }
            onClose();
        } catch (err) {
            console.error('Error al guardar el cuestionario:', err);
            const msg = err.response?.data?.message || err.message || 'Hubo un error al registrar el cuestionario en la base de datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const esFormularioValido = titulo.trim().length > 0;

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
            zIndex: 1000,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* ENCABEZADO DEL MODAL */}
                <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Nuevo cuestionario</h2>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Crea y configura tu examen</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PESTAÑAS (Creación manual / Importar archivo) */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', backgroundColor: '#f8fafc' }}>
                    <button
                        type="button"
                        onClick={() => setTabActiva('manual')}
                        style={{
                            padding: '14px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tabActiva === 'manual' ? '2px solid #0f172a' : '2px solid transparent',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: tabActiva === 'manual' ? '#0f172a' : '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        Creación manual
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabActiva('importar')}
                        style={{
                            padding: '14px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tabActiva === 'importar' ? '2px solid #0f172a' : '2px solid transparent',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: tabActiva === 'importar' ? '#0f172a' : '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        Importar archivo
                    </button>
                </div>

                {error && (
                    <div style={{ margin: '20px 24px 0 24px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* CONTENIDO DEL MODAL */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {tabActiva === 'manual' ? (
                        <>
                            {/* TÍTULO */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    TÍTULO DEL CUESTIONARIO *
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Álgebra Lineal — Unidad 3"
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

                            {/* MATERIA Y DESCRIPCIÓN */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        MATERIA
                                    </label>
                                    <select
                                        value={materia}
                                        onChange={(e) => setMateria(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="Matemáticas">Matemáticas</option>
                                        <option value="Historia">Historia</option>
                                        <option value="Biología">Biología</option>
                                        <option value="Informática">Informática</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        DESCRIPCIÓN
                                    </label>
                                    <input
                                        type="text"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Breve descripción..."
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
                            </div>

                            {/* PREGUNTAS */}
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                                    Preguntas ({preguntas.length})
                                </div>

                                {preguntas.map((pregunta, pIndex) => (
                                    <div key={pIndex} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f8fafc',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                                            <div style={{ backgroundColor: '#0f172a', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                {pIndex + 1}
                                            </div>
                                            <select
                                                value={pregunta.tipo}
                                                onChange={(e) => {
                                                    const nuevas = [...preguntas];
                                                    nuevas[pIndex].tipo = e.target.value;
                                                    setPreguntas(nuevas);
                                                }}
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                                            >
                                                <option value="Opción múltiple">Opción múltiple</option>
                                                <option value="Verdadero/Falso">Verdadero/Falso</option>
                                            </select>
                                        </div>

                                        <input
                                            type="text"
                                            value={pregunta.enunciado}
                                            onChange={(e) => handlePreguntaChange(pIndex, e.target.value)}
                                            placeholder="Escribe la pregunta..."
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '14px',
                                                backgroundColor: '#fff',
                                                marginBottom: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* Opciones A, B, C, D */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {pregunta.opciones.map((opcion, oIndex) => {
                                                const letra = String.fromCharCode(65 + oIndex); // A, B, C, D
                                                return (
                                                    <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            type="radio"
                                                            name={`correcta_${pIndex}`}
                                                            checked={opcion.correcta}
                                                            onChange={() => handleSeleccionarCorrecta(pIndex, oIndex)}
                                                            title="Marcar como respuesta correcta"
                                                            style={{ cursor: 'pointer', accentColor: '#059669', width: '18px', height: '18px' }}
                                                        />
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', width: '15px' }}>{letra}</span>
                                                        <input
                                                            type="text"
                                                            value={opcion.texto}
                                                            onChange={(e) => handleOpcionChange(pIndex, oIndex, e.target.value)}
                                                            placeholder={`Opción ${letra}...`}
                                                            required
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '13px',
                                                                backgroundColor: '#fff',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Botón Añadir Pregunta */}
                                <button
                                    type="button"
                                    onClick={agregarPregunta}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        backgroundColor: '#ffffff',
                                        color: '#475569',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <Plus size={18} /> Añadir pregunta
                                </button>
                            </div>
                        </>
                    ) : (
                        /* PESTAÑA IMPORTAR ARCHIVO */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <UploadCloud size={40} color="#3b82f6" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>Arrastra tu archivo aquí</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>o haz clic para seleccionar</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Excel (.xlsx, .xls) o CSV</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => alert('Descargando plantilla de ejemplo...')}
                                style={{
                                    alignSelf: 'flex-start',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Download size={15} /> Descargar plantilla de ejemplo
                            </button>

                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                <strong>Formato esperado:</strong>
                                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                                    <li>Columna A: Tipo (multiple / truefalse / short)</li>
                                    <li>Columna B: Texto de la pregunta</li>
                                    <li>Columnas C-F: Opciones (para opción múltiple)</li>
                                    <li>Columna G: Respuesta correcta</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* BOTONES INFERIORES */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !esFormularioValido}
                            style={{
                                backgroundColor: esFormularioValido ? '#0f172a' : '#94a3b8',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: esFormularioValido ? 'pointer' : 'default',
                                fontSize: '13px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Guardando...' : 'Guardar cuestionario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}