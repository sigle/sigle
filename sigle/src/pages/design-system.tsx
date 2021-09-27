import { styled } from '../stitches.config';
import { Box, Container, Heading, Text, Button } from '../ui';

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

      <SectionHeading size="4xl">Button</SectionHeading>
      <Separator />
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
        <Text size="sm">Sizes:</Text>
        <Button size="md" color="gray">
          (md) Button
        </Button>
        <Button size="lg" color="gray">
          (lg) Button
        </Button>
      </Box>
      <Box css={{ display: 'flex', alignItems: 'center', gap: '$3', mt: '$4' }}>
        <Text size="sm">Colors:</Text>
        <Button color="ghost" css={{ mr: '$4' }}>
          (ghost) Button
        </Button>
        <Button color="gray" css={{ mr: '$4' }}>
          (gray) Button
        </Button>
        <Button color="orange">(orange) Button</Button>
      </Box>

      <SectionHeading size="4xl">Dropdown menu</SectionHeading>
      <Separator />
    </Container>
  );
};

export default DesignSystem;
