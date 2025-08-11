import { AuthMode } from "../types/auth-mode.type";
import React from "react";

export interface IFormConfig {
  mode: AuthMode;
  title: string;
  description: string;
  submitButtonText: string;
  component: React.ComponentType<any>;
}
