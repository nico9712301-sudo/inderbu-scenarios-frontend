import { toast } from "sonner";
import { createScenarioAction, updateScenarioAction } from "@/infrastructure/web/controllers/scenario.actions";

// Re-export types for backward compatibility
export interface IScenarioFormData {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
  active?: boolean;
}

export interface NeighborhoodOption {
  id: number;
  name: string;
}

// Keep existing interfaces for backward compatibility
interface Command<T = void> {
  execute(): Promise<T>;
  undo?(): Promise<void>;
}

// Create Scenario Command - calls Server Action
export class CreateScenarioCommandImpl implements Command<{ success: boolean; data?: any; error?: string }> {
  constructor(
    private formData: IScenarioFormData,
    private neighborhoods: NeighborhoodOption[],
    private onSuccess?: (scenario: any) => void,
    private onError?: (error: string) => void
  ) { }

  async execute(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Command calls Server Action
      const result = await createScenarioAction({
        name: this.formData.name,
        address: this.formData.address,
        description: this.formData.description,
        neighborhoodId: this.formData.neighborhoodId,
      });

      if (result.success) {
        // Build optimistic scenario object for UI
        const newScenario = {
          ...result.data,
          neighborhood: this.neighborhoods.find(n => n.id === this.formData.neighborhoodId),
        };

        this.onSuccess?.(newScenario);
        return { success: true, data: newScenario };
      } else {
        // this.onError?.(result?.error);
        return { success: false, /*error: result.error*/ };
      }
    } catch (error: any) {
      console.error("Error creating scenario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      this.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// Update Scenario Command - calls Server Action
export class UpdateScenarioCommandImpl implements Command<{ success: boolean; data?: any; error?: string }> {
  constructor(
    private formData: IScenarioFormData,
    private originalScenario: any,
    private neighborhoods: NeighborhoodOption[],
    private onSuccess?: (scenario: any) => void,
    private onError?: (error: string) => void
  ) { }

  async execute(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Build update data
      const updateData: any = {};
      
      if (this.formData.name !== this.originalScenario.name) {
        updateData.name = this.formData.name;
      }
      if (this.formData.address !== this.originalScenario.address) {
        updateData.address = this.formData.address;
      }
      if (this.formData.description !== this.originalScenario.description) {
        updateData.description = this.formData.description;
      }
      if (this.formData.neighborhoodId !== this.originalScenario.neighborhoodId) {
        updateData.neighborhoodId = this.formData.neighborhoodId;
      }
      if (this.formData.active !== undefined && this.formData.active !== this.originalScenario.active) {
        updateData.active = this.formData.active;
      }

      // Check if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios", {
          description: "No hay modificaciones para guardar.",
        });
        return { success: true };
      }

      console.log("Updating scenario with data:", updateData);

      // Command calls Server Action
      const result = await updateScenarioAction(this.originalScenario.id, updateData);

      if (result.success) {
        // Build optimistic updated scenario object
        const updatedScenario = {
          ...this.originalScenario,
          ...this.formData,
          neighborhood: this.neighborhoods.find(n => n.id === this.formData.neighborhoodId),
        };

        this.onSuccess?.(updatedScenario);
        return { success: true, data: updatedScenario };
      } else {
        // this.onError?.(result.error);
        return { success: false};
      }
    } catch (error: any) {
      console.error("Error updating scenario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      this.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// Toggle Scenario Status Command - calls Server Action
export class ToggleScenarioStatusCommandImpl implements Command<{ success: boolean; data?: any; error?: string }> {
  constructor(
    private scenario: any,
    private onSuccess?: (scenario: any) => void,
    private onError?: (error: string) => void
  ) { }

  async execute(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const newStatus = !this.scenario.active;

      console.log(`Toggling scenario ${this.scenario.id} status to:`, newStatus);

      // Command calls Server Action
      const result = await updateScenarioAction(this.scenario.id, {
        active: newStatus,
      });

      if (result.success) {
        // Build optimistic updated scenario
        const updatedScenario = {
          ...this.scenario,
          active: newStatus,
        };

        this.onSuccess?.(updatedScenario);
        return { success: true, data: updatedScenario };
      } else {
        // this.onError?.(result.error);
        return { success: false};
      }
    } catch (error: any) {
      console.error("Error toggling scenario status:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      this.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// Command Factory - creates commands that call Server Actions
export class ScenarioCommandFactory {
  static createScenario(
    formData: IScenarioFormData,
    neighborhoods: NeighborhoodOption[],
    callbacks?: {
      onSuccess?: (scenario: any) => void;
      onError?: (error: string) => void;
    }
  ): CreateScenarioCommandImpl {
    return new CreateScenarioCommandImpl(
      formData,
      neighborhoods,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }

  static updateScenario(
    formData: IScenarioFormData,
    originalScenario: any,
    neighborhoods: NeighborhoodOption[],
    callbacks?: {
      onSuccess?: (scenario: any) => void;
      onError?: (error: string) => void;
    }
  ): UpdateScenarioCommandImpl {
    return new UpdateScenarioCommandImpl(
      formData,
      originalScenario,
      neighborhoods,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }

  static toggleScenarioStatus(
    scenario: any,
    callbacks?: {
      onSuccess?: (scenario: any) => void;
      onError?: (error: string) => void;
    }
  ): ToggleScenarioStatusCommandImpl {
    return new ToggleScenarioStatusCommandImpl(
      scenario,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }
}

// Command Invoker (for batch operations, undo/redo, etc.)
export class ScenarioCommandInvoker {
  private commands: Command<any>[] = [];
  private currentPosition = -1;

  async executeCommand<T>(command: Command<T>): Promise<T> {
    const result = await command.execute();

    // Add to history for potential undo/redo
    this.commands.splice(this.currentPosition + 1);
    this.commands.push(command);
    this.currentPosition++;

    return result;
  }

  async undo(): Promise<void> {
    if (this.currentPosition >= 0) {
      const command = this.commands[this.currentPosition];
      if (command.undo) {
        await command.undo();
      }
      this.currentPosition--;
    }
  }

  canUndo(): boolean {
    return this.currentPosition >= 0;
  }

  clear(): void {
    this.commands = [];
    this.currentPosition = -1;
  }
}
