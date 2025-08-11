// COMPONENTES ACTIVOS EN NUEVA ARQUITECTURA DDD
// (Componentes que SÍ están siendo usados)

// AuthModal - MIGRADO A NUEVA ARQUITECTURA DDD ✅
export { AuthModal } from "./organisms/auth-modal";

// FORMS MIGRADOS A NUEVA ARQUITECTURA DDD
export { RegisterForm } from "./organisms/register-form";  // Migrado - Usa DDD architecture

// COMPONENTES OBSOLETOS - NO ESTÁN SIENDO USADOS
// (Serán eliminados en el siguiente deploy)

// export { LoginForm } from "./organisms/login-form";        // Obsoleto
// export { ResetPasswordForm } from "./organisms/reset-password-form"; // Obsoleto

// export { FormNavigation } from "./molecules/form-navigation";  // Obsoleto
// export { SelectField } from "./molecules/select-field";        // Obsoleto

// 📝 NOTA: Estos componentes no están siendo importados en ningún lugar
// Se mantienen comentados para evitar errores de compilación hasta su eliminación completa
