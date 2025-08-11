import { useState } from "react";
import { toast } from "sonner";
import { validateSlotAvailability, getUnavailableSlots } from "../utils/slot-validators";
import { formatHourHuman, getAvailableSlotsInPeriod } from "../utils/time-formatters";
import { SMART_SHORTCUTS } from "../constants/smart-shortcuts";
import { TIME_PERIODS } from "../constants/time-periods";

export const useTimeSlotSelection = (
  checkSlotAvailability: (hour: number) => boolean,
  setConfig: (updateFn: (prev: any) => any) => void
) => {
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  const toggleTimeSlot = (hour: number) => {
    if (!validateSlotAvailability(hour, checkSlotAvailability)) {
      return;
    }

    setSelectedSlots(prev => {
      const newSelectedSlots = new Set(prev);
      
      if (newSelectedSlots.has(hour)) {
        newSelectedSlots.delete(hour);
      } else {
        newSelectedSlots.add(hour);
      }

      const selectedHours = Array.from(newSelectedSlots);
      setConfig(prevConfig => ({
        ...prevConfig,
        timeSlots: selectedHours,
      }));

      return newSelectedSlots;
    });
  };

  const applySmartShortcut = (shortcutId: string) => {
    const shortcut = SMART_SHORTCUTS.find(s => s.id === shortcutId);
    if (!shortcut) return;

    const availableHours = getAvailableSlotsInPeriod(shortcut.hours, checkSlotAvailability);
    
    if (availableHours.length === 0) {
      toast.warning(`No hay horarios disponibles para "${shortcut.name}"`);
      return;
    }
    
    setSelectedSlots(new Set(availableHours));
    setConfig(prevConfig => ({
      ...prevConfig,
      timeSlots: availableHours,
    }));
    
    toast.success(`${shortcut.icon} ${shortcut.name} aplicado (${availableHours.length} horarios)`);
  };

  const selectPeriodHours = (periodId: string) => {
    const period = TIME_PERIODS.find(p => p.id === periodId);
    if (!period) return;

    const availablePeriodHours = getAvailableSlotsInPeriod(period.hours, checkSlotAvailability);
    
    if (availablePeriodHours.length === 0) {
      toast.warning(`No hay horarios disponibles en ${period.name.toLowerCase()}`);
      return;
    }
    
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      availablePeriodHours.forEach(hour => newSet.add(hour));
      return newSet;
    });
    
    setConfig(prevConfig => ({
      ...prevConfig,
      timeSlots: Array.from(new Set([...prevConfig.timeSlots, ...availablePeriodHours])),
    }));
    
    toast.success(`Seleccionados ${availablePeriodHours.length} horarios en ${period.name.toLowerCase()}`);
  };

  const clearAllTimeSlots = () => {
    setSelectedSlots(new Set());
    setConfig(prevConfig => ({
      ...prevConfig,
      timeSlots: [],
    }));
  };

  const removeUnavailableSlots = () => {
    const selectedSlotsArray = Array.from(selectedSlots);
    const unavailableSlots = getUnavailableSlots(selectedSlotsArray, checkSlotAvailability);
    
    if (unavailableSlots.length > 0) {
      toast.error(`Los siguientes horarios ya no están disponibles: ${unavailableSlots.map(s => formatHourHuman(s)).join(", ")}`);
      
      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        unavailableSlots.forEach(slot => newSet.delete(slot));
        return newSet;
      });
      
      return true; // Indica que se removieron slots
    }
    
    return false; // No se removieron slots
  };

  const getSelectedTimeSlotsCount = () => {
    return selectedSlots.size;
  };

  return {
    selectedSlots,
    toggleTimeSlot,
    applySmartShortcut,
    selectPeriodHours,
    clearAllTimeSlots,
    removeUnavailableSlots,
    getSelectedTimeSlotsCount,
  };
};
