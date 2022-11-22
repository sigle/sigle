import { Cross1Icon } from '@radix-ui/react-icons';
import { styled } from '../stitches.config';
import {
  Box,
  Container,
  Button,
  IconButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  Typography,
  Flex,
  FormControlGroup,
  FormInput,
} from '../ui';

const Separator = styled('div', {
  borderBottom: '1px solid $gray7',
  mt: '$2',
  mb: '$4',
});

const SectionHeading = styled(Typography, {
  mt: '$10',
  textAlign: 'right',
  fontWeight: 600,
});

const DesignSystem = () => {
  const typographyText = 'A better internet, built on Bitcoin.';

  return (
    <Container>
      <SectionHeading size="h1">Typography</SectionHeading>
      <Separator />
      <Flex direction="column" gap="2">
        <Typography size="display1">(display1) {typographyText}</Typography>
        <Typography size="display2">(display2) {typographyText}</Typography>
        <Typography size="h1">(h1) {typographyText}</Typography>
        <Typography size="h2">(h2) {typographyText}</Typography>
        <Typography size="h3">(h3) {typographyText}</Typography>
        <Typography size="h4">(h4) {typographyText}</Typography>
        <Typography size="subheading">(subheading) {typographyText}</Typography>
        <Typography size="paragraph">(paragraph) {typographyText}</Typography>
        <Typography size="subparagraph">
          (subparagraph) {typographyText}
        </Typography>
      </Flex>

      <SectionHeading size="h1">DropdownMenu</SectionHeading>
      <Separator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="md" color="gray">
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SectionHeading size="h1">Button</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6' }}>
        <Typography size="subparagraph">Sizes:</Typography>
        <Button size="md" color="gray">
          (md) Button
        </Button>
        <Button size="lg" color="gray">
          (lg) Button
        </Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Typography size="subparagraph">Colors:</Typography>
        <Button color="gray">(gray) Button</Button>
        <Button color="orange">(orange) Button</Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Typography size="subparagraph">Variants:</Typography>
        <Button variant="solid">(solid) Button</Button>
        <Button variant="ghost">(ghost) Button</Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Typography size="subparagraph">Some examples mixed:</Typography>
        <Button size="lg" variant="ghost" color="orange">
          (lg, ghost, orange) Button
        </Button>
      </Box>

      <SectionHeading size="h1">IconButton</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6' }}>
        <IconButton>
          <Cross1Icon />
        </IconButton>
      </Box>

      <SectionHeading size="h1">Input</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', pb: '$5' }}>
        <FormControlGroup>
          <FormInput type="text" placeholder="Enter your email" />
          <Button>Submit</Button>
        </FormControlGroup>
      </Box>
    </Container>
  );
};

export default DesignSystem;
