import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de Autoguardado Inteligente para React.
 * 
 * Características:
 * - Persistencia local resiliente (localStorage) tolerante a fallos y caídas de red.
 * - Debounce adaptativo para respuestas de texto abierto.
 * - Monitoreo de conectividad en tiempo real (online/offline).
 * - Sincronización de marca de tiempo (timestamp) para evitar trampas en temporizadores.
 * - Ciclo de vida limpio (limpieza del borrador al enviar con éxito).
 * 
 * @param {Object} config
 * @param {string} config.key - Clave única para almacenar el borrador en localStorage.
 * @param {any} config.data - Datos a autoguardar (ej: respuestas seleccionadas).
 * @param {boolean} config.enabled - Activa o pausa el autoguardado.
 * @param {number} config.debounceMs - Tiempo de espera en milisegundos tras cambios continuos (default: 650ms).
 * @param {Object} config.meta - Metadatos adicionales (ej: inicioTimestamp, advertencias).
 */
export default function useAutosave({
    key,
    data,
    enabled = true,
    debounceMs = 650,
    meta = {}
}) {
    // Estados: 'idle' | 'saving' | 'saved' | 'offline' | 'error'
    const [status, setStatus] = useState('idle');
    const [lastSaved, setLastSaved] = useState(null);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const timeoutRef = useRef(null);
    const initialLoadRef = useRef(false);
    const metaRef = useRef(meta);

    // Mantener la referencia de metadatos actualizada
    useEffect(() => {
        metaRef.current = meta;
    }, [meta]);

    // Detección de conectividad en vivo
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (status === 'offline') {
                setStatus('saved');
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [status]);

    // Leer borrador guardado
    const loadDraft = useCallback(() => {
        if (!key) return null;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            console.warn(`[useAutosave] No se pudo leer el borrador para la clave "${key}":`, err);
            return null;
        }
    }, [key]);

    // Eliminar borrador (al enviar el examen o iniciar nuevo intento)
    const clearDraft = useCallback(() => {
        if (!key) return;
        try {
            localStorage.removeItem(key);
            setStatus('idle');
            setLastSaved(null);
        } catch (err) {
            console.warn(`[useAutosave] No se pudo eliminar el borrador para la clave "${key}":`, err);
        }
    }, [key]);

    // Guardado inmediato
    const saveImmediately = useCallback((dataToSave) => {
        if (!key || !enabled) return;
        try {
            setStatus('saving');
            const targetData = dataToSave !== undefined ? dataToSave : data;

            const payload = {
                data: targetData,
                timestamp: Date.now(),
                meta: metaRef.current || {}
            };

            localStorage.setItem(key, JSON.stringify(payload));

            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const horaFormateada = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

            setLastSaved(horaFormateada);
            setStatus(navigator.onLine ? 'saved' : 'offline');
        } catch (err) {
            console.error(`[useAutosave] Error al escribir en localStorage:`, err);
            setStatus('error');
        }
    }, [key, enabled, data]);

    // Efecto de autoguardado inteligente con debounce
    useEffect(() => {
        if (!enabled || !key) return;

        // Evitar guardar en el primer render si no ha habido interacción
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;
            return;
        }

        // Si los datos están completamente vacíos o nulos, no sobreescribir innecesariamente
        if (data === undefined || data === null) return;

        setStatus('saving');

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            saveImmediately(data);
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, debounceMs, enabled, key, saveImmediately]);

    return {
        status,
        lastSaved,
        isOnline,
        loadDraft,
        clearDraft,
        saveImmediately
    };
}

