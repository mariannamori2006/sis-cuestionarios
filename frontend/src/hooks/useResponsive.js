import { useState, useEffect } from 'react';

/**
 * Hook para detección en tiempo real de tipos de pantalla (Responsive).
 * Breakpoints estándar de la industria:
 * - isMobile: < 768px (Smartphones en vertical u horizontal)
 * - isTablet: >= 768px y < 1024px (Tablets / iPads)
 * - isDesktop: >= 1024px (Laptops y monitores de escritorio)
 */
export function useResponsive() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        // Ejecución inicial para asegurar valor exacto
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowSize.width < 768;
    const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
    const isDesktop = windowSize.width >= 1024;

    return {
        ...windowSize,
        isMobile,
        isTablet,
        isDesktop,
    };
}

export default useResponsive;

