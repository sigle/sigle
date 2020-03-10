import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
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
  const [color, setColor] = useState(colors.pink);

  if (!user) {
    return null;
  }

  const loadingSave = false;

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle title="Settings" />

        <FormRow>
          <FormLabel>Name</FormLabel>
          <FormInput placeholder={user.username} />
        </FormRow>

        <FormRow>
          <FormLabel>Primary color</FormLabel>
          <FormColor color={color} onClick={() => setColorOpen(true)}>
            {color}
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
                  color={color}
                  onChange={newColor => setColor(newColor.hex)}
                />
              </div>
            )}
          </FormColor>
        </FormRow>

        <Button disabled={loadingSave} type="submit">
          {loadingSave ? 'Saving...' : 'Save'}
        </Button>
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
