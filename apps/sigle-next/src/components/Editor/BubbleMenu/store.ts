import { create } from 'zustand';

interface BubbleMenuState {
  linkOpen: boolean;
  setLinkOpen: (linkOpen: boolean) => void;
  linkValue: string;
  setLinkValue: (linkValue: string) => void;
}

export const useBubbleMenuStore = create<BubbleMenuState>()((set) => ({
  linkOpen: false,
  setLinkOpen: (linkOpen: boolean) => set({ linkOpen }),
  linkValue: '',
  setLinkValue: (linkValue: string) => set({ linkValue }),
}));
