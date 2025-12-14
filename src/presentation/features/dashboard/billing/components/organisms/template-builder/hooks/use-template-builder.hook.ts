"use client";

import { useState, useCallback } from "react";
import type {
  TemplateComponentConfig,
  TemplateContent,
  TemplateComponentType,
} from "../types/template-builder.types";
import { AVAILABLE_COMPONENTS } from "../types/template-builder.types";
// Simple UUID generator (using crypto.randomUUID if available, fallback to timestamp)
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function useTemplateBuilder(initialContent?: TemplateContent) {
  const [components, setComponents] = useState<TemplateComponentConfig[]>(
    initialContent?.components || []
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const addComponent = useCallback((type: TemplateComponentType) => {
    // Find default props from AVAILABLE_COMPONENTS
    const componentDef = AVAILABLE_COMPONENTS.find((c) => c.type === type);
    
    const newComponent: TemplateComponentConfig = {
      id: generateId(),
      type,
      position: {
        x: 0,
        y: components.length * 100, // Stack vertically
      },
      props: componentDef?.defaultProps || {},
    };

    setComponents((prev) => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id);
  }, [components.length]);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  const updateComponent = useCallback((id: string, updates: Partial<TemplateComponentConfig>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
    );
  }, []);

  const reorderComponents = useCallback((activeId: string, overId: string) => {
    setComponents((prev) => {
      const oldIndex = prev.findIndex((comp) => comp.id === activeId);
      const newIndex = prev.findIndex((comp) => comp.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newComponents = [...prev];
      const [removed] = newComponents.splice(oldIndex, 1);
      newComponents.splice(newIndex, 0, removed);

      // Update positions
      return newComponents.map((comp, index) => ({
        ...comp,
        position: {
          ...comp.position,
          y: index * 100,
        },
      }));
    });
  }, []);

  const getTemplateContent = useCallback((): TemplateContent => {
    return {
      components,
      metadata: {
        version: "1.0",
        createdAt: new Date().toISOString(),
      },
    };
  }, [components]);

  const loadTemplateContent = useCallback((content: TemplateContent) => {
    setComponents(content.components || []);
    setSelectedComponentId(null);
  }, []);

  return {
    components,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    removeComponent,
    updateComponent,
    reorderComponents,
    getTemplateContent,
    loadTemplateContent,
  };
}
