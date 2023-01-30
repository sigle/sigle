import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { styled, keyframes } from '../stitches.config';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

const StyledAccordion = styled(AccordionPrimitive.Root, {
  width: '100%',
  mb: '$10',
});

const StyledHeader = styled(AccordionPrimitive.Header, {
  all: 'unset',
  display: 'flex',
});

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  padding: '0 20px',
  height: 45,
  flex: 1,
  pl: '$3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid $colors$gray6',
});

const StyledContent = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  mt: '$2',

  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
});

export const StyledChevron = styled(ChevronDownIcon, {
  color: '$gray9',
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
  '[data-state=closed] &': { transform: 'rotate(0deg)' },
});

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

export const AccordionTrigger = ({
  children,
  ...props
}: AccordionTriggerProps) => {
  return (
    <StyledHeader>
      <StyledTrigger {...props}>
        {children}
        <StyledChevron />
      </StyledTrigger>
    </StyledHeader>
  );
};

export const Accordion = StyledAccordion;
export const AccordionItem = AccordionPrimitive.Item;
export const AccordionContent = StyledContent;
