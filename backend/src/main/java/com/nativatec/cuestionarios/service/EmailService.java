package com.nativatec.cuestionarios.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@nativatec.com}")
    private String remitente;

    /**
     * Envía un código OTP de 6 dígitos para validar que el usuario es el dueño legítimo del correo.
     */
    public void enviarCodigoVerificacion(String destinatario, String nombre, String codigo) {
        // Imprimir siempre el código en la consola del servidor para facilitar pruebas locales
        System.out.println("\n=======================================================");
        System.out.println(" 🔑 CÓDIGO DE VERIFICACIÓN NATIVATEC");
        System.out.println(" Destinatario: " + destinatario);
        System.out.println(" CÓDIGO OTP:   [" + codigo + "]");
        System.out.println("=======================================================\n");

        CompletableFuture.runAsync(() -> {
            if (mailSender == null) {
                logger.warn("JavaMailSender no está configurado. Código {} para {} mostrado en consola.", codigo, destinatario);
                return;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                boolean esSenati = com.nativatec.cuestionarios.util.EmailValidatorUtil.esCorreoSenati(destinatario);

                String correoRemitente = (remitente != null && !remitente.isBlank()) ? remitente : "no-reply@nativatec.com";
                helper.setFrom(correoRemitente);
                helper.setTo(destinatario);
                helper.setSubject(esSenati
                        ? "Código de verificación SENATI: " + codigo + " — NativaTec"
                        : "Tu código de verificación: " + codigo + " — NativaTec");

                String saludo = nombre != null && !nombre.isBlank() ? nombre : "Estimado(a)";

                String htmlContent = """
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff;">
                        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 10px; margin-bottom: 24px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">NativaTec • Sistema de Cuestionarios</h2>
                            %s
                        </div>
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">¡Hola, %s! 👋</h3>
                        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
                            Has solicitado registrarte en la plataforma de cuestionarios con el correo <strong>%s</strong>.
                            Para verificar que eres el propietario de esta cuenta, ingresa el siguiente código de verificación:
                        </p>
                        <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                                Código de Verificación (OTP)
                            </div>
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1e40af; font-family: monospace; display: inline-block;">
                                %s
                            </span>
                        </div>
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                                ⏱️ Este código es válido durante los próximos <strong>10 minutos</strong>. Si tú no solicitaste este registro, puedes ignorar este correo de forma segura.
                            </p>
                        </div>
                        <div style="padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                            NativaTec Education Security • Mensaje de verificación automática.
                        </div>
                    </div>
                """.formatted(
                        esSenati ? "<span style='color: #6ee7b7; font-size: 12px; font-weight: 600;'>Validación de Cuenta Institucional SENATI</span>" : "",
                        saludo,
                        destinatario,
                        codigo
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Código de verificación enviado exitosamente a {}", destinatario);
            } catch (Exception e) {
                logger.error("Error al enviar código de verificación a {}: {}", destinatario, e.getMessage());
            }
        });
    }

    /**
     * Envía un correo electrónico de bienvenida en segundo plano tras el registro con Google.
     */
    public void enviarCorreoBienvenida(String destinatario, String nombreProfesor) {
        CompletableFuture.runAsync(() -> {
            if (mailSender == null) {
                logger.warn("JavaMailSender no está configurado. No se envió el correo a {}", destinatario);
                return;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                boolean esSenati = com.nativatec.cuestionarios.util.EmailValidatorUtil.esCorreoSenati(destinatario);

                String correoRemitente = (remitente != null && !remitente.isBlank()) ? remitente : "no-reply@nativatec.com";
                helper.setFrom(correoRemitente);
                helper.setTo(destinatario);
                helper.setSubject(esSenati
                        ? "¡Bienvenido(a) a NativaTec! Cuenta Institucional SENATI Activada"
                        : "¡Bienvenido(a) a NativaTec! Tu cuenta ha sido activada");

                String descripcionMetodo = esSenati
                        ? "Tu cuenta institucional de <strong>SENATI</strong> (" + destinatario + ") ha sido verificada y habilitada con éxito en nuestra plataforma."
                        : "Tu cuenta de profesor ha sido vinculada y habilitada con éxito en nuestra plataforma.";

                String htmlContent = """
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">NativaTec • Sistema de Cuestionarios</h2>
                        </div>
                        <h3 style="color: #0f172a; margin-top: 0;">¡Hola, %s! 👋</h3>
                        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                            %s
                        </p>
                        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #1e293b; font-size: 14px;"><strong>Correo registrado:</strong> %s</p>
                            <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Institución:</strong> %s</p>
                            <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Estado:</strong> Verificado y Activo ✅</p>
                        </div>
                        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                            A partir de este momento puedes acceder a tu panel docente y:
                        </p>
                        <ul style="color: #475569; font-size: 14px; line-height: 1.6;">
                            <li>Crear evaluaciones dinámicas con ponderación sobre 20 puntos.</li>
                            <li>Aprovechar el <strong>Banco Centralizado de Preguntas</strong> por materia y dificultad.</li>
                            <li>Revisar y calificar entregas en tiempo real con estadísticas de desempeño.</li>
                        </ul>
                        <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                            Este es un mensaje automático de confirmación generado por NativaTec Education.
                        </div>
                    </div>
                """.formatted(
                        nombreProfesor != null && !nombreProfesor.isBlank() ? nombreProfesor : "Profesor",
                        descripcionMetodo,
                        destinatario,
                        esSenati ? "SENATI (Servicio Nacional de Adiestramiento en Trabajo Industrial)" : "NativaTec"
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Correo de bienvenida enviado exitosamente a {}", destinatario);
            } catch (Exception e) {
                logger.error("Error al enviar correo de bienvenida a {}: {}", destinatario, e.getMessage());
            }
        });
    }
}
