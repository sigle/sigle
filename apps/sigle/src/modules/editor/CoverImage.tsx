import { useCallback, useState } from 'react';
import { CameraIcon, HandIcon, TrashIcon } from '@radix-ui/react-icons';
import { useDropzone } from 'react-dropzone';
import { styled } from '../../stitches.config';
import { Box, Button, IconButton } from '../../ui';
import { resizeImage } from '../../utils/image';
import { Story } from '../../types';
import { storage } from '../../utils/blockstack';
import { ErrorMessage } from '../../ui/ErrorMessage';

const StyledImage = styled('img', {
  maxWidth: '100vw',
  '@md': {
    maxWidth: '100%',
  },
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
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
    },
    [story],
  );
  const { getRootProps, getInputProps, fileRejections, isDragActive } =
    useDropzone({
      onDrop,
      accept: 'image/jpeg,image/png',
    });

  return (
    <>
      {!story.coverImage ? (
        <Box css={{ py: '$5', mb: '-$5', display: 'flex' }} {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            size="sm"
            variant="ghostMuted"
            css={{
              gap: '$1',
              flexGrow: isDragActive ? 1 : 0.0001,
              outline: isDragActive ? '2px dashed $colors$gray7' : 'none',
              outlineOffset: '2px',
              transition: 'flex-grow .3s ease',
            }}
            type="submit"
          >
            {!isDragActive && <CameraIcon />}
            {isDragActive ? `Drop your cover image here` : `Add cover image`}
            {isDragActive && <HandIcon />}
          </Button>
        </Box>
      ) : (
        <Box
          css={{
            margin: '$8 auto',
            display: 'flex',
            justifyContent: 'center',
          }}
          className="not-prose"
        >
          <Box
            css={{
              position: 'relative',
              marginLeft: '-$20',
              marginRight: '-$20',
            }}
          >
            <StyledImage src={story.coverImage} loading={loadingSave} />
            <IconButton
              css={{
                position: 'absolute',
                top: '$2',
                right: '$2',
                opacity: 0.7,
              }}
              variant="solid"
              title="Remove cover image"
              onClick={handleRemoveCoverImage}
            >
              <TrashIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      <Box css={{ mt: '$3' }}>
        {fileRejections.length > 0 && (
          <ErrorMessage>
            Wrong file extension. Only Jpegs and PNGs are accepted for cover
            images.
          </ErrorMessage>
        )}
      </Box>
    </>
  );
};
