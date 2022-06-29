import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useFormik, FormikErrors } from 'formik';
import { useDropzone } from 'react-dropzone';
import { CameraIcon, UpdateIcon } from '@radix-ui/react-icons';
import { BlockPicker } from 'react-color';
import { SettingsFile } from '../../types';
import { hexRegex } from '../../utils/regex';
import { storage } from '../../utils/blockstack';
import { getSettingsFile, isValidHttpUrl, saveSettingsFile } from '../../utils';
import { resizeImage } from '../../utils/image';
import { colors } from '../../utils/colors';
import {
  Box,
  Button,
  Typography,
  FormRow,
  FormLabel,
  FormInput,
  FormTextarea,
  FormHelperError,
  FormHelper,
} from '../../ui';
import { darkTheme, styled } from '../../stitches.config';
import { useQueryClient } from 'react-query';
import { generateAvatar } from '../../utils/boringAvatar';
import { useAuth } from '../auth/AuthContext';
import { useGetUserSettings } from '../../hooks/appData';

const UnsavedChangesContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  br: '$2',
  boxShadow:
    '0px 8px 20px rgba(8, 8, 8, 0.06), 0px 10px 18px rgba(8, 8, 8, 0.04), 0px 5px 14px rgba(8, 8, 8, 0.04), 0px 3px 8px rgba(8, 8, 8, 0.04), 0px 1px 5px rgba(8, 8, 8, 0.03), 0px 1px 2px rgba(8, 8, 8, 0.02), 0px 0.2px 1px rgba(8, 8, 8, 0.01)',
  position: 'sticky',
  bottom: '$5',
  px: '$5',
  py: '$3',
  overflow: 'hidden',

  [`.${darkTheme} &`]: {
    boxShadow:
      '0px 8px 20px rgba(8, 8, 8, 0.32), 0px 10px 18px rgba(8, 8, 8, 0.28), 0px 5px 14px rgba(8, 8, 8, 0.26), 0px 3px 8px rgba(8, 8, 8, 0.16), 0px 1px 5px rgba(8, 8, 8, 0.14), 0px 1px 2px rgba(8, 8, 8, 0.12), 0px 0.2px 1px rgba(8, 8, 8, 0.08)',
  },
});

const FormColor = styled('div', {
  py: '$1',
  color: 'white',
  br: '$1',
  cursor: 'pointer',
  position: 'relative',
  display: 'inline-block',
  textAlign: 'center',
  width: 150,
});

const ImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  br: '$4',
  overflow: 'hidden',
  position: 'relative',
  width: 92,
  height: 92,

  '&::before': {
    content: '',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '$gray11',
    opacity: 0,
    transition: '.2s',

    [`.${darkTheme} &`]: {
      backgroundColor: '$colors$gray1',
    },
  },
});

const ImageEmptyIconAdd = styled('div', {
  position: 'absolute',
  bottom: 0,
  right: 0,
  p: '$2',
  color: '$gray1',

  [`.${darkTheme} &`]: {
    color: '$gray11',
  },
});

const ImageEmptyIconUpdate = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: '$gray1',

  [`.${darkTheme} &`]: {
    color: '$gray11',
  },
});

const Image = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 92,
  maxHeight: 92,
  objectFit: 'cover',
  cursor: 'pointer',
});

interface SettingsFormValues {
  siteName: string;
  siteDescription: string;
  siteColor: string;
  siteLogo: string;
  siteUrl: string;
  siteTwitterHandle: string;
}

interface SettingsFormProps {
  settings: SettingsFile;
  username: string;
}

