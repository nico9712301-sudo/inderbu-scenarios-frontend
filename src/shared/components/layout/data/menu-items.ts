import { Calendar, Map, MapPin, Settings, Users } from "lucide-react";

export const reportItems = [
  // {
  //   title: "Reportes",
  //   href: "/reportes/reservas",
  //   icon: BarChart,
  // },
];

export const menuItems = [
  {
    title: "Reservas",
    href: "/dashboard",
    icon: Calendar,
  },
  {
    title: "Escenarios",
    href: "/dashboard/scenarios",
    icon: MapPin,
  },
  {
    title: "Sub-escenarios",
    href: "/dashboard/sub-scenarios",
    icon: MapPin,
  },
  {
    title: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Ubicaciones",
    href: "/dashboard/locations",
    icon: Map,
  },
];
