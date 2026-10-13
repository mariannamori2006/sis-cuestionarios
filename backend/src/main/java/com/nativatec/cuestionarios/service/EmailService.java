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

                helper.setFrom(remitente);
                helper.setTo(destinatario);
                helper.setSubject("¡Bienvenido(a) a NativaTec! Cuenta de Profesor Activada");

                String htmlContent = """
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">NativaTec • Sistema de Cuestionarios</h2>
                        </div>
                        <h3 style="color: #0f172a; margin-top: 0;">¡Hola, %s! 👋</h3>
                        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                            Tu cuenta de <strong>Profesor</strong> ha sido vinculada y habilitada con éxito en nuestra plataforma mediante <strong>Google Identity</strong>.
                        </p>
                        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #1e293b; font-size: 14px;"><strong>Correo registrado:</strong> %s</p>
                            <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Rol asignado:</strong> Profesor (Creación y gestión de cuestionarios)</p>
                            <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Estado:</strong> Verificado y Activo ✅</p>
                        </div>
                        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                            A partir de este momento puedes:
                        </p>
                        <ul style="color: #475569; font-size: 14px; line-height: 1.6;">
                            <li>Crear cuestionarios dinámicos con código de acceso para tus alumnos.</li>
                            <li>Revisar y calificar entregas en tiempo real.</li>
                            <li>Consultar reportes estadísticos y distribución de notas.</li>
                        </ul>
                        <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                            Este es un mensaje automático de confirmación generado por NativaTec Education.
                        </div>
                    </div>
                """.formatted(nombreProfesor != null && !nombreProfesor.isBlank() ? nombreProfesor : "Profesor", destinatario);

                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Correo de bienvenida enviado exitosamente a {}", destinatario);
            } catch (Exception e) {
                logger.error("Error al enviar correo de bienvenida a {}: {}", destinatario, e.getMessage());
            }
        });
    }
}
