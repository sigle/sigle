import { useCallback, useState } from 'react';
import { CameraIcon, TrashIcon } from '@radix-ui/react-icons';
import { useDropzone } from 'react-dropzone';
import { styled } from '../../stitches.config';
import { Box, Button, IconButton } from '../../ui';
import { resizeImage } from '../../utils/image';
import { Story } from '../../types';
import { storage } from '../../utils/blockstack';

const StyledImage = styled('img', {
  variants: {
    loading: {
      true: {
        opacity: 0.25,
      },
    },
  },
});

interface CoverImageProps {
  story: Story;
  setStoryFile: (story: Story) => void;
}

export const CoverImage = ({ story, setStoryFile }: CoverImageProps) => {
  const [loadingSave, setLoadingSave] = useState(false);

  const handleRemoveCoverImage = () => {
    setStoryFile({ ...story, coverImage: undefined });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file: File | undefined = acceptedFiles[0];
    if (!file) return;
    const [mime] = file.type.split('/');
    if (mime !== 'image') return;

    // We show a preview of  the image image as uploading can take a while...
    const preview = URL.createObjectURL(file);
    setLoadingSave(true);
    setStoryFile({ ...story, coverImage: preview });

    const blob = await resizeImage(file, { maxWidth: 2000 });
    const now = new Date().getTime();
    const name = `photos/${story.id}/${now}-${file.name}`;
    const coverImageUrl = await storage.putFile(name, blob, {
      encrypt: false,
      contentType: blob.type,
    });

    setLoadingSave(false);
    setStoryFile({ ...story, coverImage: coverImageUrl });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg,image/png',
  });

  const coverImage = story.coverImage;

  return (
    <>
      {!coverImage ? (
        <Box css={{ mt: '$5' }} {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            variant="ghost"
            css={{ color: '$gray9', gap: '$1' }}
            type="submit"
          >
            <CameraIcon />
            Add cover image
          </Button>
        </Box>
      ) : (
        <Box
          css={{
            margin: '2em auto',
            display: 'flex',
            justifyContent: 'center',
          }}
          className="not-prose"
        >
          <Box css={{ position: 'relative' }}>
            <StyledImage src={coverImage} loading={loadingSave} />
            <IconButton
              css={{ position: 'absolute', top: '$2', right: '$2' }}
              variant="solid"
              title="Remove cover image"
              onClick={handleRemoveCoverImage}
            >
              <TrashIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );
};
