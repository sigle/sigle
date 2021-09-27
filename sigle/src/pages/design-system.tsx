import { styled } from '../stitches.config';
import { Container, Heading, Text } from '../ui';

const Separator = styled('div', {
  borderBottom: '1px solid $gray7',
  mt: '$2',
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

      <Heading size="5xl" css={{ mt: '$2' }}>
        (5xl) {typographyText}
      </Heading>
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
      <Text size="md" css={{ mt: '$2' }}>
        (md) {typographyText}
      </Text>
      <Text size="sm" css={{ mt: '$2' }}>
        (sm) {typographyText}
      </Text>
      <Text size="xs" css={{ mt: '$2' }}>
        (xs) {typographyText}
      </Text>
    </Container>
  );
};

export default DesignSystem;
