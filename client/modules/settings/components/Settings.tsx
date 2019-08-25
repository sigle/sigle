import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { MdLock } from 'react-icons/md';
import {
  FullHeightContainer,
  MinHeightContainer,
  Container,
  Button,
} from '../../../components';
import { Header } from '../../layout/containers/Header';
import { Footer } from '../../layout/components/Footer';
import { Me as MeContainer } from '../../layout/components/Me';
import { config } from '../../../config';
import { RadiksSigleUser, User } from '../../../types';

const MeProfile = styled.div`
  ${tw`lg:flex lg:items-center mb-8`};

  img {
    ${tw`w-32 h-32 rounded-full mb-2 lg:mb-0 lg:mr-4`};
  }
`;

const MeProfileName = styled.p`
  ${tw`text-2xl font-bold`};
`;

const MeProfileUsername = styled.p`
  ${tw`text-sm text-grey-darker`};
`;

const MeProfileDescription = styled.p`
  ${tw`lg:text-sm`};
`;

const FormRow = styled.div`
  ${tw`flex flex-wrap border-t border-solid border-grey`};
`;

const FormRowCol = styled.div<{ center?: boolean }>`
  ${tw`w-full lg:w-1/2 lg:px-3 py-6`};

  ${props =>
    props.center &&
    css`
      ${tw`flex items-center`};
    `}
`;

const FormLabel = styled.label`
  ${tw`w-full block tracking-wide text-black font-bold mb-2`};
`;

const FormLabelIcon = styled(MdLock)`
  ${tw`ml-1 inline-block -mt-2`};
`;

const FormInput = styled.input`
  ${tw`appearance-none block w-full bg-white border border-grey rounded py-3 px-4 text-sm leading-tight focus:outline-none`};

  ${props =>
    props.disabled &&
    css`
      ${tw`bg-grey`};
    `}
`;

const FormTextarea = styled.textarea`
  ${tw`appearance-none block w-full bg-white border border-grey rounded py-3 px-4 text-sm leading-tight focus:outline-none`};
`;

const FormImage = styled.img`
  ${tw`inline-block w-16 h-16 rounded-full mb-2 lg:mb-0 mr-4`};
`;

const FormText = styled.p`
  ${tw`lg:text-sm`};
`;

interface Props {
  isLoading: boolean;
  saveLoading: boolean;
  sigleUser?: RadiksSigleUser;
  user?: User;
  setFakeSigleUser: React.Dispatch<any>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  getRootProps: any;
  getInputProps: any;
  userImage?: string;
}

export const Settings = ({
  isLoading,
  saveLoading,
  sigleUser,
  user,
  setFakeSigleUser,
  handleSubmit,
  getRootProps,
  getInputProps,
  userImage,
}: Props) => {
  return (
    <FullHeightContainer>
      <Header />
      <MinHeightContainer>
        <Container>
          {isLoading && (
            <MeContainer>
              <div>Loading ...</div>
            </MeContainer>
          )}

          {!isLoading && user && sigleUser && (
            <MeContainer>
              <MeProfile>
                <img src={userImage} alt={sigleUser.attrs.username} />
                <div>
                  <MeProfileName>{sigleUser.attrs.name}</MeProfileName>
                  <MeProfileUsername>
                    {sigleUser.attrs.username}
                  </MeProfileUsername>
                  <MeProfileDescription>
                    {sigleUser.attrs.description}
                  </MeProfileDescription>
                </div>
              </MeProfile>

              <form onSubmit={handleSubmit}>
                <FormRow>
                  <FormRowCol>
                    <FormLabel>Name</FormLabel>
                    <FormInput
                      id="name"
                      type="text"
                      placeholder="Julia Doe"
                      maxLength={100}
                      value={sigleUser.attrs.name || ''}
                      onChange={e => {
                        const update = {
                          name: e.target.value,
                        };
                        sigleUser.update(update);
                        setFakeSigleUser(update);
                      }}
                    />
                  </FormRowCol>
                  <FormRowCol center={true}>
                    <FormText>
                      Readers will see this name next to your stories.
                      <br />
                      You can choose your real name or it can remain secret.
                      <br />
                      <br />
                      Your pick!
                    </FormText>
                  </FormRowCol>
                </FormRow>

                <FormRow>
                  <FormRowCol>
                    <FormLabel>
                      Profile URL <FormLabelIcon size={18} />
                    </FormLabel>
                    <FormInput
                      id="profile-url"
                      type="text"
                      value={`${config.appUrl}/@${user.username}`}
                      disabled
                    />
                  </FormRowCol>
                  <FormRowCol center={true}>
                    <FormText>
                      You will access your profile page by following this URL.
                      <br />
                      This URL is linked to your Blockstack id.
                    </FormText>
                  </FormRowCol>
                </FormRow>

                <FormRow>
                  <FormRowCol>
                    <FormLabel>Profile picture</FormLabel>
                    <div {...getRootProps()}>
                      <FormImage src={userImage} alt="Profile picture" />
                      <input {...getInputProps()} />
                      <Button variant="outline" color="primary">
                        Change
                      </Button>
                    </div>
                  </FormRowCol>
                  <FormRowCol center={true}>
                    <FormText>
                      This picture will be resized to 200px by 200px.
                      <br />
                      Supported image types are JPEG, and PNG.
                    </FormText>
                  </FormRowCol>
                </FormRow>

                <FormRow>
                  <FormRowCol>
                    <FormLabel>About Yourself</FormLabel>
                    <FormTextarea
                      id="description"
                      placeholder="Tell us about yourself"
                      maxLength={200}
                      rows={4}
                      value={sigleUser.attrs.description || ''}
                      onChange={e => {
                        const update = {
                          description: e.target.value,
                        };
                        sigleUser.update(update);
                        setFakeSigleUser(update);
                      }}
                    />
                  </FormRowCol>
                  <FormRowCol center={true}>
                    <FormText>
                      This quick description will help people who come to your
                      profile know who you are, your hobbies and more.
                    </FormText>
                  </FormRowCol>
                </FormRow>

                <FormRow>
                  <FormRowCol>
                    <Button color="primary" disabled={saveLoading}>
                      {saveLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </FormRowCol>
                </FormRow>
              </form>
            </MeContainer>
          )}
        </Container>
        <Footer />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};
