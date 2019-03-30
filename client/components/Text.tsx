import { Text as RebassText, TextProps as RebassTextProps } from 'rebass';

interface TextProps extends RebassTextProps {
  fontFamily?: 'roboto' | 'baskerville';
}

export const Text = (props: TextProps) => (
  <RebassText fontFamily="roboto" color="black" {...props} />
);
