import { toast } from "sonner";
import { Scenario } from "@/services/api";
import { createScenarioAction, updateScenarioAction } from "../actions/scenario.actions";
import { 
  buildCreateScenarioDto, 
  buildUpdateScenarioDto, 
  buildNewScenario, 
  buildUpdatedScenario,
  NeighborhoodOption 
} from "../utils/scenario-builders";
import { ScenarioFormData } from "../hooks/use-scenario-form";

// Base Command interface
interface Command<T = void> {
  execute(): Promise<T>;
  undo?(): Promise<void>;
}

// Create Scenario Command
export class CreateScenarioCommand implements Command<Scenario | null> {
  constructor(
    private formData: ScenarioFormData,
    private neighborhoods: NeighborhoodOption[],
    private onSuccess?: (scenario: Scenario) => void,
    private onError?: (error: string) => void
  ) {}

  async execute(): Promise<Scenario | null> {
    try {
      const createData = buildCreateScenarioDto(this.formData);
      const result = await createScenarioAction(createData);

      if (result.success) {
        // Build optimistic scenario object
        const newScenario = buildNewScenario(this.formData, this.neighborhoods);
        
        toast.success("Escenario creado exitosamente", {
          description: `${newScenario.name} ha sido registrado en el sistema.`,
        });

        this.onSuccess?.(newScenario);
        return newScenario;
      } else {
        const error = result.error || "Error al crear escenario";
        toast.error("Error al crear escenario", {
          description: error,
        });
        this.onError?.(error);
        return null;
      }
    } catch (error: any) {
      console.error("Error creating scenario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      toast.error("Error al crear escenario", {
        description: errorMessage,
      });
      
      this.onError?.(errorMessage);
      return null;
    }
  }
}

// Toggle Scenario Status Command
export class ToggleScenarioStatusCommand implements Command<Scenario | null> {
  constructor(
    private scenario: Scenario,
    private onSuccess?: (scenario: Scenario) => void,
    private onError?: (error: string) => void
  ) {}

  async execute(): Promise<Scenario | null> {
    try {
      const newStatus = !this.scenario.active;
      const updateData = { isActive: newStatus };

      console.log(`Toggling scenario ${this.scenario.id} status to:`, newStatus);

      const result = await updateScenarioAction(this.scenario.id, updateData);

      if (result.success) {
        // Build optimistic updated scenario
        const updatedScenario = {
          ...this.scenario,
          active: newStatus,
        };

        toast.success(`Escenario ${newStatus ? 'activado' : 'desactivado'}`, {
          description: `${updatedScenario.name} está ahora ${newStatus ? 'activo' : 'inactivo'}.`,
        });

        this.onSuccess?.(updatedScenario);
        return updatedScenario;
      } else {
        const error = result.error || "Error al cambiar estado del escenario";
        toast.error("Error al cambiar estado", {
          description: error,
        });
        this.onError?.(error);
        return null;
      }
    } catch (error: any) {
      console.error("Error toggling scenario status:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      toast.error("Error al cambiar estado", {
        description: errorMessage,
      });
      
      this.onError?.(errorMessage);
      return null;
    }
  }
}

// Update Scenario Command
export class UpdateScenarioCommand implements Command<Scenario | null> {
  constructor(
    private formData: ScenarioFormData,
    private originalScenario: Scenario,
    private neighborhoods: NeighborhoodOption[],
    private onSuccess?: (scenario: Scenario) => void,
    private onError?: (error: string) => void
  ) {}

  async execute(): Promise<Scenario | null> {
    try {
      const updateData = buildUpdateScenarioDto(this.formData, this.originalScenario);

      // Check if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios", {
          description: "No hay modificaciones para guardar.",
        });
        return null;
      }

      console.log("Updating scenario with data:", updateData);
      console.log("Selected scenario ID:", this.originalScenario.id);

      const result = await updateScenarioAction(this.originalScenario.id, updateData);

      if (result.success) {
        // Build optimistic updated scenario object
        const updatedScenario = buildUpdatedScenario(
          this.formData, 
          this.originalScenario, 
          this.neighborhoods
        );

        toast.success("Escenario actualizado exitosamente", {
          description: `${updatedScenario.name} ha sido actualizado.`,
        });

        this.onSuccess?.(updatedScenario);
        return updatedScenario;
      } else {
        const error = result.error || "Error al actualizar escenario";
        toast.error("Error al actualizar escenario", {
          description: error,
        });
        this.onError?.(error);
        return null;
      }
    } catch (error: any) {
      console.error("Error updating scenario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      toast.error("Error al actualizar escenario", {
        description: errorMessage,
      });
      
      this.onError?.(errorMessage);
      return null;
    }
  }
}

// Command Factory
export class ScenarioCommandFactory {
  static createScenario(
    formData: ScenarioFormData,
    neighborhoods: NeighborhoodOption[],
    callbacks?: {
      onSuccess?: (scenario: Scenario) => void;
      onError?: (error: string) => void;
    }
  ): CreateScenarioCommand {
    return new CreateScenarioCommand(
      formData,
      neighborhoods,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }

  static updateScenario(
    formData: ScenarioFormData,
    originalScenario: Scenario,
    neighborhoods: NeighborhoodOption[],
    callbacks?: {
      onSuccess?: (scenario: Scenario) => void;
      onError?: (error: string) => void;
    }
  ): UpdateScenarioCommand {
    return new UpdateScenarioCommand(
      formData,
      originalScenario,
      neighborhoods,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }

  static toggleScenarioStatus(
    scenario: Scenario,
    callbacks?: {
      onSuccess?: (scenario: Scenario) => void;
      onError?: (error: string) => void;
    }
  ): ToggleScenarioStatusCommand {
    return new ToggleScenarioStatusCommand(
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