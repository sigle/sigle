import { create } from 'zustand';

interface AuthModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));
