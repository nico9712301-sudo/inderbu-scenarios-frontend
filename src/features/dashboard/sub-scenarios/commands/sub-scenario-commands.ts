import { toast } from "sonner";
import { SubScenario } from "@/services/api";
import { updateSubScenarioAction } from "../actions/sub-scenario.actions";

// Base Command interface
interface Command<T = void> {
  execute(): Promise<T>;
  undo?(): Promise<void>;
}

// Toggle SubScenario Status Command
export class ToggleSubScenarioStatusCommand implements Command<SubScenario | null> {
  constructor(
    private subScenario: SubScenario,
    private onSuccess?: (subScenario: SubScenario) => void,
    private onError?: (error: string) => void
  ) {}

  async execute(): Promise<SubScenario | null> {
    try {
      const newStatus = !this.subScenario.active;
      const updateData = { active: newStatus };

      console.log(`Toggling sub-scenario ${this.subScenario.id} status to:`, newStatus);

      const result = await updateSubScenarioAction(this.subScenario.id, updateData);

      if (result.success) {
        // Build optimistic updated sub-scenario
        const updatedSubScenario = {
          ...this.subScenario,
          active: newStatus,
        };

        toast.success(`Sub-escenario ${newStatus ? 'activado' : 'desactivado'}`, {
          description: `${updatedSubScenario.name} está ahora ${newStatus ? 'activo' : 'inactivo'}.`,
        });

        this.onSuccess?.(updatedSubScenario);
        return updatedSubScenario;
      } else {
        const error = result.error || "Error al cambiar estado del sub-escenario";
        toast.error("Error al cambiar estado", {
          description: error,
        });
        this.onError?.(error);
        return null;
      }
    } catch (error: any) {
      console.error("Error toggling sub-scenario status:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado. Intente nuevamente.";
      
      toast.error("Error al cambiar estado", {
        description: errorMessage,
      });
      
      this.onError?.(errorMessage);
      return null;
    }
  }
}

// Command Factory
export class SubScenarioCommandFactory {
  static toggleSubScenarioStatus(
    subScenario: SubScenario,
    callbacks?: {
      onSuccess?: (subScenario: SubScenario) => void;
      onError?: (error: string) => void;
    }
  ): ToggleSubScenarioStatusCommand {
    return new ToggleSubScenarioStatusCommand(
      subScenario,
      callbacks?.onSuccess,
      callbacks?.onError
    );
  }
}

// Command Invoker (for batch operations, undo/redo, etc.)
export class SubScenarioCommandInvoker {
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
