import { Cross1Icon } from '@radix-ui/react-icons';
import { styled } from '../stitches.config';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  IconButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui';

const Separator = styled('div', {
  borderBottom: '1px solid $gray7',
  mt: '$2',
  mb: '$4',
});

const SectionHeading = styled(Heading, {
  mt: '$10',
  textAlign: 'right',
});

const DesignSystem = () => {
  const typographyText = 'A better internet, built on Bitcoin.';

  return (
    <Container>
      <SectionHeading size="4xl">Heading</SectionHeading>
      <Separator />

      <Heading size="5xl">(5xl) {typographyText}</Heading>
      <Heading size="4xl" css={{ mt: '$2' }}>
        (4xl) {typographyText}
      </Heading>
      <Heading size="3xl" css={{ mt: '$2' }}>
        (3xl) {typographyText}
      </Heading>
      <Heading size="2xl" css={{ mt: '$2' }}>
        (2xl) {typographyText}
      </Heading>
      <Heading size="xl" css={{ mt: '$2' }}>
        (xl) {typographyText}
      </Heading>

      <SectionHeading size="4xl">Text</SectionHeading>
      <Separator />
      <Text size="md">(md) {typographyText}</Text>
      <Text size="sm" css={{ mt: '$2' }}>
        (sm) {typographyText}
      </Text>
      <Text size="xs" css={{ mt: '$2' }}>
        (xs) {typographyText}
      </Text>

      <SectionHeading size="4xl">DropdownMenu</SectionHeading>
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

      <SectionHeading size="4xl">Button</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6' }}>
        <Text size="sm">Sizes:</Text>
        <Button size="md" color="gray">
          (md) Button
        </Button>
        <Button size="lg" color="gray">
          (lg) Button
        </Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Text size="sm">Colors:</Text>
        <Button color="gray">(gray) Button</Button>
        <Button color="orange">(orange) Button</Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Text size="sm">Variants:</Text>
        <Button variant="solid">(solid) Button</Button>
        <Button variant="ghost">(ghost) Button</Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6', mt: '$4' }}>
        <Text size="sm">Some examples mixed:</Text>
        <Button size="lg" variant="ghost" color="orange">
          (lg, ghost, orange) Button
        </Button>
      </Box>

      <SectionHeading size="4xl">IconButton</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$6' }}>
        <IconButton>
          <Cross1Icon />
        </IconButton>
      </Box>
    </Container>
  );
};

export default DesignSystem;
