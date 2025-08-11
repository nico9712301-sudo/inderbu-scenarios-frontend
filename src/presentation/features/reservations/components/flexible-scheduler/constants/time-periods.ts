import { Sun, Sunset, Coffee, Moon } from "lucide-react";
import { TimePeriod } from "../types/scheduler.types";

export const TIME_PERIODS: TimePeriod[] = [
  {
    id: 'morning',
    name: 'Mañana',
    icon: Sun,
    description: '6 AM - 12 PM',
    hours: [6, 7, 8, 9, 10, 11],
    color: 'from-yellow-50 to-orange-50 border-yellow-200',
    shortcut: 'business-morning',
    defaultExpanded: true,
  },
  {
    id: 'afternoon', 
    name: 'Tarde',
    icon: Sunset,
    description: '12 PM - 6 PM',
    hours: [12, 13, 14, 15, 16, 17],
    color: 'from-blue-50 to-sky-50 border-blue-200',
    shortcut: 'business-afternoon',
    defaultExpanded: true,
  },
  {
    id: 'evening',
    name: 'Noche',
    icon: Coffee,
    description: '6 PM - 12 AM',
    hours: [18, 19, 20, 21, 22, 23],
    color: 'from-purple-50 to-indigo-50 border-purple-200',
    shortcut: 'evening',
    defaultExpanded: true,
  },
  {
    id: 'late_night',
    name: 'Madrugada',
    icon: Moon,
    description: '12 AM - 6 AM',
    hours: [0, 1, 2, 3, 4, 5],
    color: 'from-gray-50 to-slate-50 border-gray-200',
    shortcut: 'late-night',
    defaultExpanded: false,
  },
];
