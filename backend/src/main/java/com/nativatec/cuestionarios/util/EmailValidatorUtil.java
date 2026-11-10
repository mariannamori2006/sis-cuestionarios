package com.nativatec.cuestionarios.util;

import javax.naming.directory.Attribute;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Set;
import java.util.regex.Pattern;

public class EmailValidatorUtil {

    // Expresión regular estándar para validar la sintaxis de un correo electrónico
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    // Dominios institucionales y de proveedores confiables pre-validados
    private static final Set<String> DOMINIOS_CONFIABLES = Set.of(
            "senati.pe",
            "senati.edu.pe",
            "gmail.com",
            "outlook.com",
            "hotmail.com",
            "yahoo.com",
            "icloud.com",
            "live.com"
    );

    // Lista negra de proveedores de correos temporales o desechables
    private static final Set<String> DOMINIOS_DESECHABLES = Set.of(
            "yopmail.com", "mailinator.com", "10minutemail.com", "tempmail.com",
            "guerrillamail.com", "trashmail.com", "sharklasers.com", "getairmail.com",
            "dispostable.com", "crazymailing.com", "throwawaymail.com", "fakeinbox.com",
            "mohmal.com", "burnermail.io", "maildrop.cc"
    );

    /**
     * Valida la existencia y autenticidad del correo electrónico ingresado:
     * 1. Comprueba formato sintáctico correcto.
     * 2. Rechaza dominios temporales/basura (yopmail, tempmail, etc.).
     * 3. Acepta y prioriza correos institucionales (@senati.pe) y proveedores líderes.
     * 4. Realiza consulta DNS en vivo (Registros MX) para comprobar que el dominio realmente
     *    exista en Internet y posea servidores de correo para recibir mensajes.
     *
     * @param email Correo electrónico a validar
     * @throws IllegalArgumentException si el correo es inválido o su dominio no existe
     */
    public static void validarCorreoExistente(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es requerido.");
        }

        String emailLimpio = email.trim().toLowerCase();

        // 1. Verificación de formato
        if (!EMAIL_PATTERN.matcher(emailLimpio).matches()) {
            throw new IllegalArgumentException("El formato del correo electrónico es inválido.");
        }

        String dominio = emailLimpio.substring(emailLimpio.indexOf('@') + 1);

        // 2. Bloqueo de correos desechables
        if (DOMINIOS_DESECHABLES.contains(dominio)) {
            throw new IllegalArgumentException("No se permiten correos temporales o desechables. Por favor usa tu correo institucional @senati.pe o tu correo personal.");
        }

        // 3. Verificación de dominios conocidos / institucionales (SENATI, Gmail, Outlook, etc.)
        if (DOMINIOS_CONFIABLES.contains(dominio) || dominio.endsWith(".senati.pe")) {
            return; // Dominio institucional o de alta confiabilidad verificado
        }

        // 4. Verificación de servidores de correo (MX) en el DNS mundial para otros dominios
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("com.sun.jndi.dns.timeout.initial", "3000");
            env.put("com.sun.jndi.dns.timeout.retries", "1");

            DirContext ctx = new InitialDirContext(env);
            Attribute attr = ctx.getAttributes(dominio, new String[] { "MX" }).get("MX");

            if (attr == null || attr.size() == 0) {
                throw new IllegalArgumentException("El dominio '" + dominio + "' no cuenta con servidores activos para recibir correos.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("El dominio del correo ('" + dominio + "') no existe en Internet. Verifica el correo o utiliza tu cuenta institucional @senati.pe.");
        }
    }

    /**
     * Comprueba si el correo pertenece a la institución educativa SENATI.
     */
    public static boolean esCorreoSenati(String email) {
        if (email == null) return false;
        String e = email.trim().toLowerCase();
        return e.endsWith("@senati.pe") || e.endsWith("@senati.edu.pe");
    }
}

