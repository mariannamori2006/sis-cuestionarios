import React, { useEffect, useRef } from 'react';

/**
 * Componente que renderiza el botón oficial de Google Identity (OAuth 2.0).
 * Maneja la inicialización asíncrona del SDK de Google y el retorno del token.
 */
export default function GoogleAuthButton({ onGoogleSuccess, onError, text = 'continue_with', disabled = false }) {
    const buttonRef = useRef(null);
    const successCallbackRef = useRef(onGoogleSuccess);
    const errorCallbackRef = useRef(onError);

    useEffect(() => {
        successCallbackRef.current = onGoogleSuccess;
        errorCallbackRef.current = onError;
    });

    // Obtiene el Client ID de las variables de entorno de Vite o un valor configurado
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com';

    useEffect(() => {
        let isMounted = true;
        let intervalId = null;

        const initializeGoogleSignIn = () => {
            if (!isMounted) return false;
            if (!window.google || !window.google.accounts || !window.google.accounts.id) {
                return false;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response.credential) {
                            successCallbackRef.current?.(response.credential);
                        } else {
                            errorCallbackRef.current?.('No se recibió la credencial de Google.');
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                if (buttonRef.current && isMounted) {
                    buttonRef.current.innerHTML = ''; // Limpiar render previo
                    window.google.accounts.id.renderButton(buttonRef.current, {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: text, // 'signin_with', 'signup_with', 'continue_with'
                        shape: 'rectangular',
                        logo_alignment: 'left',
                        width: '360'
                    });
                }
                return true;
            } catch (err) {
                console.error('Error al inicializar Google Identity:', err);
                return false;
            }
        };

        // Si el SDK ya está cargado, inicializar inmediatamente
        if (!initializeGoogleSignIn()) {
            intervalId = setInterval(() => {
                if (initializeGoogleSignIn()) {
                    clearInterval(intervalId);
                }
            }, 300);
        }

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [clientId, text]); // Solo se ejecuta si cambia clientId o text, evitando múltiples llamadas innecesarias

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.6 : 1 }}>
            <div ref={buttonRef} style={{ minHeight: '44px', width: '100%', display: 'flex', justifyContent: 'center' }}></div>
        </div>
    );
}
