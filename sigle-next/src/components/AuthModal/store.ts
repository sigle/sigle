import { create } from 'zustand';

type Route = 'connect' | 'sign';

interface AuthModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
  route: Route;
  setRoute: (route: Route) => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  route: 'connect',
  setRoute: (route: Route) => set({ route }),
}));
