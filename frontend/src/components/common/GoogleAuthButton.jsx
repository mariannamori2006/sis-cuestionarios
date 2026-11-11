import React, { useEffect, useRef } from 'react';

// Referencias a nivel de módulo para que initialize() se llame UNA SOLA VEZ
let googleCallbackSuccess = null;
let googleCallbackError = null;
let isGoogleIdInitialized = false;

/**
 * Componente que renderiza el botón oficial de Google Identity (OAuth 2.0).
 * Maneja la inicialización única del SDK de Google y el renderizado dinámico del botón.
 */
export default function GoogleAuthButton({ onGoogleSuccess, onError, text = 'continue_with', disabled = false }) {
    const buttonRef = useRef(null);

    // Mantener callbacks siempre sincronizados sin necesidad de re-inicializar el SDK
    useEffect(() => {
        googleCallbackSuccess = onGoogleSuccess;
        googleCallbackError = onError;
    }, [onGoogleSuccess, onError]);

    // Obtiene el Client ID de las variables de entorno de Vite o el valor por defecto
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com';

    useEffect(() => {
        let isMounted = true;
        let intervalId = null;

        const setupGoogleButton = () => {
            if (!isMounted) return false;
            if (!window.google || !window.google.accounts || !window.google.accounts.id) {
                return false;
            }

            try {
                // 1. Inicializar el SDK de Google SOLO UNA VEZ en toda la sesión
                if (!isGoogleIdInitialized) {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: (response) => {
                            if (response.credential) {
                                googleCallbackSuccess?.(response.credential);
                            } else {
                                googleCallbackError?.('No se recibió la credencial de Google.');
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });
                    isGoogleIdInitialized = true;
                }

                // 2. Renderizar el botón en el contenedor del DOM
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
                console.warn('Google Identity warning:', err);
                return false;
            }
        };

        if (!setupGoogleButton()) {
            intervalId = setInterval(() => {
                if (setupGoogleButton()) {
                    clearInterval(intervalId);
                }
            }, 250);
        }

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [clientId, text]);

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.6 : 1 }}>
            <div ref={buttonRef} style={{ minHeight: '44px', width: '100%', display: 'flex', justifyContent: 'center' }}></div>
        </div>
    );
}
