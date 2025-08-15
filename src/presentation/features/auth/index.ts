// Export auth model
export { useAuth, AuthProvider } from './model/use-auth';

// Export auth actions
export { 
  loginAction, 
  registerAction, 
  resetPasswordAction, 
  logoutAction,
  login,
  register
} from '@/infrastructure/web/controllers/auth.actions';

// Export auth UI components
export { AuthGuard, UserReservationsGuard } from '@/shared/components/organisms/auth-guard';

// Export auth types from entities
export type { 
  User, 
  AuthTokens, 
  ILoginCredentials, 
  RegisterData, 
  ResetPasswordData,
  AuthState,
  UserRole
} from '@/entities/user/model/types';

export { 
  canViewUserReservations, 
  isAdmin, 
  getUserFullName,
  getUserRoleName
} from '@/entities/user/model/types';
