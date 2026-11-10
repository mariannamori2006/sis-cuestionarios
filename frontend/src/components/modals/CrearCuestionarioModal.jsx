import React, { useState, useEffect, useRef } from 'react';
import { crearCuestionario, actualizarCuestionario } from '../../services/cuestionarioService';
import { descargarPlantillaExcel, procesarArchivoPreguntas } from '../../services/excelService';
import { obtenerPreguntasBanco, crearPreguntaBanco } from '../../services/bancoPreguntaService';
import { X, UploadCloud, Download, Plus, Trash2, CheckCircle2, Type, CheckSquare, Shuffle, AlertCircle, Image as ImageIcon, Link2, ShieldAlert, Calendar, RotateCcw, Lightbulb, Users, Sliders, ChevronDown, Award, BookOpen, Sparkles, Check, Search, Layers } from 'lucide-react';

const ToggleSwitch = ({ checked, onChange, activeColor = '#2563eb' }) => (
    <div
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        style={{
            position: 'relative',
            width: '40px',
            height: '22px',
            borderRadius: '9999px',
            backgroundColor: checked ? activeColor : '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: checked ? `0 2px 8px ${activeColor}40` : 'none',
            flexShrink: 0,
            userSelect: 'none',
            display: 'inline-block'
        }}
    >
        <span
            style={{
                display: 'block',
                width: '16px',
                height: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: checked ? '21px' : '3px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
            }}
        />
    </div>
);

const formatDateTimeForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
        if (Array.isArray(dateVal)) {
            const [y, m, d, h = 0, min = 0] = dateVal;
            const pad = (n) => String(n).padStart(2, '0');
            return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}`;
        }
        if (typeof dateVal === 'string') {
            return dateVal.substring(0, 16);
        }
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
};

export default function CrearCuestionarioModal({ isOpen, onClose, onCuestionarioCreado, cuestionarioAEditar = null }) {
    const [tabActiva, setTabActiva] = useState('manual'); // 'manual' o 'importar'

    // Campos del cuestionario
    const [titulo, setTitulo] = useState('');
    const [materia, setMateria] = useState('Matemáticas');
    const [descripcion, setDescripcion] = useState('');
    const [tiempoLimiteMinutos, setTiempoLimiteMinutos] = useState(0);
    const [ordenAleatorio, setOrdenAleatorio] = useState(false);
    const [modoSeguro, setModoSeguro] = useState(false);
    const [limiteAdvertencias, setLimiteAdvertencias] = useState(3);

    // Control y flexibilidad de exámenes (Ventana de disponibilidad y Límite de intentos)
    const [programarFechas, setProgramarFechas] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [limiteIntentos, setLimiteIntentos] = useState(1);
    const [tipoCalificacionIntentos, setTipoCalificacionIntentos] = useState('MEJOR_NOTA');
    const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(true);
    const [gruposPermitidos, setGruposPermitidos] = useState('');
    const [expandirConfiguracion, setExpandirConfiguracion] = useState(false);

    // Estados para la importación de archivos Excel / CSV
    const [arrastrando, setArrastrando] = useState(false);
    const [cargandoImportacion, setCargandoImportacion] = useState(false);
    const [errorImportacion, setErrorImportacion] = useState('');
    const [resumenImportacion, setResumenImportacion] = useState(null);
    const [preguntasImportadasPendientes, setPreguntasImportadasPendientes] = useState([]);
    const fileInputRef = useRef(null);

    // Modal para importar desde el Banco Centralizado
    const [modalBancoAbierto, setModalBancoAbierto] = useState(false);
    const [preguntasBanco, setPreguntasBanco] = useState([]);
    const [cargandoBanco, setCargandoBanco] = useState(false);
    const [seleccionadasBanco, setSeleccionadasBanco] = useState({});
    const [filtroBancoMateria, setFiltroBancoMateria] = useState('');
    const [filtroBancoDificultad, setFiltroBancoDificultad] = useState('TODAS');
    const [busquedaBanco, setBusquedaBanco] = useState('');

    // Estado para guardar pregunta en el banco
    const [guardandoEnBancoIndex, setGuardandoEnBancoIndex] = useState(null);
    const [mensajeBancoExito, setMensajeBancoExito] = useState('');

    // Lista de preguntas para la creación/edición manual
    const [preguntas, setPreguntas] = useState([
        {
            enunciado: '',
            tipo: 'Opción múltiple',
            puntos: 4.0,
            imagenUrl: '',
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

    const esModoEdicion = Boolean(cuestionarioAEditar && cuestionarioAEditar.id);

    // Precargar información cuando se abre para editar o resetear cuando se abre para crear
    useEffect(() => {
        if (!isOpen) return;

        if (cuestionarioAEditar) {
            setTitulo(cuestionarioAEditar.titulo || '');
            setTiempoLimiteMinutos(cuestionarioAEditar.tiempoLimiteMinutos || 0);
            setOrdenAleatorio(Boolean(cuestionarioAEditar.ordenAleatorio));
            setModoSeguro(Boolean(cuestionarioAEditar.modoSeguro));
            setLimiteAdvertencias(cuestionarioAEditar.limiteAdvertencias || 3);

            // Cargar configuración de disponibilidad y número de intentos
            const tieneFechas = Boolean(cuestionarioAEditar.fechaInicio || cuestionarioAEditar.fechaFin);
            setProgramarFechas(tieneFechas);
            setFechaInicio(formatDateTimeForInput(cuestionarioAEditar.fechaInicio));
            setFechaFin(formatDateTimeForInput(cuestionarioAEditar.fechaFin));
            setLimiteIntentos(cuestionarioAEditar.limiteIntentos !== undefined && cuestionarioAEditar.limiteIntentos !== null ? cuestionarioAEditar.limiteIntentos : 1);
            setTipoCalificacionIntentos(cuestionarioAEditar.tipoCalificacionIntentos || 'MEJOR_NOTA');
            setMostrarRetroalimentacion(cuestionarioAEditar.mostrarRetroalimentacion !== false);
            setGruposPermitidos(cuestionarioAEditar.gruposPermitidos || '');
            setExpandirConfiguracion(false);

            // Extraer materia si viene formateada como "[Materia] Descripción"
            const descOriginal = cuestionarioAEditar.descripcion || '';
            const matchMateria = descOriginal.match(/^\[(.*?)\]\s*(.*)$/);
            if (matchMateria) {
                setMateria(matchMateria[1]);
                setDescripcion(matchMateria[2]);
            } else {
                setMateria('Matemáticas');
                setDescripcion(descOriginal);
            }

            // Precargar preguntas con sus tipos y opciones
            if (cuestionarioAEditar.preguntas && cuestionarioAEditar.preguntas.length > 0) {
                const preguntasPrecargadas = cuestionarioAEditar.preguntas.map((p) => {
                    const tipoRaw = p.tipo || 'OPCION_MULTIPLE';
                    let tipoModal = 'Opción múltiple';
                    if (tipoRaw === 'VERDADERO_FALSO' || tipoRaw === 'Verdadero/Falso') {
                        tipoModal = 'Verdadero/Falso';
                    } else if (tipoRaw === 'RESPUESTA_CORTA' || tipoRaw === 'Respuesta escrita') {
                        tipoModal = 'Respuesta escrita';
                    }

                    let opcionesModal = [];
                    if (tipoModal === 'Verdadero/Falso') {
                        const opc = p.opciones || [];
                        const opcVerdadero = opc.find(o => (o.texto || o.textoOpcion || '').toLowerCase().includes('verdadero'));
                        const opcFalso = opc.find(o => (o.texto || o.textoOpcion || '').toLowerCase().includes('falso'));
                        opcionesModal = [
                            { id: opcVerdadero?.id, texto: 'Verdadero', correcta: opcVerdadero ? Boolean(opcVerdadero.correcta ?? opcVerdadero.esCorrecta) : true },
                            { id: opcFalso?.id, texto: 'Falso', correcta: opcFalso ? Boolean(opcFalso.correcta ?? opcFalso.esCorrecta) : false }
                        ];
                    } else if (tipoModal === 'Respuesta escrita') {
                        const opc = p.opciones || [];
                        opcionesModal = [
                            { id: opc[0]?.id, texto: opc[0]?.texto || opc[0]?.textoOpcion || '', correcta: true }
                        ];
                    } else {
                        opcionesModal = (p.opciones && p.opciones.length > 0)
                            ? p.opciones.map(o => ({
                                id: o.id,
                                texto: o.texto || o.textoOpcion || '',
                                correcta: Boolean(o.correcta ?? o.esCorrecta)
                            }))
                            : [
                                { texto: '', correcta: true },
                                { texto: '', correcta: false },
                                { texto: '', correcta: false },
                                { texto: '', correcta: false }
                            ];
                    }

                    return {
                        id: p.id,
                        enunciado: p.enunciado || p.textoPregunta || '',
                        tipo: tipoModal,
                        puntos: p.puntos !== undefined && p.puntos !== null ? p.puntos : 4.0,
                        imagenUrl: p.imagenUrl || p.imagen_url || '',
                        explicacion: p.explicacion || p.retroalimentacion || p.justificacion || '',
                        opciones: opcionesModal
                    };
                });
                setPreguntas(preguntasPrecargadas);
            } else {
                setPreguntas([
                    {
                        enunciado: '',
                        tipo: 'Opción múltiple',
                        puntos: 4.0,
                        imagenUrl: '',
                        explicacion: '',
                        opciones: [
                            { texto: '', correcta: true },
                            { texto: '', correcta: false },
                            { texto: '', correcta: false },
                            { texto: '', correcta: false }
                        ]
                    }
                ]);
            }
        } else {
            // Valores limpios por defecto para nuevo cuestionario
            setTitulo('');
            setMateria('Matemáticas');
            setDescripcion('');
            setTiempoLimiteMinutos(0);
            setOrdenAleatorio(false);
            setModoSeguro(false);
            setLimiteAdvertencias(3);
            setProgramarFechas(false);
            setFechaInicio('');
            setFechaFin('');
            setLimiteIntentos(1);
            setTipoCalificacionIntentos('MEJOR_NOTA');
            setMostrarRetroalimentacion(true);
            setGruposPermitidos('');
            setExpandirConfiguracion(false);
            setResumenImportacion(null);
            setPreguntasImportadasPendientes([]);
            setErrorImportacion('');
            setPreguntas([
                {
                    enunciado: '',
                    tipo: 'Opción múltiple',
                    puntos: 4.0,
                    imagenUrl: '',
                    explicacion: '',
                    opciones: [
                        { texto: '', correcta: true },
                        { texto: '', correcta: false },
                        { texto: '', correcta: false },
                        { texto: '', correcta: false }
                    ]
                }
            ]);
        }
        setError('');
    }, [isOpen, cuestionarioAEditar]);

    // Manejar selección y lectura de archivo para importar
    const handleProcesarArchivo = async (file) => {
        if (!file) return;
        try {
            setCargandoImportacion(true);
            setErrorImportacion('');
            setResumenImportacion(null);

            const resultado = await procesarArchivoPreguntas(file);
            setPreguntasImportadasPendientes(resultado.preguntas);
            setResumenImportacion({
                ...resultado.resumen,
                nombreArchivo: file.name
            });
        } catch (err) {
            console.error("Error al procesar archivo:", err);
            setErrorImportacion(err.message || "Error al procesar el archivo.");
        } finally {
            setCargandoImportacion(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleProcesarArchivo(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleProcesarArchivo(file);
        }
    };

    const aplicarPreguntasImportadas = (reemplazarExistentes) => {
        if (!preguntasImportadasPendientes || preguntasImportadasPendientes.length === 0) return;

        if (reemplazarExistentes) {
            setPreguntas(preguntasImportadasPendientes);
        } else {
            // Añadir al final ignorando la plantilla vacía si solo había una pregunta sin enunciado
            const preguntasValidasActuales = preguntas.filter(p => p.enunciado && p.enunciado.trim() !== '');
            setPreguntas([...preguntasValidasActuales, ...preguntasImportadasPendientes]);
        }

        // Cambiar a la pestaña manual para que el profesor vea y edite las preguntas importadas
        setTabActiva('manual');
    };

    if (!isOpen) return null;

    // Manejar cambio de tipo de pregunta y adaptar automáticamente las opciones
    const handleTipoPreguntaChange = (pIndex, nuevoTipo) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].tipo = nuevoTipo;

        if (nuevoTipo === 'Verdadero/Falso') {
            nuevasPreguntas[pIndex].opciones = [
                { texto: 'Verdadero', correcta: true },
                { texto: 'Falso', correcta: false }
            ];
        } else if (nuevoTipo === 'Respuesta escrita') {
            nuevasPreguntas[pIndex].opciones = [
                { texto: '', correcta: true }
            ];
        } else {
            // Opción múltiple por defecto (4 opciones)
            nuevasPreguntas[pIndex].opciones = [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ];
        }

        setPreguntas(nuevasPreguntas);
    };

    // Manejar cambios en el enunciado de las preguntas
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

    // Actualizar imagenUrl de una pregunta (por URL directa o Base64)
    const handleImagenChange = (pIndex, url) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].imagenUrl = url;
        setPreguntas(nuevasPreguntas);
    };

    // Subir imagen local convirtiéndola a Base64 dataURL
    const handleSubirImagenLocal = (pIndex, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, WEBP, GIF, SVG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5 MB de tamaño.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            handleImagenChange(pIndex, e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Manejar cambios en la explicación pedagógica de una pregunta
    const handleExplicacionChange = (index, value) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].explicacion = value;
        setPreguntas(nuevasPreguntas);
    };

    // Manejar cambio en el puntaje de una pregunta
    const handlePuntosPreguntaChange = (index, valor) => {
        const val = valor === '' ? '' : parseFloat(valor);
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].puntos = val;
        setPreguntas(nuevasPreguntas);
    };

    // Distribución equitativa de 20 puntos entre todas las preguntas del examen
    const distribuirPuntosEquitativamente = () => {
        if (!preguntas || preguntas.length === 0) return;
        const n = preguntas.length;
        const valorBase = Math.floor((20.0 / n) * 10) / 10;
        let acumulado = 0;
        const nuevas = preguntas.map((p, idx) => {
            if (idx === n - 1) {
                const resto = Math.round((20.0 - acumulado) * 10) / 10;
                return { ...p, puntos: Math.max(0.5, resto) };
            } else {
                acumulado += valorBase;
                return { ...p, puntos: valorBase };
            }
        });
        setPreguntas(nuevas);
    };

    // Suma total de puntos configurados en el cuestionario
    const sumaPuntos = preguntas.reduce((acc, p) => acc + (parseFloat(p.puntos) || 0), 0);
    const sumaPuntosRedondeada = Math.round(sumaPuntos * 10) / 10;

    // Funciones de integración con el Banco Centralizado de Preguntas
    const abrirModalBanco = async () => {
        setModalBancoAbierto(true);
        setCargandoBanco(true);
        setSeleccionadasBanco({});
        try {
            const data = await obtenerPreguntasBanco({
                materia: materia || null,
                dificultad: null,
                buscar: ''
            });
            setPreguntasBanco(data || []);
            setFiltroBancoMateria(materia || '');
            setFiltroBancoDificultad('TODAS');
            setBusquedaBanco('');
        } catch (err) {
            console.error("Error al cargar preguntas del banco:", err);
        } finally {
            setCargandoBanco(false);
        }
    };

    const recargarBanco = async (m, d, b) => {
        try {
            setCargandoBanco(true);
            const data = await obtenerPreguntasBanco({
                materia: m || null,
                dificultad: d === 'TODAS' ? null : d,
                buscar: b || null
            });
            setPreguntasBanco(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setCargandoBanco(false);
        }
    };

    const toggleSeleccionBanco = (id) => {
        setSeleccionadasBanco(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const aplicarPreguntasBanco = () => {
        const seleccionadas = preguntasBanco.filter(p => seleccionadasBanco[p.id]);
        if (seleccionadas.length === 0) return;

        const mapeadas = seleccionadas.map(b => {
            let tipoFormateado = 'Opción múltiple';
            if (b.tipo === 'VERDADERO_FALSO') tipoFormateado = 'Verdadero/Falso';
            else if (b.tipo === 'RESPUESTA_CORTA') tipoFormateado = 'Respuesta escrita';

            return {
                enunciado: b.enunciado || b.textoPregunta || '',
                tipo: tipoFormateado,
                puntos: b.puntos !== undefined && b.puntos !== null ? b.puntos : (b.puntosDefecto || 4.0),
                imagenUrl: b.imagenUrl || '',
                explicacion: b.explicacion || '',
                opciones: (b.opciones || []).map(o => ({
                    texto: o.texto || o.textoOpcion || '',
                    correcta: Boolean(o.correcta || o.esCorrecta)
                }))
            };
        });

        // Si la única pregunta existente estaba vacía, reemplazarla
        const preguntasValidas = preguntas.filter(p => p.enunciado && p.enunciado.trim() !== '');
        setPreguntas([...preguntasValidas, ...mapeadas]);
        setModalBancoAbierto(false);
    };

    const handleGuardarPreguntaEnBanco = async (pregunta, index) => {
        if (!pregunta.enunciado || !pregunta.enunciado.trim()) {
            alert('La pregunta debe tener un enunciado para guardarse en el banco.');
            return;
        }

        let tipoEnum = 'OPCION_MULTIPLE';
        let opcionesFormateadas = [];

        if (pregunta.tipo === 'Verdadero/Falso') {
            tipoEnum = 'VERDADERO_FALSO';
            opcionesFormateadas = (pregunta.opciones || []).map(o => ({
                texto: o.texto,
                correcta: Boolean(o.correcta)
            }));
        } else if (pregunta.tipo === 'Respuesta escrita') {
            tipoEnum = 'RESPUESTA_CORTA';
            opcionesFormateadas = (pregunta.opciones || []).map(o => ({
                texto: o.texto,
                correcta: true
            }));
        } else {
            tipoEnum = 'OPCION_MULTIPLE';
            opcionesFormateadas = (pregunta.opciones || []).map(o => ({
                texto: o.texto,
                correcta: Boolean(o.correcta)
            }));
        }

        const payload = {
            materia: materia || 'General',
            dificultad: 'MEDIA',
            tipo: tipoEnum,
            enunciado: pregunta.enunciado.trim(),
            puntos: parseFloat(pregunta.puntos) || 4.0,
            imagenUrl: pregunta.imagenUrl && pregunta.imagenUrl.trim() !== '' ? pregunta.imagenUrl.trim() : null,
            explicacion: pregunta.explicacion && pregunta.explicacion.trim() !== '' ? pregunta.explicacion.trim() : null,
            opciones: opcionesFormateadas
        };

        try {
            setGuardandoEnBancoIndex(index);
            await crearPreguntaBanco(payload);
            setMensajeBancoExito(`¡Pregunta #${index + 1} guardada exitosamente en el Banco!`);
            setTimeout(() => setMensajeBancoExito(''), 3500);
        } catch (err) {
            console.error('Error al guardar en el banco:', err);
            alert('No se pudo guardar la pregunta en el banco.');
        } finally {
            setGuardandoEnBancoIndex(null);
        }
    };

    // Añadir nueva pregunta
    const agregarPregunta = () => {
        setPreguntas([...preguntas, {
            enunciado: '',
            tipo: 'Opción múltiple',
            puntos: 4.0,
            imagenUrl: '',
            explicacion: '',
            opciones: [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]
        }]);
    };

    // Eliminar una pregunta
    const eliminarPregunta = (indexAEliminar) => {
        if (preguntas.length <= 1) return;
        setPreguntas(preguntas.filter((_, idx) => idx !== indexAEliminar));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setError('El título del cuestionario es obligatorio.');
            return;
        }

        if (programarFechas) {
            if (fechaInicio && fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
                setError('La fecha y hora de cierre debe ser posterior a la fecha y hora de apertura.');
                return;
            }
        }

        try {
            setLoading(true);
            setError('');

            const preguntasFormateadas = preguntas.map((p, index) => {
                let tipoEnum = 'OPCION_MULTIPLE';
                let opcionesFormateadas = [];

                if (p.tipo === 'Verdadero/Falso') {
                    tipoEnum = 'VERDADERO_FALSO';
                    opcionesFormateadas = [
                        { id: p.opciones[0]?.id || null, texto: 'Verdadero', correcta: Boolean(p.opciones[0]?.correcta) },
                        { id: p.opciones[1]?.id || null, texto: 'Falso', correcta: Boolean(p.opciones[1]?.correcta) }
                    ];
                } else if (p.tipo === 'Respuesta escrita') {
                    tipoEnum = 'RESPUESTA_CORTA';
                    const respuestaEsperada = p.opciones?.[0]?.texto || '';
                    opcionesFormateadas = [
                        { id: p.opciones?.[0]?.id || null, texto: respuestaEsperada.trim(), correcta: true }
                    ];
                } else {
                    tipoEnum = 'OPCION_MULTIPLE';
                    opcionesFormateadas = (p.opciones || []).map(o => ({
                        id: o.id || null,
                        texto: o.texto,
                        correcta: Boolean(o.correcta)
                    }));
                }

                return {
                    id: p.id || null,
                    enunciado: p.enunciado,
                    tipo: tipoEnum,
                    orden: index + 1,
                    puntos: p.puntos !== undefined && p.puntos !== null && !isNaN(p.puntos) ? parseFloat(p.puntos) : 4.0,
                    imagenUrl: p.imagenUrl && p.imagenUrl.trim() !== '' ? p.imagenUrl.trim() : null,
                    explicacion: p.explicacion && p.explicacion.trim() !== '' ? p.explicacion.trim() : null,
                    opciones: opcionesFormateadas
                };
            });

            const cuestionarioData = {
                titulo: titulo.trim(),
                descripcion: `[${materia}] ${descripcion.trim()}`,
                codigoAcceso: cuestionarioAEditar?.codigoAcceso,
                tiempoLimiteMinutos: parseInt(tiempoLimiteMinutos, 10) || 0,
                ordenAleatorio: Boolean(ordenAleatorio),
                modoSeguro: Boolean(modoSeguro),
                limiteAdvertencias: parseInt(limiteAdvertencias, 10) || 3,
                fechaInicio: programarFechas && fechaInicio ? (fechaInicio.length === 16 ? fechaInicio + ':00' : fechaInicio) : null,
                fechaFin: programarFechas && fechaFin ? (fechaFin.length === 16 ? fechaFin + ':00' : fechaFin) : null,
                limiteIntentos: parseInt(limiteIntentos, 10),
                tipoCalificacionIntentos: tipoCalificacionIntentos || 'MEJOR_NOTA',
                mostrarRetroalimentacion: Boolean(mostrarRetroalimentacion),
                gruposPermitidos: gruposPermitidos.trim() || null,
                preguntas: preguntasFormateadas
            };

            let resultadoCuestionario;
            if (esModoEdicion) {
                resultadoCuestionario = await actualizarCuestionario(cuestionarioAEditar.id, cuestionarioData);
            } else {
                resultadoCuestionario = await crearCuestionario(cuestionarioData);
            }

            // Notificar y cerrar
            if (onCuestionarioCreado) {
                onCuestionarioCreado(resultadoCuestionario);
            }
            onClose();
        } catch (err) {
            console.error('Error al guardar el cuestionario:', err);
            const msg = err.response?.data?.message || err.message || 'Hubo un error al guardar el cuestionario en la base de datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const esFormularioValido = titulo.trim().length > 0;

    return (
        <div 
            onClick={onClose}
            style={{
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
                padding: '20px',
                boxSizing: 'border-box',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
            }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '740px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                {/* ENCABEZADO DEL MODAL */}
                <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
                            {esModoEdicion ? 'Editar cuestionario' : 'Nuevo cuestionario'}
                        </h2>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {esModoEdicion
                                ? 'Modifica y actualiza las preguntas y configuración de tu examen'
                                : 'Crea y configura tu examen con preguntas personalizadas'}
                        </span>
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

                            {/* MATERIA Y TEMPORIZADOR */}
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
                                        <option value="Física">Física</option>
                                        <option value="Química">Química</option>
                                        <option value="Comunicación">Comunicación</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        ⏱️ LÍMITE DE TIEMPO (TEMPORIZADOR)
                                    </label>
                                    <select
                                        value={tiempoLimiteMinutos}
                                        onChange={(e) => setTiempoLimiteMinutos(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                            boxSizing: 'border-box',
                                            fontWeight: tiempoLimiteMinutos > 0 ? '600' : 'normal',
                                            color: tiempoLimiteMinutos > 0 ? '#1d4ed8' : '#0f172a'
                                        }}
                                    >
                                        <option value={0}>Sin límite de tiempo</option>
                                        <option value={5}>5 minutos (Evaluación rápida)</option>
                                        <option value={10}>10 minutos</option>
                                        <option value={15}>15 minutos</option>
                                        <option value={20}>20 minutos</option>
                                        <option value={30}>30 minutos</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={60}>60 minutos (1 hora)</option>
                                        <option value={90}>90 minutos (1h 30m)</option>
                                        <option value={120}>120 minutos (2 horas)</option>
                                    </select>
                                </div>
                            </div>

                            {/* SECCIÓN DESPLEGABLE: REGLAS Y CONFIGURACIÓN DEL EXAMEN */}
                            <div style={{
                                backgroundColor: expandirConfiguracion ? '#f8fafc' : '#ffffff',
                                border: expandirConfiguracion ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                transition: 'all 0.25s ease',
                                boxShadow: expandirConfiguracion ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none'
                            }}>
                                {/* CABECERA INTERACTIVA CLICABLE (DESPLEGABLE / ACCORDION) */}
                                <div
                                    onClick={() => setExpandirConfiguracion(!expandirConfiguracion)}
                                    role="button"
                                    aria-expanded={expandirConfiguracion}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 18px',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        backgroundColor: expandirConfiguracion ? '#f1f5f9' : '#ffffff',
                                        borderBottom: expandirConfiguracion ? '1px solid #e2e8f0' : 'none',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            backgroundColor: expandirConfiguracion ? '#dbeafe' : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background-color 0.2s ease'
                                        }}>
                                            <Sliders size={17} color={expandirConfiguracion ? '#2563eb' : '#475569'} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Reglas y Configuración del Examen
                                                </span>
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    backgroundColor: (ordenAleatorio || modoSeguro || programarFechas || limiteIntentos !== 1 || (gruposPermitidos && gruposPermitidos.trim())) ? '#dcfce7' : '#f1f5f9',
                                                    color: (ordenAleatorio || modoSeguro || programarFechas || limiteIntentos !== 1 || (gruposPermitidos && gruposPermitidos.trim())) ? '#15803d' : '#64748b',
                                                    border: '1px solid',
                                                    borderColor: (ordenAleatorio || modoSeguro || programarFechas || limiteIntentos !== 1 || (gruposPermitidos && gruposPermitidos.trim())) ? '#86efac' : '#e2e8f0'
                                                }}>
                                                    {[ordenAleatorio, modoSeguro, programarFechas, limiteIntentos !== 1, Boolean(gruposPermitidos && gruposPermitidos.trim())].filter(Boolean).length > 0
                                                        ? `${[ordenAleatorio, modoSeguro, programarFechas, limiteIntentos !== 1, Boolean(gruposPermitidos && gruposPermitidos.trim())].filter(Boolean).length} personalizada(s)`
                                                        : 'Predeterminadas'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                {expandirConfiguracion
                                                    ? 'Haz clic aquí para contraer las configuraciones'
                                                    : 'Aleatorio, Modo Seguro Anti-Copia, Intentos, Ventana de Fechas y Grupos'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>
                                            {expandirConfiguracion ? 'Contraer' : 'Desplegar opciones'}
                                        </span>
                                        <div style={{
                                            transform: expandirConfiguracion ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.25s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <ChevronDown size={18} color="#2563eb" />
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENIDO DEL DESPLEGABLE */}
                                {expandirConfiguracion && (
                                    <div style={{ padding: '16px' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: '10px'
                                        }}>
                                    {/* 1. PREGUNTAS EN ORDEN ALEATORIO */}
                                    <div
                                        onClick={() => setOrdenAleatorio(!ordenAleatorio)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            backgroundColor: ordenAleatorio ? '#eff6ff' : '#ffffff',
                                            border: ordenAleatorio ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                backgroundColor: ordenAleatorio ? '#dbeafe' : '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Shuffle size={17} color={ordenAleatorio ? '#1d4ed8' : '#64748b'} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: ordenAleatorio ? '#1e40af' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Preguntas aleatorias
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.2' }}>
                                                    Orden distinto por alumno
                                                </div>
                                            </div>
                                        </div>
                                        <ToggleSwitch
                                            checked={ordenAleatorio}
                                            onChange={setOrdenAleatorio}
                                            activeColor="#2563eb"
                                        />
                                    </div>

                                    {/* 2. RETROALIMENTACIÓN PEDAGÓGICA INMEDIATA */}
                                    <div
                                        onClick={() => setMostrarRetroalimentacion(!mostrarRetroalimentacion)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            backgroundColor: mostrarRetroalimentacion ? '#f0fdf4' : '#ffffff',
                                            border: mostrarRetroalimentacion ? '1px solid #86efac' : '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                backgroundColor: mostrarRetroalimentacion ? '#dcfce7' : '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Lightbulb size={17} color={mostrarRetroalimentacion ? '#15803d' : '#64748b'} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: mostrarRetroalimentacion ? '#166534' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Retroalimentación
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.2' }}>
                                                    Ver explicaciones al final
                                                </div>
                                            </div>
                                        </div>
                                        <ToggleSwitch
                                            checked={mostrarRetroalimentacion}
                                            onChange={setMostrarRetroalimentacion}
                                            activeColor="#16a34a"
                                        />
                                    </div>

                                    {/* 3. MODO SEGURO / DETECCIÓN DE CAMBIO DE PESTAÑA */}
                                    <div
                                        onClick={() => setModoSeguro(!modoSeguro)}
                                        style={{
                                            backgroundColor: modoSeguro ? '#fef2f2' : '#ffffff',
                                            border: modoSeguro ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '12px 14px',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '8px',
                                                    backgroundColor: modoSeguro ? '#fee2e2' : '#f1f5f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <ShieldAlert size={17} color={modoSeguro ? '#dc2626' : '#64748b'} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: modoSeguro ? '#991b1b' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        Modo seguro (Anti-copia)
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.2' }}>
                                                        Detecta cambio de pestaña
                                                    </div>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                checked={modoSeguro}
                                                onChange={setModoSeguro}
                                                activeColor="#dc2626"
                                            />
                                        </div>

                                        {modoSeguro && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    marginTop: '10px',
                                                    paddingTop: '8px',
                                                    borderTop: '1px dashed #fca5a5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px'
                                                }}
                                            >
                                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#7f1d1d' }}>
                                                    ⚠️ Tolerancia:
                                                </span>
                                                <select
                                                    value={limiteAdvertencias}
                                                    onChange={(e) => setLimiteAdvertencias(Number(e.target.value))}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #f87171',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#fff',
                                                        color: '#991b1b',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value={1}>1 advertencia (Estricto)</option>
                                                    <option value={2}>2 advertencias</option>
                                                    <option value={3}>3 advertencias (Recomendado)</option>
                                                    <option value={5}>5 advertencias (Flexible)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. LÍMITE DE INTENTOS */}
                                    <div style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxSizing: 'border-box'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#ede9fe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <RotateCcw size={17} color="#6d28d9" />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        Límite de intentos
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.2' }}>
                                                        Evaluación o práctica
                                                    </div>
                                                </div>
                                            </div>
                                            <select
                                                value={limiteIntentos}
                                                onChange={(e) => setLimiteIntentos(Number(e.target.value))}
                                                style={{
                                                    padding: '5px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: '#f8fafc',
                                                    color: '#1e293b',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    maxWidth: '120px'
                                                }}
                                            >
                                                <option value={1}>1 intento</option>
                                                <option value={2}>2 intentos</option>
                                                <option value={3}>3 intentos</option>
                                                <option value={5}>5 intentos</option>
                                                <option value={0}>Ilimitados</option>
                                            </select>
                                        </div>

                                        {limiteIntentos !== 1 && (
                                            <div style={{
                                                paddingTop: '6px',
                                                borderTop: '1px dashed #cbd5e1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px'
                                            }}>
                                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>
                                                    ⭐ Calificación:
                                                </span>
                                                <select
                                                    value={tipoCalificacionIntentos}
                                                    onChange={(e) => setTipoCalificacionIntentos(e.target.value)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#fff',
                                                        color: '#0f172a',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="MEJOR_NOTA">Nota más alta</option>
                                                    <option value="ULTIMO_INTENTO">Último intento</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* 5. PROGRAMAR FECHA Y HORA (VENTANA DE DISPONIBILIDAD) - OCUPA TODA LA FILA */}
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        backgroundColor: programarFechas ? '#f0fdf4' : '#ffffff',
                                        border: programarFechas ? '1px solid #86efac' : '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}>
                                        <div
                                            onClick={() => setProgramarFechas(!programarFechas)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '8px',
                                                    backgroundColor: programarFechas ? '#dcfce7' : '#f1f5f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Calendar size={17} color={programarFechas ? '#15803d' : '#64748b'} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: programarFechas ? '#166534' : '#1e293b' }}>
                                                        Programar fecha y hora de disponibilidad
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                        Ventana de tiempo para habilitar y cerrar el cuestionario automáticamente
                                                    </div>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                checked={programarFechas}
                                                onChange={setProgramarFechas}
                                                activeColor="#16a34a"
                                            />
                                        </div>

                                        {programarFechas && (
                                            <div style={{
                                                marginTop: '12px',
                                                paddingTop: '10px',
                                                borderTop: '1px dashed #86efac',
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                gap: '12px'
                                            }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#166534', marginBottom: '4px' }}>
                                                        🟢 FECHA Y HORA DE APERTURA:
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={fechaInicio}
                                                        onChange={(e) => setFechaInicio(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #86efac',
                                                            backgroundColor: '#fff',
                                                            fontSize: '12px',
                                                            outline: 'none',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '10px', color: '#15803d', marginTop: '2px', display: 'block' }}>
                                                        Bloqueado antes de esta hora.
                                                    </span>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#991b1b', marginBottom: '4px' }}>
                                                        🔴 FECHA Y HORA DE CIERRE:
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={fechaFin}
                                                        onChange={(e) => setFechaFin(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #fca5a5',
                                                            backgroundColor: '#fff',
                                                            fontSize: '12px',
                                                            outline: 'none',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '10px', color: '#b91c1c', marginTop: '2px', display: 'block' }}>
                                                        Cierre automático estricto.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 6. GRUPOS / SECCIONES ACADÉMICAS - OCUPA TODA LA FILA */}
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        boxSizing: 'border-box'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                backgroundColor: '#e0e7ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Users size={17} color="#4338ca" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                                    Grupos / Secciones Académicas (Opcional)
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    Separa por comas las aulas o secciones para filtrar y segmentar el registro de notas
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={gruposPermitidos}
                                            onChange={(e) => setGruposPermitidos(e.target.value)}
                                            placeholder="Ej. 5to A, 5to B, 5to C, Sección 1"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                backgroundColor: '#fff',
                                                fontSize: '13px',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                            💡 Los alumnos verán un selector para elegir su grupo/sección al iniciar el examen.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                            {/* DESCRIPCIÓN */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    DESCRIPCIÓN O INDICACIONES
                                </label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Breve descripción o indicaciones para el alumno..."
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

                            {/* PREGUNTAS */}
                            <div>
                                {/* NOTIFICACIÓN DE ÉXITO AL GUARDAR EN EL BANCO */}
                                {mensajeBancoExito && (
                                    <div style={{
                                        backgroundColor: '#dcfce7',
                                        border: '1px solid #86efac',
                                        color: '#15803d',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        marginBottom: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Check size={16} /> {mensajeBancoExito}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                                        Preguntas del examen ({preguntas.length})
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        Formatos: Opción Múltiple, V/F o Respuesta Escrita
                                    </span>
                                </div>

                                {/* BARRA DE PUNTOS PONDERADOS Y ACCESO AL BANCO CENTRALIZADO */}
                                <div style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ backgroundColor: sumaPuntosRedondeada === 20.0 ? '#dcfce7' : '#fef3c7', color: sumaPuntosRedondeada === 20.0 ? '#15803d' : '#b45309', padding: '7px', borderRadius: '8px' }}>
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                                                    Puntaje Total Ponderado:
                                                </span>
                                                <span style={{
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    color: sumaPuntosRedondeada === 20.0 ? '#15803d' : '#d97706',
                                                    backgroundColor: sumaPuntosRedondeada === 20.0 ? '#f0fdf4' : '#fffbeb',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${sumaPuntosRedondeada === 20.0 ? '#86efac' : '#fde68a'}`
                                                }}>
                                                    {sumaPuntosRedondeada.toFixed(1)} / 20.0 pts
                                                </span>
                                                {sumaPuntosRedondeada === 20.0 ? (
                                                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>✓ Balanceado exacto</span>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '500' }}>
                                                        (Cálculo normalizado automático sobre 20 pts)
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                Personaliza el peso de cada pregunta o distribuye los 20 puntos equitativamente.
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={distribuirPuntosEquitativamente}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '8px',
                                                padding: '7px 12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#334155',
                                                cursor: 'pointer'
                                            }}
                                            title="Dividir 20 puntos de manera equilibrada entre todas las preguntas"
                                        >
                                            <Sparkles size={14} color="#f59e0b" /> Distribuir 20 pts equitativamente
                                        </button>

                                        <button
                                            type="button"
                                            onClick={abrirModalBanco}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                backgroundColor: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                padding: '7px 12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#1d4ed8',
                                                cursor: 'pointer'
                                            }}
                                            title="Importar preguntas ya guardadas en el Banco Centralizado"
                                        >
                                            <BookOpen size={14} /> Importar del Banco de Preguntas
                                        </button>
                                    </div>
                                </div>

                                {preguntas.map((pregunta, pIndex) => (
                                    <div key={pIndex} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f8fafc',
                                        marginBottom: '16px',
                                        position: 'relative'
                                    }}>
                                        {/* Barra superior de la pregunta */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ backgroundColor: '#0f172a', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {pIndex + 1}
                                                </div>
                                                <select
                                                    value={pregunta.tipo}
                                                    onChange={(e) => handleTipoPreguntaChange(pIndex, e.target.value)}
                                                    style={{
                                                        padding: '7px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#fff',
                                                        color: '#0f172a',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="Opción múltiple">Opción múltiple</option>
                                                    <option value="Verdadero/Falso">Verdadero / Falso</option>
                                                    <option value="Respuesta escrita">Respuesta escrita</option>
                                                </select>

                                                {/* ASIGNACIÓN DE PUNTOS POR PREGUNTA */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px'
                                                }}>
                                                    <Award size={14} color="#047857" />
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Valor:</span>
                                                    <input
                                                        type="number"
                                                        min="0.5"
                                                        max="20"
                                                        step="0.5"
                                                        value={pregunta.puntos !== undefined && pregunta.puntos !== null ? pregunta.puntos : 4.0}
                                                        onChange={(e) => handlePuntosPreguntaChange(pIndex, e.target.value)}
                                                        style={{
                                                            width: '48px',
                                                            border: 'none',
                                                            outline: 'none',
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: '#047857',
                                                            textAlign: 'center',
                                                            background: 'transparent'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857' }}>pts</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {/* BOTÓN PARA GUARDAR EN EL BANCO */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleGuardarPreguntaEnBanco(pregunta, pIndex)}
                                                    disabled={guardandoEnBancoIndex === pIndex}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: '6px',
                                                        padding: '5px 10px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#334155',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Guardar una copia de esta pregunta en tu Banco Centralizado"
                                                >
                                                    <BookOpen size={13} color="#2563eb" />
                                                    {guardandoEnBancoIndex === pIndex ? 'Guardando...' : 'Guardar en Banco'}
                                                </button>

                                                {preguntas.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarPregunta(pIndex)}
                                                        title="Eliminar pregunta"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            borderRadius: '6px'
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* ENUNCIADO DE LA PREGUNTA */}
                                        <input
                                            type="text"
                                            value={pregunta.enunciado}
                                            onChange={(e) => handlePreguntaChange(pIndex, e.target.value)}
                                            placeholder={`Escribe el enunciado de la pregunta ${pIndex + 1}...`}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '14px',
                                                backgroundColor: '#fff',
                                                marginBottom: '10px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* SECCIÓN DE IMAGEN / DIAGRAMA DE LA PREGUNTA */}
                                        <div style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            marginBottom: '14px'
                                        }}>
                                            {pregunta.imagenUrl ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <ImageIcon size={14} /> Imagen o diagrama ilustrativo
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImagenChange(pIndex, '')}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <Trash2 size={13} /> Quitar imagen
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                                        <img
                                                            src={pregunta.imagenUrl}
                                                            alt="Vista previa"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                            style={{
                                                                maxHeight: '90px',
                                                                maxWidth: '150px',
                                                                objectFit: 'contain',
                                                                borderRadius: '4px',
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #e2e8f0'
                                                            }}
                                                        />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <input
                                                                type="text"
                                                                value={pregunta.imagenUrl.startsWith('data:') ? 'Imagen local cargada desde tu equipo' : pregunta.imagenUrl}
                                                                onChange={(e) => handleImagenChange(pIndex, e.target.value)}
                                                                readOnly={pregunta.imagenUrl.startsWith('data:')}
                                                                placeholder="URL de la imagen..."
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '6px 10px',
                                                                    fontSize: '12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #cbd5e1',
                                                                    outline: 'none',
                                                                    color: '#475569',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                                        <ImageIcon size={15} color="#94a3b8" />
                                                        <span>¿Adjuntar imagen, gráfico o diagrama a este enunciado?</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <label style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: '#2563eb',
                                                            backgroundColor: '#eff6ff',
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            border: '1px solid #bfdbfe'
                                                        }}>
                                                            📁 Subir imagen
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0];
                                                                    if (f) handleSubirImagenLocal(pIndex, f);
                                                                }}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url = prompt('Pega el enlace / URL web de la imagen (ej: https://...):');
                                                                if (url && url.trim()) {
                                                                    handleImagenChange(pIndex, url.trim());
                                                                }
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                color: '#475569',
                                                                backgroundColor: '#f1f5f9',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                border: '1px solid #cbd5e1'
                                                            }}
                                                        >
                                                            <Link2 size={13} /> Enlace URL
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* TIPO 1: OPCIÓN MÚLTIPLE */}
                                        {pregunta.tipo === 'Opción múltiple' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Marca el radio verde en la respuesta correcta:
                                                </span>
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
                                                                    border: opcion.correcta ? '1px solid #10b981' : '1px solid #cbd5e1',
                                                                    backgroundColor: opcion.correcta ? '#f0fdf4' : '#fff',
                                                                    fontSize: '13px',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* TIPO 2: VERDADERO / FALSO */}
                                        {pregunta.tipo === 'Verdadero/Falso' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Selecciona cuál es la respuesta correcta:
                                                </span>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div
                                                        onClick={() => handleSeleccionarCorrecta(pIndex, 0)}
                                                        style={{
                                                            border: pregunta.opciones[0]?.correcta ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            backgroundColor: pregunta.opciones[0]?.correcta ? '#f0fdf4' : '#ffffff',
                                                            borderRadius: '10px',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`vf_${pIndex}`}
                                                                checked={Boolean(pregunta.opciones[0]?.correcta)}
                                                                onChange={() => handleSeleccionarCorrecta(pIndex, 0)}
                                                                style={{ cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Verdadero</span>
                                                        </div>
                                                        {pregunta.opciones[0]?.correcta && (
                                                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                                Correcta
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        onClick={() => handleSeleccionarCorrecta(pIndex, 1)}
                                                        style={{
                                                            border: pregunta.opciones[1]?.correcta ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            backgroundColor: pregunta.opciones[1]?.correcta ? '#f0fdf4' : '#ffffff',
                                                            borderRadius: '10px',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`vf_${pIndex}`}
                                                                checked={Boolean(pregunta.opciones[1]?.correcta)}
                                                                onChange={() => handleSeleccionarCorrecta(pIndex, 1)}
                                                                style={{ cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Falso</span>
                                                        </div>
                                                        {pregunta.opciones[1]?.correcta && (
                                                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                                Correcta
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TIPO 3: RESPUESTA ESCRITA */}
                                        {pregunta.tipo === 'Respuesta escrita' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Type size={15} color="#3b82f6" />
                                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                                                        PAUTA O CRITERIOS DE CALIFICACIÓN (OPCIONAL)
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={pregunta.opciones[0]?.texto || ''}
                                                    onChange={(e) => handleOpcionChange(pIndex, 0, e.target.value)}
                                                    placeholder="Ej: Criterios clave: justificación clara, conceptos principales..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        backgroundColor: '#ffffff',
                                                        fontSize: '13px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#1e40af', lineHeight: '1.4' }}>
                                                    ℹ️ <strong>Revisión manual por el profesor:</strong> El alumno escribirá su respuesta en un campo de texto libre. La calificación no se asigna de forma automática, sino que podrás leer la respuesta del alumno y asignarle su nota correspondiente.
                                                </div>
                                            </div>
                                        )}

                                        {/* EXPLICACIÓN PEDAGÓGICA DE LA PREGUNTA */}
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '12px 14px',
                                            backgroundColor: '#fffbeb',
                                            border: '1px solid #fef3c7',
                                            borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <Lightbulb size={16} color="#d97706" />
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                    Explicación pedagógica / Justificación de la respuesta (Opcional)
                                                </label>
                                            </div>
                                            <textarea
                                                value={pregunta.explicacion || ''}
                                                onChange={(e) => handleExplicacionChange(pIndex, e.target.value)}
                                                rows={2}
                                                placeholder="Explica el razonamiento pedagógico, pasos de solución o conceptos clave para que el alumno aprenda al terminar..."
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #fde68a',
                                                    fontSize: '13px',
                                                    color: '#1e293b',
                                                    backgroundColor: '#ffffff',
                                                    boxSizing: 'border-box',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                            <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px' }}>
                                                💡 Esta explicación se mostrará inmediatamente al alumno al enviar su evaluación para enriquecer su proceso formativo.
                                            </div>
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
                                    <Plus size={18} /> Añadir otra pregunta
                                </button>
                            </div>
                        </>
                    ) : (
                        /* PESTAÑA IMPORTAR ARCHIVO */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            {/* ZONA DE ARRASTRE Y SELECCIÓN */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                                onDragLeave={() => setArrastrando(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                style={{
                                    border: arrastrando ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                                    borderRadius: '14px',
                                    padding: '36px 20px',
                                    textAlign: 'center',
                                    backgroundColor: arrastrando ? '#eff6ff' : '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: arrastrando ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
                                }}
                            >
                                <UploadCloud size={44} color={arrastrando ? '#2563eb' : '#3b82f6'} style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                                    {cargandoImportacion ? 'Leyendo y validando archivo...' : 'Arrastra tu archivo aquí o haz clic para seleccionarlo'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                                    Formatos compatibles: Libros de Excel (.xlsx, .xls) o archivos CSV (.csv)
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#1d4ed8',
                                    backgroundColor: '#dbeafe',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    📁 Seleccionar desde mi dispositivo
                                </span>
                            </div>

                            {/* ALERTA DE ERROR EN IMPORTACIÓN */}
                            {errorImportacion && (
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#991b1b',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <AlertCircle size={20} color="#dc2626" />
                                    <span>{errorImportacion}</span>
                                </div>
                            )}

                            {/* RESULTADO Y CONFIRMACIÓN DE IMPORTACIÓN */}
                            {resumenImportacion && (
                                <div style={{
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '12px',
                                    padding: '18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '700', fontSize: '14px' }}>
                                        <CheckCircle2 size={20} color="#16a34a" />
                                        <span>¡Se procesaron {resumenImportacion.total} preguntas de "{resumenImportacion.nombreArchivo}"!</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            🔘 {resumenImportacion.multiples} Opción múltiple
                                        </span>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            ⚖️ {resumenImportacion.verdaderoFalso} Verdadero/Falso
                                        </span>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            ✍️ {resumenImportacion.escritas} Respuesta escrita
                                        </span>
                                        {resumenImportacion.conImagenes > 0 && (
                                            <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                                🖼️ {resumenImportacion.conImagenes} con imagen
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => aplicarPreguntasImportadas(true)}
                                            style={{
                                                backgroundColor: '#16a34a',
                                                color: '#ffffff',
                                                border: 'none',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <CheckSquare size={16} /> Reemplazar preguntas ({resumenImportacion.total})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => aplicarPreguntasImportadas(false)}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                color: '#16a34a',
                                                border: '1px solid #16a34a',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Plus size={16} /> Añadir a las existentes (+{resumenImportacion.total})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* BOTÓN DESCARGAR PLANTILLA EXCEL */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={descargarPlantillaExcel}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#334155',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Download size={16} color="#059669" /> Descargar plantilla de ejemplo (.xlsx)
                                </button>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Incluye ejemplos y hoja de instrucciones
                                </span>
                            </div>

                            {/* GUÍA DE COLUMNAS */}
                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                <strong style={{ color: '#0f172a' }}>Columnas de la plantilla Excel:</strong>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <li><strong>Columna A (Tipo):</strong> <code>multiple</code>, <code>truefalse</code>, o <code>short</code>.</li>
                                    <li><strong>Columna B (Pregunta):</strong> Texto del enunciado.</li>
                                    <li><strong>Columnas C a F:</strong> Alternativas (A, B, C, D) para opción múltiple.</li>
                                    <li><strong>Columna G (Respuesta correcta):</strong> Letra (A, B, C, D), texto de la opción o "Verdadero"/"Falso".</li>
                                    <li><strong>Columna H (URL Imagen - Opcional):</strong> Enlace web directo (https://...) a foto, gráfico o diagrama ilustrativo.</li>
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

            {/* MODAL PARA IMPORTAR PREGUNTAS DESDE EL BANCO CENTRALIZADO */}
            {modalBancoAbierto && (
                <div 
                    onClick={() => setModalBancoAbierto(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10001,
                        backdropFilter: 'blur(3px)',
                        padding: '20px'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '820px',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* HEADER MODAL BANCO */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '8px' }}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                        Importar Preguntas desde el Banco Centralizado
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                                        Selecciona las preguntas que deseas agregar a este examen.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalBancoAbierto(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FILTROS DE BÚSQUEDA DEL BANCO */}
                        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: '1 1 200px', position: 'relative' }}>
                                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar en el banco..."
                                    value={busquedaBanco}
                                    onChange={(e) => setBusquedaBanco(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            recargarBanco(filtroBancoMateria, filtroBancoDificultad, busquedaBanco);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <select
                                value={filtroBancoMateria}
                                onChange={(e) => {
                                    setFiltroBancoMateria(e.target.value);
                                    recargarBanco(e.target.value, filtroBancoDificultad, busquedaBanco);
                                }}
                                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                            >
                                <option value="">Todas las materias</option>
                                <option value="Matemáticas">Matemáticas</option>
                                <option value="Informática">Informática</option>
                                <option value="Historia">Historia</option>
                                <option value="Ciencias">Ciencias</option>
                                <option value="Literatura">Literatura</option>
                                <option value="General">General</option>
                            </select>

                            <select
                                value={filtroBancoDificultad}
                                onChange={(e) => {
                                    setFiltroBancoDificultad(e.target.value);
                                    recargarBanco(filtroBancoMateria, e.target.value, busquedaBanco);
                                }}
                                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                            >
                                <option value="TODAS">Todas las dificultades</option>
                                <option value="FACIL">🟢 Fácil</option>
                                <option value="MEDIA">🟡 Media</option>
                                <option value="DIFICIL">🔴 Difícil</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => recargarBanco(filtroBancoMateria, filtroBancoDificultad, busquedaBanco)}
                                style={{ padding: '7px 14px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Filtrar
                            </button>
                        </div>

                        {/* LISTA DE PREGUNTAS DEL BANCO */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cargandoBanco ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
                                    Cargando preguntas disponibles en el banco...
                                </div>
                            ) : preguntasBanco.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                    <BookOpen size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                        No hay preguntas que coincidan con los filtros seleccionados
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                        Intenta cambiando la materia o el nivel de dificultad.
                                    </div>
                                </div>
                            ) : (
                                preguntasBanco.map((b) => {
                                    const seleccionada = Boolean(seleccionadasBanco[b.id]);
                                    const puntosVal = b.puntos !== undefined && b.puntos !== null ? b.puntos : (b.puntosDefecto || 4.0);

                                    return (
                                        <div
                                            key={b.id}
                                            onClick={() => toggleSeleccionBanco(b.id)}
                                            style={{
                                                backgroundColor: seleccionada ? '#f0fdf4' : '#ffffff',
                                                border: `2px solid ${seleccionada ? '#10b981' : '#e2e8f0'}`,
                                                borderRadius: '10px',
                                                padding: '14px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'flex-start',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={seleccionada}
                                                onChange={() => {}} // handled by div onClick
                                                style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '10px' }}>
                                                        {b.materia || 'General'}
                                                    </span>
                                                    {b.dificultad === 'FACIL' && (
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                            🟢 Fácil
                                                        </span>
                                                    )}
                                                    {b.dificultad === 'MEDIA' && (
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>
                                                            🟡 Media
                                                        </span>
                                                    )}
                                                    {b.dificultad === 'DIFICIL' && (
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
                                                            🔴 Difícil
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                                                        {puntosVal.toFixed(1)} pts
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>
                                                    {b.enunciado || b.textoPregunta}
                                                </div>
                                                {b.opciones && b.opciones.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                        {b.opciones.map((op, oIdx) => {
                                                            const esCorr = Boolean(op.correcta || op.esCorrecta);
                                                            return (
                                                                <span
                                                                    key={oIdx}
                                                                    style={{
                                                                        fontSize: '11px',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '4px',
                                                                        background: esCorr ? '#dcfce7' : '#f1f5f9',
                                                                        color: esCorr ? '#15803d' : '#475569',
                                                                        fontWeight: esCorr ? '700' : '500'
                                                                    }}
                                                                >
                                                                    {esCorr ? '✓ ' : ''}{op.texto || op.textoOpcion}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* FOOTER MODAL BANCO */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                {Object.values(seleccionadasBanco).filter(Boolean).length} preguntas seleccionadas
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalBancoAbierto(false)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    onClick={aplicarPreguntasBanco}
                                    disabled={Object.values(seleccionadasBanco).filter(Boolean).length === 0}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: Object.values(seleccionadasBanco).filter(Boolean).length > 0 ? '#10b981' : '#94a3b8',
                                        color: '#ffffff',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: Object.values(seleccionadasBanco).filter(Boolean).length > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Importar seleccionadas ({Object.values(seleccionadasBanco).filter(Boolean).length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}