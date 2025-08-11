import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { Mail, MapPin, Phone, Twitter } from "lucide-react"; // Using lucide-react instead of ri
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const socialLinks = [
    { name: "Facebook", Icon: SiFacebook, href: "#" },
    { name: "Instagram", Icon: SiInstagram, href: "#" },
    { name: "YouTube", Icon: SiYoutube, href: "#" },
    { name: "X", Icon: Twitter, href: "#" }, // Using Twitter icon from lucide-react
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: "Calle 44 #52-165, Centro Administrativo La Alpujarra",
      label: "Dirección",
    },
    {
      icon: Phone,
      text: "604 385 5555",
      label: "Teléfono",
    },
    {
      icon: Mail,
      text: "info@inderbu.gov.co",
      label: "Email",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="w-52">
              <Image
                src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
                alt="INDERBU"
                width={240}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              Instituto de Deportes y Recreación de Buenaventura, promoviendo el
              bienestar y la actividad física en nuestra comunidad.
            </p>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Contacto</h3>
            <div className="space-y-3">
              {contactInfo.map(({ icon: Icon, text, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social media and links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Síguenos</h3>
            <div className="flex gap-3">
              {socialLinks.map(({ name, Icon, href }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex items-center justify-center w-10 h-10 rounded-xl
                           bg-white border border-gray-200 text-gray-600 
                           hover:bg-blue-50 hover:text-blue-600 
                           hover:border-blue-200 hover:shadow-sm
                           transition-all duration-200"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>

            {/* Quick links */}
            <div className="space-y-2 pt-4">
              <h4 className="font-medium text-gray-800 text-sm">
                Enlaces rápidos
              </h4>
              <div className="flex flex-col gap-1">
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Acerca de INDERBU
                </Link>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Ayuda y soporte
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Términos y condiciones
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} INDERBU. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Política de privacidad
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link
                href="/cookies"
                className="hover:text-gray-700 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
