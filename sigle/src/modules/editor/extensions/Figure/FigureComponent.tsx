import { NodeViewWrapper } from '@tiptap/react';
import { LoadingSpinner } from '../../../../ui';

interface FigureComponentProps {
  node: {
    attrs: {
      loading: boolean;
    };
  };
}

export const FigureComponent = (props: FigureComponentProps) => {
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
    </NodeViewWrapper>
  );
};
