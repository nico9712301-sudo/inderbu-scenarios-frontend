import { IAuthStrategy } from "../interfaces/auth-strategy.interface";
import { TLoginData, TRegisterData, TResetData } from "../schemas/auth-schemas";

export class LoginStrategy implements IAuthStrategy<TLoginData> {
  constructor(
    private authService: { login: (data: TLoginData) => Promise<any> },
    private onSuccess: () => void
  ) {}

  async execute(data: TLoginData): Promise<void> {
    await this.authService.login(data);
    this.onSuccess();
  }

  getSuccessMessage(): string {
    return "¡Bienvenido! Inicio de sesión correcto";
  }

  getErrorMessage(error: any): string {
    return error.message || "No se pudo iniciar sesión";
  }
}

export class RegisterStrategy implements IAuthStrategy<TRegisterData> {
  constructor(
    private authService: { register: (data: TRegisterData) => Promise<any> },
    private onSuccess: () => void
  ) {}

  async execute(data: TRegisterData): Promise<void> {
    await this.authService.register(data);
    this.onSuccess();
  }

  getSuccessMessage(): string {
    return "Registrado. Revisa tu correo para confirmar tu cuenta";
  }

  getErrorMessage(error: any): string {
    return error.message || "No se pudo registrar";
  }
}

export class ResetPasswordStrategy implements IAuthStrategy<TResetData> {
  constructor(
    private authService: { resetPassword: (data: TResetData) => Promise<any> },
    private onSuccess: () => void
  ) {}

  async execute(data: TResetData): Promise<void> {
    await this.authService.resetPassword(data);
    this.onSuccess();
  }

  getSuccessMessage(): string {
    return "Correo enviado. Revisa tu bandeja para restablecer tu contraseña";
  }

  getErrorMessage(error: any): string {
    return error.message || "No se pudo enviar el correo";
  }
}
