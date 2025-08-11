export interface IModalController {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
