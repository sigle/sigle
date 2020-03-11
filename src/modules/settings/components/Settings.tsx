import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { useFormik } from 'formik';
import { BlockPicker } from 'react-color';
import { DashboardLayout } from '../../layout';
import { DashboardPageContainer } from '../../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../../layout/components/DashboardHeader';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../../components';
import { colors } from '../../../utils/colors';

const FormRow = styled.div`
  ${tw`py-3`};
`;

const FormLabel = styled.label`
  ${tw`w-full block tracking-wide font-bold text-black mb-2`};
`;

const FormInput = styled.input`
  ${tw`appearance-none block w-full bg-white border border-grey rounded py-3 px-3 text-sm leading-tight focus:outline-none`};
`;

const FormColor = styled.div<{ color: string }>`
  ${tw`p-3 text-white rounded cursor-pointer relative`};
  ${props =>
    css`
      background-color: ${props.color};
    `}
`;

export const Settings = () => {
  const { user } = useAuth();
  const [colorOpen, setColorOpen] = useState(false);
  const formik = useFormik({
    initialValues: {
      siteName: '',
      siteColor: '',
    },
    validate: () => {
      // TODO validate name length
      // TODO validate hex code format
      return {};
    },
    onSubmit: values => {
      // TODO filter and remove empty strings
      alert(JSON.stringify(values, null, 2));
    },
  });

  if (!user) {
    return null;
  }

  const loadingSave = false;

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle title="Settings" />

        <form onSubmit={formik.handleSubmit}>
          <FormRow>
            <FormLabel>Name</FormLabel>
            <FormInput
              name="siteName"
              placeholder={user.username}
              value={formik.values.siteName}
              onChange={formik.handleChange}
            />
          </FormRow>

          <FormRow>
            <FormLabel>Primary color</FormLabel>
            <FormColor
              color={formik.values.siteColor || colors.pink}
              onClick={() => setColorOpen(true)}
            >
              {formik.values.siteColor || colors.pink}
              {colorOpen && (
                <div style={{ position: 'absolute', zIndex: 2, top: 52 }}>
                  <div
                    style={{
                      position: 'fixed',
                      top: '0px',
                      right: '0px',
                      bottom: '0px',
                      left: '0px',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setColorOpen(false);
                    }}
                  />
                  <BlockPicker
                    color={formik.values.siteColor || colors.pink}
                    onChange={newColor =>
                      formik.setFieldValue('siteColor', newColor.hex)
                    }
                  />
                </div>
              )}
            </FormColor>
          </FormRow>

          <Button disabled={loadingSave} type="submit">
            {loadingSave ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
