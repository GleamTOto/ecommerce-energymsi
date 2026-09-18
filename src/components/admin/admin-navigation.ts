import {
  CreditCard,
  Image,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/products", icon: Package },
  { name: "HeroBanner", href: "/admin/hero-banner", icon: Image },
  { name: "Pagos", href: "/admin/payments", icon: CreditCard },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Configuracion", href: "/admin/settings", icon: Settings },
] satisfies readonly AdminNavigationItem[];
