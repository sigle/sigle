import {
  Heading as RebassHeading,
  HeadingProps as RebassHeadingProps,
} from 'rebass';

interface HeadingProps extends RebassHeadingProps {
  fontFamily?: 'roboto' | 'baskerville';
}

export const Heading = (props: HeadingProps) => (
  <RebassHeading fontFamily="baskerville" color="black" {...props} />
);
