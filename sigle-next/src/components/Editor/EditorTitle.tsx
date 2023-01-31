import { styled } from '@sigle/stitches.config';
import { useEditorStore } from './store';

const StyledInput = styled('input', {
  // Here we copy the styles of the prose h1
  fontSize: '$3xl',
  lineHeight: '$3xl',
  backgroundColor: 'transparent',
  outline: 'none',
  width: '100%',

  '::placeholder': {
    color: '$gray8',
  },
});

export const EditorTitle = () => {
  const storyTitle = useEditorStore((state) => state.story?.title);

  return (
    <StyledInput
      placeholder="Title..."
      value={storyTitle}
      onChange={(e) =>
        useEditorStore.setState({ story: { title: e.target.value } })
      }
    />
  );
};
