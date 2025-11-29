import { SmartShortcut } from "../types/scheduler.types";

export const SMART_SHORTCUTS: SmartShortcut[] = [
  {
    id: 'business',
    name: 'Horario comercial',
    description: 'Lunes a viernes, 9 AM - 5 PM',
    hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    icon: '',
  },
  {
    id: 'morning-workout',
    name: 'Ejercicio matutino',
    description: 'Perfecto para entrenar antes del trabajo',
    hours: [6, 7, 8],
    icon: '',
  },
  {
    id: 'lunch-break',
    name: 'Hora del almuerzo',
    description: 'Ideal para actividades en el break',
    hours: [12, 13],
    icon: '',
  },
  {
    id: 'after-work',
    name: 'Después del trabajo',
    description: 'Relajarse después de la jornada laboral',
    hours: [18, 19, 20],
    icon: '',
  },
  {
    id: 'weekend-morning',
    name: 'Mañana de fin de semana',
    description: 'Aprovecha la mañana del sábado/domingo',
    hours: [8, 9, 10, 11],
    icon: '',
  },
];
