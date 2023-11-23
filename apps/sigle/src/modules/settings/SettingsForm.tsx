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
import { colors, getContrastingColor } from '../../utils/colors';
import {
  FormRow,
  FormLabel,
  FormInput,
  FormTextarea,
  FormHelperError,
  FormHelper,
} from '../../ui';
import { darkTheme, styled } from '../../stitches.config';
import { useQueryClient } from '@tanstack/react-query';
import { generateAvatar } from '../../utils/boringAvatar';
import { useAuth } from '../auth/AuthContext';
import { useGetUserSettings } from '../../hooks/appData';
import { UnsavedChanges } from './components/UnsavedChanges';

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

      const mergedSettings = {
        ...settingsFile,
        ...newSettings,
      };
      await saveSettingsFile(mergedSettings);
      queryClient.setQueriesData(['user-settings'], mergedSettings);

      if (customLogo) {
        setCustomLogo(undefined);
      }

      formik.resetForm({ values: { ...values, ...newSettings } });
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
        }),
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
      <FormRow css={{ maxWidth: 300 }}>
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
        <FormHelper>
          This image appears in your Profile page, Explore page , Custom domain
          and story cards. Your image should be square, at least 92x92px, and
          JPG, PNG or GIF format.
        </FormHelper>
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
          css={{
            backgroundColor: formik.values.siteColor || colors.pink,
            color: getContrastingColor(formik.values.siteColor || colors.pink),
          }}
          onClick={() => setColorOpen(true)}
        >
          {formik.values.siteColor || colors.pink}
          {colorOpen && (
            <div
              style={{ position: 'absolute', zIndex: 2, top: -150, left: 160 }}
            >
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
                styles={{
                  default: {
                    input: {
                      backgroundColor: 'white',
                    },
                  },
                }}
                triangle="hide"
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
      {(formik.dirty || customLogo) && (
        <UnsavedChanges saving={formik.isSubmitting} />
      )}
    </form>
  );
};
