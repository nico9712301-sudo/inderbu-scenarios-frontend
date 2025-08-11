import { AuthMode } from "../types/auth-mode.type";

export interface IFormNavigation {
  onModeChange: (mode: AuthMode) => void;
  currentMode: AuthMode;
}
