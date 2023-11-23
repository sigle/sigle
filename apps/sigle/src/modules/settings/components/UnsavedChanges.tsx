import { darkTheme, styled } from '../../../stitches.config';
import { Box, Button, Typography } from '../../../ui';

const UnsavedChangesContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  br: '$2',
  boxShadow:
    '0px 8px 20px rgba(8, 8, 8, 0.06), 0px 10px 18px rgba(8, 8, 8, 0.04), 0px 5px 14px rgba(8, 8, 8, 0.04), 0px 3px 8px rgba(8, 8, 8, 0.04), 0px 1px 5px rgba(8, 8, 8, 0.03), 0px 1px 2px rgba(8, 8, 8, 0.02), 0px 0.2px 1px rgba(8, 8, 8, 0.01)',
  position: 'sticky',
  bottom: '$5',
  px: '$5',
  py: '$3',
  overflow: 'hidden',

  [`.${darkTheme} &`]: {
    boxShadow:
      '0px 8px 20px rgba(8, 8, 8, 0.32), 0px 10px 18px rgba(8, 8, 8, 0.28), 0px 5px 14px rgba(8, 8, 8, 0.26), 0px 3px 8px rgba(8, 8, 8, 0.16), 0px 1px 5px rgba(8, 8, 8, 0.14), 0px 1px 2px rgba(8, 8, 8, 0.12), 0px 0.2px 1px rgba(8, 8, 8, 0.08)',
  },
});

export const UnsavedChanges = ({ saving }: { saving: boolean }) => {
  return (
    <UnsavedChangesContainer>
      <Box
        css={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          zIndex: -1,
          backgroundColor: '$gray1',
          opacity: 0.95,
        }}
      />
      <Typography size="subheading" css={{ fontWeight: 600 }}>
        You have unsaved changes
      </Typography>
      <Button disabled={saving} type="submit" size="md" color="orange">
        {saving ? 'Saving...' : 'Save changes'}
      </Button>
    </UnsavedChangesContainer>
  );
};
