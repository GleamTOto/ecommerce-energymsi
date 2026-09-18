import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { WHATSAPP_DISPLAY_PHONE } from "@/lib/whatsapp-message";

const footerLinks = {
  productos: [
    { name: "Baterías", href: "/products?category=baterias" },
    { name: "Baterías para UPS", href: "/products?category=baterias-para-ups" },
    { name: "Movilidad Eléctrica", href: "/products?category=movilidad-electrica" },
    { name: "Inversores", href: "/products?category=inversores" },
    { name: "Multímetros", href: "/products?category=multimetros" },
    { name: "UPS y Protección", href: "/products?category=ups-y-sistemas-de-proteccion" },
  ],
  empresa: [
    { name: "Sobre Nosotros", href: "/about" },
    { name: "Contacto", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Distribuidores", href: "/distributors" },
  ],
  ayuda: [
    { name: "Centro de Ayuda", href: "/help" },
    { name: "Envíos y Entregas", href: "/shipping" },
    { name: "Devoluciones", href: "/returns" },
    { name: "Garantía", href: "/warranty" },
    { name: "Preguntas Frecuentes", href: "/faq" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terms" },
    { name: "Política de Privacidad", href: "/privacy" },
    { name: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  MSI
                </span>
              </div>
              <span className="text-xl font-bold">EnergyMSI</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Especialistas en soluciones de energía y baterías. Proveemos baterías de alta calidad para UPS, movilidad eléctrica, herramientas y más.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold">Productos</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Empresa</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold">Ayuda</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <Link 
                  href="https://www.google.com/maps/place/Tundama-Complejo+Electr%C3%B3nico+y+Comercial/@4.6076841,-74.0747663,17z/data=!3m1!4b1!4m6!3m5!1s0x8e3f999f412f1011:0x24aabd67af375f3e!8m2!3d4.6076841!4d-74.0721914!16s%2Fg%2F11f3r0ywr1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Tundama - Complejo Electrónico y Comercial, Bogotá
                </Link>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                 <span>{WHATSAPP_DISPLAY_PHONE}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@energyMSI.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EnergyMSI. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
