import { TooltipProvider } from '@radix-ui/react-tooltip';

type TooltipProviderProps = React.ComponentProps<typeof TooltipProvider>;
type DesignSystemProviderProps = TooltipProviderProps;

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = (
  props,
) => {
  return <TooltipProvider {...props} />;
};
