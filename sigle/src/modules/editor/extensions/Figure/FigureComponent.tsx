import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { LoadingSpinner } from '../../../../ui';

interface FigureComponentProps {
  node: {
    attrs: {
      loading: boolean;
      src: string;
      alt: string;
    };
  };
}

export const FigureComponent = (props: FigureComponentProps) => {
  console.log(props.node);

  return (
    <NodeViewWrapper data-drag-handle>
      {props.node.attrs.loading && (
        <LoadingSpinner
          css={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        />
      )}
      <figure>
        <img src={props.node.attrs.src} alt={props.node.attrs.alt} />
        <NodeViewContent as="figcaption" />
      </figure>
    </NodeViewWrapper>
  );
};
