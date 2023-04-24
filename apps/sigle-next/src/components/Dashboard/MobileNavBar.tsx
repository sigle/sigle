import { useDashboardStore } from './store';

export const MobileNavBar = () => {
  const open = useDashboardStore((state) => state.open);
  const setOpen = useDashboardStore((state) => state.setOpen);

  return null;
};
