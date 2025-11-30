"use client";

import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { Mail, MapPin, Phone, Twitter, Clock, Hash, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IconContainer } from "../molecules/icon-container";

export default function Footer() {
  const socialLinks = [
    { name: "Facebook", Icon: SiFacebook, href: "https://www.facebook.com/inderbu", handle: "@inderbu" },
    { name: "Instagram", Icon: SiInstagram, href: "https://www.instagram.com/somosinderbu", handle: "@somosinderbu" },
    { name: "YouTube", Icon: SiYoutube, href: "https://www.youtube.com/@somosinderbu", handle: "@somosinderbu" },
    { name: "X", Icon: Twitter, href: "#" },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: "Calle 10 #30-140 Unidad deportiva Alfonso López –Coliseo Bicentenario, Bucaramanga, Santander, Colombia.",
      label: "Dirección",
    },
    {
      icon: Building,
      text: "Código Postal: 680003 | Código Dane: 168001001483",
      label: "Códigos",
    },
    {
      icon: Clock,
      text: "Lunes a Viernes de 07:30 a.m. a 01:00 p.m y de 02:00 p.m. a 05:00 p.m.",
      label: "Horario de atención",
    },
    {
      icon: Phone,
      text: "+57 (607) 6854594",
      label: "Teléfono Pbx",
    }
  ];

  const emailContacts = [
    {
      icon: Mail,
      text: "ventanillaunica@inderbu.gov.co",
      label: "Correo Institucional",
    },
    {
      icon: Mail,
      text: "jefe_juridica@inderbu.gov.co",
      label: "Notificaciones Judiciales",
    },
    {
      icon: Mail,
      text: "ventanillaunica@inderbu.gov.co",
      label: "PQRS",
    }
  ];

  const quickLinks = [
    { href: "/sitemap", text: "Mapa del sitio" },
    { href: "/about", text: "Acerca de INDERBU" },
    { href: "/help", text: "Ayuda y soporte" },
    { href: "/terms", text: "Términos y condiciones" },
  ];

  const legalLinks = [
    { href: "/data-authorization", text: "Autorización de Tratamiento de Datos Personales" },
    { href: "/privacy", text: "Política de Privacidad y Tratamiento de Datos Personales" },
    { href: "/web-policy", text: "Política web y condiciones de uso" },
    { href: "/security", text: "Políticas de Seguridad de la Información" },
    { href: "/communications-plan", text: "Plan de Comunicaciones Inderbu 2020-2023" },
  ];

  return (
    <footer className="bg-gradient-to-br from-muted to-background border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="w-52">
              <Image
                src="/LOGO-3.png"
                alt="INDERBU"
                width={240}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Instituto de la Juventud, el Deporte y la Recreación de Bucaramanga.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nuestra misión es liderar, facilitar y ejecutar, el derecho a la
              práctica del deporte, la recreación, la educación física y el
              aprovechamiento del tiempo libre, además genera procesos de
              desarrollo Integral Juvenil en el Municipio de Bucaramanga.
            </p>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Información de Contacto</h3>
            <div className="space-y-3">
              {contactInfo.map(({ icon: Icon, text, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <IconContainer Icon={Icon} variant="primary" size="md" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email contacts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Correos Electrónicos</h3>
            <div className="space-y-3">
              {emailContacts.map(({ icon: Icon, text, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <IconContainer Icon={Icon} variant="primary" size="md" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-sm text-foreground break-all">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social media and quick links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Síguenos</h3>
            <div className="space-y-3">
              {socialLinks.map(({ name, Icon, href, handle }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex items-center gap-3 group"
                >
                  <IconContainer Icon={Icon} variant="social" size="md" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary-600 transition-colors">
                      {name}
                    </span>
                    {handle && (
                      <span className="text-xs text-muted-foreground">{handle}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal links section */}
        <div className="py-6 border-t border-border">
          <h4 className="font-medium text-foreground text-sm mb-3">Políticas y Documentos Legales</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {legalLinks.map(({ href, text }, index) => (
              <div key={href} className="flex items-center">
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  {text}
                </Link>
                {index < legalLinks.length - 1 && (
                  <div className="w-px h-4 bg-border ml-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="text-center md:text-left">
              <p>Todos los derechos reservados Gobierno de Colombia</p>
              <p>© Copyright {new Date().getFullYear()} INDERBU</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/cookies"
                className="hover:text-foreground transition-colors"
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