export const SettingsForm = ({ settings, username }: SettingsFormProps) => {
  const { data: userSettings } = useGetUserSettings();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [colorOpen, setColorOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<
    (Blob & { preview: string; name: string }) | undefined
  >();
  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      siteColor: settings.siteColor || '',
      siteLogo: settings.siteLogo || '',
      siteUrl: settings.siteUrl || '',
      siteTwitterHandle: settings.siteTwitterHandle || '',
    },
    validate: (values) => {
      const errors: FormikErrors<SettingsFormValues> = {};

      if (values.siteName && values.siteName.length > 50) {
        errors.siteName = 'Name too long';
      }
      if (values.siteDescription && values.siteDescription.length > 350) {
        errors.siteName = 'Description too long';
      }
      if (values.siteColor && !values.siteColor.match(hexRegex)) {
        errors.siteColor = 'Invalid color, only hexadecimal colors are allowed';
      }
      if (values.siteUrl && !isValidHttpUrl(values.siteUrl)) {
        errors.siteUrl = 'Invalid website entered (eg: https://example.com)';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      const newSettings: SettingsFile = {};
      (Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
        // We replace empty strings by undefined
        newSettings[key] = values[key] ? values[key] : undefined;
      });

      const settingsFile = await getSettingsFile();

      if (customLogo) {
        const now = new Date().getTime();
        const name = `photos/settings/${now}-${customLogo.name}`;
        const coverImageUrl = await storage.putFile(name, customLogo as any, {
          encrypt: false,
          contentType: customLogo.type,
        });
        newSettings.siteLogo = coverImageUrl;
      }

      const handle = formik.values.siteTwitterHandle;
      formik.values.siteTwitterHandle = handle.split('/').pop() as string;
      formik.values.siteTwitterHandle = handle.replace('@', '');

      newSettings.siteTwitterHandle = formik.values.siteTwitterHandle;

      await saveSettingsFile({
        ...settingsFile,
        ...newSettings,
      });

      if (customLogo) {
        formik.setFieldValue('siteLogo', newSettings.siteLogo);
        setCustomLogo(undefined);
      }

      formik.resetForm({ values });
      await queryClient.invalidateQueries('user-settings');
      toast.success('Settings saved');
      setSubmitting(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const [mime] = file.type.split('/');
      if (mime !== 'image') {
        return;
      }

      const blob = await resizeImage(file, { maxWidth: 2000 });
      setCustomLogo(
        Object.assign(blob, {
          name: file.name,
        })
      );
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

  const coverImageUrl = customLogo
    ? customLogo.preview
    : userSettings?.siteLogo;

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormRow>
        <FormLabel>Profile Image</FormLabel>
        <ImageContainer
          css={{
            '&:hover::before': {
              opacity: 0.6,
            },
            '&:active::before': {
              opacity: 0.8,
            },
          }}
          {...getRootProps({ tabIndex: undefined })}
        >
          <ImageEmptyIconUpdate
            css={{
              '& svg': {
                display: 'none',
              },
              '&:hover': {
                '& svg': {
                  display: 'block',
                },
              },
            }}
          >
            <UpdateIcon />
          </ImageEmptyIconUpdate>
          <Image
            src={coverImageUrl ? coverImageUrl : generateAvatar(userAddress)}
          />
          <input {...getInputProps()} />
          <ImageEmptyIconAdd>
            <CameraIcon />
          </ImageEmptyIconAdd>
        </ImageContainer>
        <FormHelper>Recommended size: 92x92px</FormHelper>
      </FormRow>

      <FormRow>
        <FormLabel>Name</FormLabel>
        <FormInput
          name="siteName"
          type="text"
          maxLength={50}
          placeholder={username}
          value={formik.values.siteName}
          onChange={formik.handleChange}
        />
        <FormHelper>
          This name will be displayed on your profile page
        </FormHelper>
        {formik.errors.siteName && (
          <FormHelperError>{formik.errors.siteName}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Description</FormLabel>
        <FormTextarea
          name="siteDescription"
          rows={3}
          maxLength={350}
          value={formik.values.siteDescription}
          onChange={formik.handleChange}
          placeholder="Describe yourself in a few words..."
        />
        <FormHelper>Max. 350 characters</FormHelper>
        {formik.errors.siteDescription && (
          <FormHelperError>{formik.errors.siteDescription}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Website</FormLabel>
        <FormInput
          name="siteUrl"
          type="text"
          maxLength={100}
          placeholder="https://"
          value={formik.values.siteUrl}
          onChange={formik.handleChange}
        />
        <FormHelper>Max. 100 characters</FormHelper>
        {formik.errors.siteUrl && (
          <FormHelperError>{formik.errors.siteUrl}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Twitter Handle</FormLabel>
        <FormInput
          name="siteTwitterHandle"
          type="text"
          maxLength={50}
          value={formik.values.siteTwitterHandle}
          onChange={formik.handleChange}
          placeholder="@"
        />
        <FormHelper>Enter your Twitter handle</FormHelper>
        {formik.errors.siteTwitterHandle && (
          <FormHelperError>{formik.errors.siteTwitterHandle}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Primary color</FormLabel>
        <FormColor
          css={{ backgroundColor: formik.values.siteColor || colors.pink }}
          onClick={() => setColorOpen(true)}
        >
          {formik.values.siteColor || colors.pink}
          {colorOpen && (
            <div style={{ position: 'absolute', zIndex: 2, top: 52, left: 0 }}>
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setColorOpen(false);
                }}
              />
              <BlockPicker
                color={formik.values.siteColor || colors.pink}
                onChange={(newColor) =>
                  formik.setFieldValue('siteColor', newColor.hex)
                }
                colors={['#ff576a', '#34c58b', '#e0a315', '#5b15e0', '#949494']}
              />
            </div>
          )}
        </FormColor>
        <FormHelper>Choose a custom color for your links</FormHelper>
        {formik.errors.siteColor && (
          <FormHelperError>{formik.errors.siteColor}</FormHelperError>
        )}
      </FormRow>
      {formik.dirty ||
        (customLogo && (
          <UnsavedChangesContainer>
            <Box
              css={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                zIndex: -1,
                backgroundColor: '$gray1',
                opacity: 0.95,
              }}
            />
            <Typography size="subheading" css={{ fontWeight: 600 }}>
              You have unsaved changes
            </Typography>
            <Button
              disabled={formik.isSubmitting}
              type="submit"
              size="md"
              color="orange"
            >
              {formik.isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </UnsavedChangesContainer>
        ))}
    </form>
  );
};
