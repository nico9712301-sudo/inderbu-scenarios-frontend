import { useState, useCallback } from "react";
import { Scenario } from "@/services/api";

export interface UseScenarioModalsReturn {
  // Create Modal State
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  
  // Edit Modal State
  isEditModalOpen: boolean;
  selectedScenario: Scenario | null;
  openEditModal: (scenario: Scenario) => void;
  closeEditModal: () => void;
  
  // Filters State
  showFilters: boolean;
  toggleFilters: () => void;
}

export function useScenarioModals(): UseScenarioModalsReturn {
  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  // Filters state
  const [showFilters, setShowFilters] = useState(false);

  // Create modal actions
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  // Edit modal actions
  const openEditModal = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedScenario(null);
  }, []);

  // Filters actions
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  return {
    // Create Modal
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    
    // Edit Modal
    isEditModalOpen,
    selectedScenario,
    openEditModal,
    closeEditModal,
    
    // Filters
    showFilters,
    toggleFilters,
  };
}