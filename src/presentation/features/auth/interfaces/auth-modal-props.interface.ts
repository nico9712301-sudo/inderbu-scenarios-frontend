export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (
    id: number,
    email: string,
    role: number,
    token: string,
  ) => void;
}
