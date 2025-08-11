import { ResetPasswordForm } from "../components/organisms/reset-password-form";
import { RegisterForm } from "../components/organisms/register-form";
import { IFormConfig } from "../interfaces/form-config.interface";
import { LoginForm } from "../components/organisms/login-form";
import { AuthMode } from "../types/auth-mode.type";

export class AuthFormFactory {
  private static configs: Record<AuthMode, IFormConfig> = {
    login: {
      mode: "login",
      title: "Iniciar sesión",
      description: "Ingresa tus credenciales",
      submitButtonText: "Iniciar sesión",
      component: LoginForm,
    },
    register: {
      mode: "register", 
      title: "Crear cuenta",
      description: "Completa tus datos",
      submitButtonText: "Registrarse",
      component: RegisterForm,
    },
    reset: {
      mode: "reset",
      title: "Restablecer contraseña", 
      description: "Te enviaremos un enlace por correo",
      submitButtonText: "Enviar enlace",
      component: ResetPasswordForm,
    },
  };

  static createForm(mode: AuthMode): IFormConfig {
    const config = this.configs[mode];
    if (!config) throw new Error(`Form mode '${mode}' not supported`);
    return config;
  }

  // Open/Closed: Agregar nuevos tipos sin modificar código existente
  static registerFormType(mode: AuthMode, config: Omit<IFormConfig, 'mode'>) {
    this.configs[mode] = { ...config, mode };
  }
}
