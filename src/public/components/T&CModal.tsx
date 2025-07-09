import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from '../../utils/TextFix';

import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onHide: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onHide, onAccept }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.mainTitle}>Acuerdo de Uso de TutorMatch</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introducción y Alcance</Text>
              <Text style={styles.sectionText}>
                Bienvenido a TutorMatch. Este Acuerdo de Servicio ("Acuerdo") establece los términos y condiciones
                que rigen el uso de la plataforma TutorMatch, incluyendo todas sus características y funcionalidades.
                Al registrarte y usar TutorMatch, aceptas cumplir con este Acuerdo en su totalidad. TutorMatch es una
                plataforma que conecta estudiantes con tutores calificados para recibir apoyo académico en diversas materias.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Definiciones</Text>
              <Text style={styles.sectionText}>
                "Plataforma" se refiere al sitio web y servicios de TutorMatch.{"\n"}
                "Usuario" se refiere a cualquier persona que acceda o utilice la Plataforma.{"\n"}
                "Estudiante" se refiere a un Usuario que busca servicios de tutoría.{"\n"}
                "Tutor" se refiere a un Usuario que ofrece servicios de tutoría.{"\n"}
                "Tutoría" se refiere al servicio educativo proporcionado por un Tutor a un Estudiante.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Registro y Cuentas de Usuario</Text>
              <Text style={styles.sectionText}>
                3.1. Para utilizar TutorMatch, debes crear una cuenta proporcionando información precisa y completa.{"\n"}
                3.2. Eres responsable de mantener la confidencialidad de tus credenciales de acceso.{"\n"}
                3.3. Debes ser alumno de la Universidad Peruana de Ciencias Aplicadas (UPC) para registrarte y contar con autorización de tus padres o tutores legales, en caso de ser menor de edad.{"\n"}
                3.4. Cada cuenta es personal e intransferible.{"\n"}
                3.5. TutorMatch se reserva el derecho de verificar la identidad de los usuarios mediante procedimientos de verificación, especialmente para tutores.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Servicios de Tutoría</Text>
              <Text style={styles.sectionText}>
                4.1. Los Tutores pueden crear y ofrecer sesiones de tutoría a través de la Plataforma.{"\n"}
                4.2. Los Tutores son responsables de la calidad y precisión del contenido educativo que proporcionan.{"\n"}
                4.3. TutorMatch no garantiza resultados académicos específicos derivados de las tutorías.{"\n"}
                4.4. Los horarios de disponibilidad son establecidos por los Tutores y respetados por los Estudiantes.{"\n"}
                4.5. TutorMatch se reserva el derecho de revisar y moderar el contenido de las tutorías para asegurar su calidad y cumplimiento con nuestras políticas.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Membresía de Tutores</Text>
              <Text style={styles.sectionText}>
                5.1. Para acceder a la plataforma TutorMatch como Tutor, es obligatorio adquirir una membresía mediante un pago único.{"\n"}
                5.2. La membresía se puede pagar exclusivamente a través de Yape o Plin, utilizando el monto exacto requerido.{"\n"}
                5.3. Los Tutores deben subir el comprobante de pago válido para su revisión y activación de membresía.{"\n"}
                5.4. Un administrador de TutorMatch revisará el comprobante y activará la membresía si es válido.{"\n"}
                5.5. En caso de que el monto pagado sea incorrecto, TutorMatch se compromete a devolver el monto dentro de un plazo de 1 a 2 horas.{"\n"}
                5.6. La membresía es personal e intransferible, y permite al Tutor acceder a todas las funcionalidades de la plataforma.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Pagos y Transacciones</Text>
              <Text style={styles.sectionText}>
                6.1. TutorMatch actúa únicamente como plataforma de conexión entre Tutores y Estudiantes.{"\n"}
                6.2. TutorMatch NO gestiona pagos ni transacciones entre usuarios.{"\n"}
                6.3. Los acuerdos económicos, métodos de pago y tarifas deben ser acordados directamente entre el Tutor y el Estudiante.{"\n"}
                6.4. TutorMatch no es responsable por disputas económicas, falta de pago o cualquier otro problema relacionado con transacciones entre usuarios.{"\n"}
                6.5. Los usuarios acuerdan que cualquier arreglo financiero realizado es bajo su entera responsabilidad.{"\n"}
                6.6. Se recomienda a los usuarios establecer claramente las condiciones de pago antes de iniciar cualquier servicio de tutoría.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Privacidad y Protección de Datos</Text>
              <Text style={styles.sectionText}>
                7.1. TutorMatch recopila y procesa datos personales de acuerdo con nuestra Política de Privacidad.{"\n"}
                7.2. Los usuarios son responsables de la información que comparten con otros usuarios.{"\n"}
                7.3. TutorMatch implementa medidas de seguridad para proteger la información de los usuarios.{"\n"}
                7.4. Los datos de los usuarios se almacenan de forma segura y se utilizan solo para los fines establecidos en nuestra Política de Privacidad.{"\n"}
                7.5. Los usuarios pueden solicitar acceso, rectificación o eliminación de sus datos personales según las leyes aplicables.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Propiedad Intelectual</Text>
              <Text style={styles.sectionText}>
                8.1. Todo el contenido de TutorMatch, incluyendo logos, diseños y software, es propiedad de TutorMatch o está licenciado a nosotros.{"\n"}
                8.2. Los materiales educativos subidos por los Tutores siguen siendo de su propiedad, pero conceden a TutorMatch una licencia para mostrarlos en la Plataforma.{"\n"}
                8.3. Los usuarios no pueden copiar, distribuir o modificar contenido de la Plataforma sin autorización.{"\n"}
                8.4. TutorMatch respeta los derechos de propiedad intelectual de terceros y espera que los usuarios también lo hagan.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Conducta del Usuario</Text>
              <Text style={styles.sectionText}>
                9.1. Los usuarios deben comportarse de manera respetuosa y profesional.{"\n"}
                9.2. Está prohibido el uso de la Plataforma para actividades ilegales, fraudulentas o no éticas.{"\n"}
                9.3. No se permite el acoso, discriminación o comportamiento abusivo hacia otros usuarios.{"\n"}
                9.4. La publicación de contenido inapropiado, ofensivo o dañino está prohibida.{"\n"}
                9.5. Los usuarios no deben interferir con el funcionamiento de la Plataforma o intentar acceder sin autorización a áreas restringidas.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Limitación de Responsabilidad</Text>
              <Text style={styles.sectionText}>
                10.1. TutorMatch no es responsable de la calidad o precisión del contenido proporcionado por los Tutores.{"\n"}
                10.2. TutorMatch no garantiza la credibilidad, calificaciones o experiencia de los Tutores.{"\n"}
                10.3. TutorMatch no es responsable de ninguna transacción financiera entre Estudiantes y Tutores.{"\n"}
                10.4. No garantizamos la disponibilidad ininterrumpida de la Plataforma.{"\n"}
                10.5. No somos responsables de las interacciones entre usuarios fuera de la Plataforma.{"\n"}
                10.6. TutorMatch no se hace responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso de la Plataforma.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Contacto entre Usuarios</Text>
              <Text style={styles.sectionText}>
                11.1. TutorMatch facilita el contacto inicial entre Tutores y Estudiantes a través de la Plataforma.{"\n"}
                11.2. Los usuarios pueden comunicarse a través de correo electrónico o WhatsApp para coordinar detalles de sus tutorías.{"\n"}
                11.3. TutorMatch no supervisa ni participa en las comunicaciones directas entre usuarios.{"\n"}
                11.4. Los usuarios acuerdan usar los canales de comunicación de manera responsable y profesional.{"\n"}
                11.5. TutorMatch recomienda mantener todas las comunicaciones relacionadas con las tutorías dentro de canales que puedan ser verificados.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Terminación</Text>
              <Text style={styles.sectionText}>
                12.1. Los usuarios pueden cancelar su cuenta en cualquier momento.{"\n"}
                12.2. TutorMatch puede suspender o terminar cuentas que violen este Acuerdo sin previo aviso.{"\n"}
                12.3. Al cancelar tu cuenta, es posible que no tengas acceso a ciertos datos o contenidos.{"\n"}
                12.4. Algunas disposiciones de este Acuerdo seguirán vigentes después de la terminación.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Modificaciones al Acuerdo</Text>
              <Text style={styles.sectionText}>
                13.1. TutorMatch puede modificar este Acuerdo en cualquier momento.{"\n"}
                13.2. Las modificaciones importantes serán notificadas a los usuarios.{"\n"}
                13.3. El uso continuado de la Plataforma después de las modificaciones constituye aceptación de los nuevos términos.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Ley Aplicable</Text>
              <Text style={styles.sectionText}>
                14.1. Este Acuerdo se rige por las leyes de Perú.{"\n"}
                14.2. Cualquier disputa derivada de este Acuerdo se resolverá en los tribunales competentes de Lima, Perú.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Al hacer clic en "Aceptar", confirmas que has leído y estás de acuerdo con nuestros Términos y Condiciones, y nuestra Política de Privacidad.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onHide}
            >
              <Ionicons name="close" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionText: {
    color: '#9ca3af',
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 4,
    margin: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#9ca3af',
    flex: 1,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
});

export default TermsModal;