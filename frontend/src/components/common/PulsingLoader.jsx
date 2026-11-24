import React from 'react';

/**
 * Componente PulsingLoader inspirado en KendoReact Indicators (Pulsing)
 * Creado en React con animaciones CSS puras a 60 FPS, sin librerías externas.
 *
 * @param {string} size - 'xs' (4px), 'sm' (6px, ideal botones), 'md' (9px, default), 'lg' (14px)
 * @param {string} color - Color hexadecimal, RGB o preset ('primary', 'cyan', 'white', etc.)
 * @param {number} dots - Cantidad de puntos (2 como en Kendo o 3)
 * @param {string} text - Texto opcional acompañante ('Cargando...', 'Guardando...')
 * @param {string} textPosition - 'right' (al lado) o 'bottom' (abajo)
 * @param {object} style - Estilos personalizados adicionales
 */
export default function PulsingLoader({
    size = 'md',
    color = '#38bdf8',
    dots = 2,
    text = '',
    textPosition = 'right',
    style = {},
    className = ''
}) {
    // Resolver tamaños
    const dimensionMap = {
        xs: { dot: 5, gap: 4, font: '11px' },
        sm: { dot: 7, gap: 5, font: '12.5px' },
        md: { dot: 10, gap: 7, font: '14px' },
        lg: { dot: 15, gap: 10, font: '16px' }
    };

    const dims = dimensionMap[size] || dimensionMap.md;

    // Resolver colores temáticos
    const colorMap = {
        primary: '#2563eb',
        cyan: '#38bdf8',
        indigo: '#6366f1',
        purple: '#a855f7',
        white: '#ffffff',
        dark: '#0f172a',
        slate: '#94a3b8'
    };

    const activeColor = colorMap[color] || color;

    // Array de puntos
    const dotsArray = Array.from({ length: Math.max(2, Math.min(dots, 5)) });

    return (
        <div
            className={`pulsing-loader-container ${className}`}
            style={{
                display: 'inline-flex',
                flexDirection: textPosition === 'bottom' ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: text ? (textPosition === 'bottom' ? '8px' : '10px') : `${dims.gap}px`,
                verticalAlign: 'middle',
                ...style
            }}
        >
            {/* INYECCIÓN DE ESTILOS CSS SCOPED */}
            <style>{`
                @keyframes pulsingWave {
                    0%, 100% {
                        transform: scale(0.65);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.18);
                        opacity: 1;
                        filter: drop-shadow(0 0 6px currentColor);
                    }
                }
                .pulsing-dot-item {
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulsingWave 1.05s ease-in-out infinite;
                    will-change: transform, opacity;
                }
            `}</style>

            {/* PUNTOS PULSANTES */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${dims.gap}px` }}>
                {dotsArray.map((_, i) => (
                    <span
                        key={i}
                        className="pulsing-dot-item"
                        style={{
                            width: `${dims.dot}px`,
                            height: `${dims.dot}px`,
                            backgroundColor: activeColor,
                            color: activeColor,
                            animationDelay: `${i * 0.22}s`
                        }}
                    />
                ))}
            </div>

            {/* TEXTO OPCIONAL */}
            {text && (
                <span
                    style={{
                        fontSize: dims.font,
                        fontWeight: '600',
                        color: activeColor === '#ffffff' ? '#ffffff' : (color === 'white' ? '#ffffff' : '#64748b'),
                        whiteSpace: 'nowrap'
                    }}
                >
                    {text}
                </span>
            )}
        </div>
    );
}

