import { create } from 'zustand';

interface ImportState {
  status: 'idle' | 'loading' | 'success' | 'error';
  setStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  processed: number;
  setProcessed: (processed: number) => void;
  total: number;
  setTotal: (total: number) => void;
}

export const useImportStore = create<ImportState>()((set) => ({
  status: 'idle',
  setStatus: (status) => set(() => ({ status })),
  processed: 0,
  setProcessed: (processed) => set(() => ({ processed })),
  total: 0,
  setTotal: (total) => set(() => ({ total })),
}));
