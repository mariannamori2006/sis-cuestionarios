import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import {
    BarChart3,
    PieChart as PieIcon,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    Layers,
    BookOpen,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Search
} from 'lucide-react';

ChartJS.register(...registerables);

// Materias y colores predeterminados de la institución
const COLORES_MATERIA = {
    'Matemáticas': '#3b82f6',
    'Historia': '#f59e0b',
    'Biología': '#10b981',
    'Informática': '#8b5cf6',
    'Física': '#6366f1',
    'Química': '#ea580c',
    'Comunicación': '#ec4899',
    'General': '#0ea5e9'
};

const getColorPorMateria = (materia) => {
    if (!materia) return '#64748b';
    for (const [key, color] of Object.entries(COLORES_MATERIA)) {
        if (materia.toLowerCase().includes(key.toLowerCase())) {
            return color;
        }
    }
    return '#64748b';
};

export default function GraficasRendimientoAvanzadas({
    rendimientoMaterias = [],
    rendimientoPreguntas = [],
    cuestionarios = [],
    tituloModulo = "Gráficas Avanzadas de Rendimiento"
}) {
    // Filtros interactivos
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('TODAS');
    const [cuestionarioSeleccionado, setCuestionarioSeleccionado] = useState('TODOS');
    const [pestañaActiva, setPestañaActiva] = useState('todas'); // 'todas', 'materias', 'preguntas'
    const [tipoGraficoCircular, setTipoGraficoCircular] = useState('dona'); // 'dona', 'pie'
    const [busquedaPregunta, setBusquedaPregunta] = useState('');

    // Referencias a los lienzos (Canvas) de Chart.js
    const canvasBarMateriasRef = useRef(null);
    const chartBarMateriasInstance = useRef(null);

    const canvasPieMateriasRef = useRef(null);
    const chartPieMateriasInstance = useRef(null);

    const canvasBarPreguntasRef = useRef(null);
    const chartBarPreguntasInstance = useRef(null);

    const canvasPiePreguntasRef = useRef(null);
    const chartPiePreguntasInstance = useRef(null);

    // Lista de materias únicas disponibles
    const listaMateriasDisponibles = useMemo(() => {
        const set = new Set();
        rendimientoMaterias.forEach(m => m.materia && set.add(m.materia));
        rendimientoPreguntas.forEach(p => p.materia && set.add(p.materia));
        cuestionarios.forEach(c => c.materia && set.add(c.materia));
        return Array.from(set);
    }, [rendimientoMaterias, rendimientoPreguntas, cuestionarios]);

    // Lista de cuestionarios filtrados por la materia seleccionada
    const listaCuestionariosFiltrados = useMemo(() => {
        if (materiaSeleccionada === 'TODAS') {
            return cuestionarios;
        }
        return cuestionarios.filter(c => (c.materia || '').toLowerCase() === materiaSeleccionada.toLowerCase());
    }, [cuestionarios, materiaSeleccionada]);

    // Preguntas filtradas por materia, cuestionario y búsqueda
    const preguntasFiltradas = useMemo(() => {
        return rendimientoPreguntas.filter(p => {
            const matchMateria = materiaSeleccionada === 'TODAS' ||
                (p.materia || '').toLowerCase() === materiaSeleccionada.toLowerCase();
            const matchCuestionario = cuestionarioSeleccionado === 'TODOS' ||
                p.cuestionarioId === cuestionarioSeleccionado ||
                (p.cuestionarioTitulo || '').toLowerCase() === cuestionarioSeleccionado.toLowerCase();
            const matchBusqueda = !busquedaPregunta.trim() ||
                (p.enunciado || '').toLowerCase().includes(busquedaPregunta.toLowerCase()) ||
                (p.cuestionarioTitulo || '').toLowerCase().includes(busquedaPregunta.toLowerCase());

            return matchMateria && matchCuestionario && matchBusqueda;
        });
    }, [rendimientoPreguntas, materiaSeleccionada, cuestionarioSeleccionado, busquedaPregunta]);

    // Materias filtradas
    const materiasFiltradas = useMemo(() => {
        if (materiaSeleccionada === 'TODAS') {
            return rendimientoMaterias;
        }
        return rendimientoMaterias.filter(m => (m.materia || '').toLowerCase() === materiaSeleccionada.toLowerCase());
    }, [rendimientoMaterias, materiaSeleccionada]);

    // Resumen de KPIs
    const kpis = useMemo(() => {
        let totalResp = 0;
        let totalCorrectas = 0;

        rendimientoMaterias.forEach(m => {
            totalResp += m.totalRespuestas || 0;
            totalCorrectas += m.respuestasCorrectas || 0;
        });

        const tasaGlobal = totalResp > 0 ? Math.round((totalCorrectas / totalResp) * 1000) / 10 : 0.0;

        // Materia con mayor y menor acierto
        const materiasConDatos = [...rendimientoMaterias].filter(m => (m.totalRespuestas || 0) > 0);
        materiasConDatos.sort((a, b) => (b.tasaAciertos || 0) - (a.tasaAciertos || 0));

        const mejorMateria = materiasConDatos.length > 0 ? materiasConDatos[0] : null;
        const materiaOportunidad = materiasConDatos.length > 1 ? materiasConDatos[materiasConDatos.length - 1] : null;

        // Pregunta más desafiante (con respuestas y menor tasa)
        const preguntasConResp = [...rendimientoPreguntas].filter(p => (p.totalRespuestas || 0) > 0);
        preguntasConResp.sort((a, b) => (a.tasaAciertos || 0) - (b.tasaAciertos || 0));
        const preguntaDificil = preguntasConResp.length > 0 ? preguntasConResp[0] : null;

        return {
            tasaGlobal,
            totalResp,
            totalCorrectas,
            mejorMateria,
            materiaOportunidad,
            preguntaDificil
        };
    }, [rendimientoMaterias, rendimientoPreguntas]);

    // -------------------------------------------------------------
    // GRÁFICO 1: Barras de Tasa de Aciertos por Materia
    // -------------------------------------------------------------
    useEffect(() => {
        if (!canvasBarMateriasRef.current) return;

        const chartExistente = ChartJS.getChart(canvasBarMateriasRef.current);
        if (chartExistente) {
            chartExistente.destroy();
        }

        const etiquetas = materiasFiltradas.map(m => m.materia || 'General');
        const datos = materiasFiltradas.map(m => m.tasaAciertos || 0);
        const colores = materiasFiltradas.map(m => m.color || getColorPorMateria(m.materia));

        const ctx = canvasBarMateriasRef.current.getContext('2d');
        chartBarMateriasInstance.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Tasa de Aciertos (%)',
                    data: datos,
                    backgroundColor: colores.map(c => c + 'cc'),
                    borderColor: colores,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const item = materiasFiltradas[index];
                                const tasa = context.raw;
                                const correctas = item?.respuestasCorrectas || 0;
                                const total = item?.totalRespuestas || 0;
                                const prom = item?.promedioNota != null ? `${item.promedioNota.toFixed(1)}/20` : '—';
                                return [
                                    `Tasa de aciertos: ${tasa}%`,
                                    `Aciertos: ${correctas} de ${total} preguntas`,
                                    `Promedio de notas: ${prom}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`,
                            color: '#64748b',
                            font: { size: 11, family: 'Segoe UI' }
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#334155',
                            font: { size: 12, weight: '600', family: 'Segoe UI' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        return () => {
            if (canvasBarMateriasRef.current) {
                const c = ChartJS.getChart(canvasBarMateriasRef.current);
                if (c) c.destroy();
            }
        };
    }, [materiasFiltradas]);

    // -------------------------------------------------------------
    // GRÁFICO 2: Circular (Dona / Pie) de Aciertos por Materia
    // -------------------------------------------------------------
    useEffect(() => {
        if (!canvasPieMateriasRef.current) return;

        const chartExistente = ChartJS.getChart(canvasPieMateriasRef.current);
        if (chartExistente) {
            chartExistente.destroy();
        }

        const etiquetas = materiasFiltradas.map(m => m.materia || 'General');
        const datos = materiasFiltradas.map(m => m.respuestasCorrectas || m.tasaAciertos || 1);
        const colores = materiasFiltradas.map(m => m.color || getColorPorMateria(m.materia));

        const ctx = canvasPieMateriasRef.current.getContext('2d');
        chartPieMateriasInstance.current = new ChartJS(ctx, {
            type: tipoGraficoCircular === 'dona' ? 'doughnut' : 'pie',
            data: {
                labels: etiquetas,
                datasets: [{
                    data: datos,
                    backgroundColor: colores,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: tipoGraficoCircular === 'dona' ? '65%' : 0,
                animation: {
                    animateRotate: true,
                    duration: 900
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            borderRadius: 3,
                            useBorderRadius: true,
                            font: { size: 11, family: 'Segoe UI', weight: '500' },
                            color: '#475569',
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const item = materiasFiltradas[index];
                                const tasa = item?.tasaAciertos || 0;
                                const correctas = item?.respuestasCorrectas || 0;
                                return `${context.label}: ${tasa}% aciertos (${correctas} aciertos directos)`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (canvasPieMateriasRef.current) {
                const c = ChartJS.getChart(canvasPieMateriasRef.current);
                if (c) c.destroy();
            }
        };
    }, [materiasFiltradas, tipoGraficoCircular]);

    // -------------------------------------------------------------
    // GRÁFICO 3: Barras de Tasa de Aciertos por Pregunta
    // -------------------------------------------------------------
    useEffect(() => {
        if (!canvasBarPreguntasRef.current) return;

        const chartExistente = ChartJS.getChart(canvasBarPreguntasRef.current);
        if (chartExistente) {
            chartExistente.destroy();
        }

        // Limitar a máximo 20 preguntas para visualización limpia
        const preguntasMuestra = preguntasFiltradas.slice(0, 20);

        const etiquetas = preguntasMuestra.map((p, idx) => {
            const num = p.orden != null ? `P${p.orden}` : `P${idx + 1}`;
            return num;
        });

        const datos = preguntasMuestra.map(p => p.tasaAciertos || 0);

        // Colores según nivel de efectividad:
        // >= 75%: Verde (Alta efectividad / Fácil)
        // 50% - 74%: Ámbar (Efectividad media)
        // < 50%: Rojo (Pregunta difícil / Requiere refuerzo)
        const colores = preguntasMuestra.map(p => {
            const tasa = p.tasaAciertos || 0;
            if (tasa >= 75) return '#10b981';
            if (tasa >= 50) return '#f59e0b';
            return '#ef4444';
        });

        const ctx = canvasBarPreguntasRef.current.getContext('2d');
        chartBarPreguntasInstance.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Tasa de Aciertos (%)',
                    data: datos,
                    backgroundColor: colores.map(c => c + 'd9'),
                    borderColor: colores,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.65
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: function (context) {
                                const idx = context[0].dataIndex;
                                const item = preguntasMuestra[idx];
                                return `Pregunta #${item.orden || idx + 1}: ${item.enunciado || 'Sin enunciado'}`;
                            },
                            label: function (context) {
                                const idx = context.dataIndex;
                                const item = preguntasMuestra[idx];
                                const tasa = item.tasaAciertos || 0;
                                const correctas = item.respuestasCorrectas || 0;
                                const total = item.totalRespuestas || 0;
                                const dif = item.dificultad || (tasa >= 75 ? 'Baja' : tasa >= 50 ? 'Media' : 'Alta');

                                return [
                                    `Tasa de aciertos: ${tasa}%`,
                                    `Aciertos: ${correctas} / ${total} alumnos`,
                                    `Cuestionario: ${item.cuestionarioTitulo || '—'} (${item.materia || 'General'})`,
                                    `Dificultad evaluada: ${dif}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`,
                            color: '#64748b',
                            font: { size: 11, family: 'Segoe UI' }
                        },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        ticks: {
                            color: '#334155',
                            font: { size: 12, weight: '600', family: 'Segoe UI' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });

        return () => {
            if (canvasBarPreguntasRef.current) {
                const c = ChartJS.getChart(canvasBarPreguntasRef.current);
                if (c) c.destroy();
            }
        };
    }, [preguntasFiltradas]);

    // -------------------------------------------------------------
    // GRÁFICO 4: Circular de Dificultad y Efectividad por Pregunta
    // -------------------------------------------------------------
    useEffect(() => {
        if (!canvasPiePreguntasRef.current) return;

        const chartExistente = ChartJS.getChart(canvasPiePreguntasRef.current);
        if (chartExistente) {
            chartExistente.destroy();
        }

        let faciles = 0;
        let medias = 0;
        let dificiles = 0;

        preguntasFiltradas.forEach(p => {
            const tasa = p.tasaAciertos || 0;
            if (tasa >= 75) faciles++;
            else if (tasa >= 50) medias++;
            else dificiles++;
        });

        const total = faciles + medias + dificiles;
        const datos = total > 0 ? [faciles, medias, dificiles] : [1, 0, 0];
        const etiquetas = ['Alta Efectividad (≥75%)', 'Efectividad Media (50–74%)', 'Preguntas Críticas (<50%)'];
        const colores = ['#10b981', '#f59e0b', '#ef4444'];

        const ctx = canvasPiePreguntasRef.current.getContext('2d');
        chartPiePreguntasInstance.current = new ChartJS(ctx, {
            type: tipoGraficoCircular === 'dona' ? 'doughnut' : 'pie',
            data: {
                labels: etiquetas,
                datasets: [{
                    data: datos,
                    backgroundColor: colores,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: tipoGraficoCircular === 'dona' ? '65%' : 0,
                animation: {
                    animateRotate: true,
                    duration: 900
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            borderRadius: 3,
                            useBorderRadius: true,
                            font: { size: 11, family: 'Segoe UI', weight: '500' },
                            color: '#475569',
                            padding: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const val = context.raw || 0;
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return `${context.label}: ${val} preguntas (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (canvasPiePreguntasRef.current) {
                const c = ChartJS.getChart(canvasPiePreguntasRef.current);
                if (c) c.destroy();
            }
        };
    }, [preguntasFiltradas, tipoGraficoCircular]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* BARRA SUPERIOR DE FILTROS Y CONTROLES */}
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                {/* SELECTORES DE FILTRO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>
                        <Filter size={16} color="#2563eb" />
                        <span>Filtrar por:</span>
                    </div>

                    {/* SELECTOR MATERIA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                            value={materiaSeleccionada}
                            onChange={(e) => {
                                setMateriaSeleccionada(e.target.value);
                                setCuestionarioSeleccionado('TODOS');
                            }}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '13px',
                                fontWeight: '600',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="TODAS">📚 Todas las Materias</option>
                            {listaMateriasDisponibles.map(mat => (
                                <option key={mat} value={mat}>{mat}</option>
                            ))}
                        </select>
                    </div>

                    {/* SELECTOR CUESTIONARIO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                            value={cuestionarioSeleccionado}
                            onChange={(e) => setCuestionarioSeleccionado(e.target.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '13px',
                                fontWeight: '500',
                                outline: 'none',
                                cursor: 'pointer',
                                maxWidth: '280px'
                            }}
                        >
                            <option value="TODOS">📋 Todos los Cuestionarios</option>
                            {listaCuestionariosFiltrados.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.titulo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* BOTONES DE VISTA (PESTAÑAS) Y TIPO DE GRÁFICO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Botones de alternancia de pestañas */}
                    <div style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        padding: '3px',
                        borderRadius: '10px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setPestañaActiva('todas')}
                            style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: pestañaActiva === 'todas' ? '#ffffff' : 'transparent',
                                color: pestañaActiva === 'todas' ? '#0f172a' : '#64748b',
                                boxShadow: pestañaActiva === 'todas' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Vista General
                        </button>
                        <button
                            type="button"
                            onClick={() => setPestañaActiva('materias')}
                            style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: pestañaActiva === 'materias' ? '#ffffff' : 'transparent',
                                color: pestañaActiva === 'materias' ? '#0f172a' : '#64748b',
                                boxShadow: pestañaActiva === 'materias' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Por Materia
                        </button>
                        <button
                            type="button"
                            onClick={() => setPestañaActiva('preguntas')}
                            style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: pestañaActiva === 'preguntas' ? '#ffffff' : 'transparent',
                                color: pestañaActiva === 'preguntas' ? '#0f172a' : '#64748b',
                                boxShadow: pestañaActiva === 'preguntas' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Por Pregunta
                        </button>
                    </div>

                    {/* Alternar formato circular: Dona o Pastel */}
                    <button
                        type="button"
                        onClick={() => setTipoGraficoCircular(prev => prev === 'dona' ? 'pie' : 'dona')}
                        title={`Cambiar a gráfico de ${tipoGraficoCircular === 'dona' ? 'pastel (pie)' : 'dona (doughnut)'}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '7px 12px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <PieIcon size={14} color="#7c3aed" />
                        <span>{tipoGraficoCircular === 'dona' ? 'Dona' : 'Pastel'}</span>
                    </button>
                </div>
            </div>

            {/* TARJETAS DE INSIGHTS / KPIs CLAVE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                {/* 1. TASA GLOBAL DE ACIERTOS */}
                <div style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Tasa Global de Aciertos
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} color="#10b981" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                            {kpis.tasaGlobal}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                            <CheckCircle2 size={13} />
                            <span>{kpis.totalCorrectas} respuestas correctas</span>
                        </div>
                    </div>
                </div>

                {/* 2. MATERIA CON MEJOR RENDIMIENTO */}
                <div style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Materia Líder
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={16} color="#2563eb" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {kpis.mejorMateria?.materia || 'Por evaluar'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '6px', fontWeight: '600' }}>
                            {kpis.mejorMateria ? `${kpis.mejorMateria.tasaAciertos}% de efectividad` : 'Sin datos suficientes'}
                        </div>
                    </div>
                </div>

                {/* 3. MATERIA DE OPORTUNIDAD (REFUERZO) */}
                <div style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Requiere Refuerzo
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={16} color="#d97706" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {kpis.materiaOportunidad?.materia || 'Ninguna rezagada'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', marginTop: '6px', fontWeight: '600' }}>
                            {kpis.materiaOportunidad ? `${kpis.materiaOportunidad.tasaAciertos}% de aciertos` : 'Rendimiento equilibrado'}
                        </div>
                    </div>
                </div>

                {/* 4. PREGUNTA MÁS DESAFIANTE */}
                <div style={{
                    background: '#ffffff',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Pregunta Más Difícil
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HelpCircle size={16} color="#ef4444" />
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#0f172a',
                            lineHeight: '1.3',
                            maxHeight: '34px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {kpis.preguntaDificil ? `${kpis.preguntaDificil.enunciado}` : 'Sin datos'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', fontWeight: '600' }}>
                            {kpis.preguntaDificil ? `Acierto: ${kpis.preguntaDificil.tasaAciertos}% (${kpis.preguntaDificil.materia})` : 'Excelente comprensión'}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: GRÁFICAS DE MATERIA (BARRAS Y CIRCULAR) */}
            {(pestañaActiva === 'todas' || pestañaActiva === 'materias') && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1.1fr',
                    gap: '24px'
                }}>
                    {/* CARD BARRAS DE MATERIA */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarChart3 size={18} color="#2563eb" />
                                    Tasa de Aciertos por Materia
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Porcentaje de respuestas correctas registradas en cada disciplina
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '12px' }}>
                                Barras Comparativas
                            </span>
                        </div>

                        <div style={{ position: 'relative', height: '280px', width: '100%' }}>
                            {materiasFiltradas.length > 0 ? (
                                <canvas ref={canvasBarMateriasRef} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                    No hay evaluaciones registradas para las materias seleccionadas.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD CIRCULAR (DONA / PIE) DE MATERIA */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PieIcon size={18} color="#7c3aed" />
                                    Distribución de Aciertos por Materia
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Proporción de efectividad académica por materia
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '12px' }}>
                                {tipoGraficoCircular === 'dona' ? 'Gráfico Circular (Dona)' : 'Gráfico de Pastel'}
                            </span>
                        </div>

                        <div style={{ position: 'relative', height: '280px', width: '100%' }}>
                            {materiasFiltradas.length > 0 ? (
                                <canvas ref={canvasPieMateriasRef} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                    Sin datos de participación registrados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: GRÁFICAS DE PREGUNTA (BARRAS Y CIRCULAR) */}
            {(pestañaActiva === 'todas' || pestañaActiva === 'preguntas') && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1.1fr',
                    gap: '24px'
                }}>
                    {/* CARD BARRAS DE PREGUNTAS */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarChart3 size={18} color="#10b981" />
                                    Tasa de Aciertos por Pregunta
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Verde (&gt;75%), Ámbar (50–74%), Rojo (&lt;50% dificultad alta)
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Fácil
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Medio
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> Difícil
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'relative', height: '280px', width: '100%' }}>
                            {preguntasFiltradas.length > 0 ? (
                                <canvas ref={canvasBarPreguntasRef} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                    No hay preguntas registradas bajo los filtros seleccionados.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD CIRCULAR (DONA / PIE) DE DIFICULTAD DE PREGUNTAS */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PieIcon size={18} color="#0284c7" />
                                    Clasificación de Dificultad
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Distribución de preguntas según nivel de acierto
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '12px' }}>
                                Efectividad Pedagógica
                            </span>
                        </div>

                        <div style={{ position: 'relative', height: '280px', width: '100%' }}>
                            {preguntasFiltradas.length > 0 ? (
                                <canvas ref={canvasPiePreguntasRef} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                    Sin reactivos disponibles.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 3: TABLA DETALLADA DE PREGUNTAS CON TASAS EXACTAS */}
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                            Análisis Detallado por Pregunta
                        </h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            Listado completo con desglose de alumnos evaluados, aciertos e índice de dificultad
                        </span>
                    </div>

                    {/* Búsqueda dentro de la tabla */}
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Buscar pregunta..."
                            value={busquedaPregunta}
                            onChange={(e) => setBusquedaPregunta(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 10px 8px 32px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '12px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {preguntasFiltradas.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '10px 8px', width: '60px' }}>#</th>
                                    <th style={{ padding: '10px 8px' }}>ENUNCIADO</th>
                                    <th style={{ padding: '10px 8px', width: '150px' }}>MATERIA</th>
                                    <th style={{ padding: '10px 8px', width: '180px' }}>CUESTIONARIO</th>
                                    <th style={{ padding: '10px 8px', width: '180px' }}>TASA DE ACIERTO</th>
                                    <th style={{ padding: '10px 8px', width: '110px' }}>DIFICULTAD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preguntasFiltradas.map((p, idx) => {
                                    const tasa = p.tasaAciertos || 0;
                                    const esFacil = tasa >= 75;
                                    const esMedio = tasa >= 50 && tasa < 75;
                                    const colorBarra = esFacil ? '#10b981' : esMedio ? '#f59e0b' : '#ef4444';
                                    const bgBadge = esFacil ? '#ecfdf5' : esMedio ? '#fef3c7' : '#fee2e2';
                                    const colorBadge = esFacil ? '#047857' : esMedio ? '#b45309' : '#b91c1c';
                                    const labelDif = p.totalRespuestas === 0 ? 'Sin evaluar' : (esFacil ? 'Baja (Fácil)' : esMedio ? 'Media' : 'Alta (Crítica)');

                                    return (
                                        <tr key={p.preguntaId || idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '700', color: '#64748b' }}>
                                                #{p.orden || idx + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#0f172a', fontWeight: '500', maxWidth: '350px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.enunciado}>
                                                    {p.enunciado || 'Pregunta sin texto'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    backgroundColor: getColorPorMateria(p.materia) + '18',
                                                    color: getColorPorMateria(p.materia)
                                                }}>
                                                    {p.materia || 'General'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }} title={p.cuestionarioTitulo}>
                                                    {p.cuestionarioTitulo || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${tasa}%`,
                                                            height: '100%',
                                                            background: colorBarra,
                                                            borderRadius: '4px',
                                                            transition: 'width 0.4s ease'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: colorBarra, minWidth: '40px' }}>
                                                        {tasa}%
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                                                    {p.respuestasCorrectas || 0} de {p.totalRespuestas || 0} aciertos
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    background: bgBadge,
                                                    color: colorBadge
                                                }}>
                                                    {labelDif}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '13px' }}>
                        No se encontraron preguntas que coincidan con los criterios de búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
