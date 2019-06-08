import React, { useContext, useEffect, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { MdLock } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import { getConfig } from 'radiks';
import { Me as MeContainer } from '../modules/layout/components/Me';
import { UserContext } from '../context/UserContext';
import { Container, Button } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { SigleUser } from '../models';
import { User } from '../types';
import { defaultUserImage } from '../utils';

const MeProfile = styled.div`
  ${tw`lg:flex lg:items-center mb-8`};

  img {
    ${tw`w-32 h-32 rounded-full mb-2 lg:mb-0 lg:mr-4`};
  }

  h2 {
    ${tw`text-2xl font-bold`};
  }

  p {
    ${tw`lg:text-sm`};
  }
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

// TODO protect this page, user needs to be connected
export const Settings = () => {
  const { user, loading } = useContext(UserContext);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [sigleUser, setSigleUser] = useState<any>();
  // TODO change this really ugly hack
  const [fakeSigleUser, setFakeSigleUser] = useState<any>();

  // Part to handle the file upload
  const [file, setFile] = useState();
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(
        Object.assign(file, {
          // Create a preview so we can display it
          preview: URL.createObjectURL(file),
        })
      );
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    // TODO try catch
    // TODO need to crop the image
    if (file) {
      const { userSession } = getConfig();
      const now = new Date().getTime();
      const name = `photos/${sigleUser.attrs.username}/${now}-${file.name}`;
      const imageUrl = await userSession.putFile(name, file, {
        encrypt: false,
        contentType: file.type,
      });
      sigleUser.update({
        imageUrl,
      });
    }

    await sigleUser.save();

    // TODO if new picture delete the old one ?
    setSaveLoading(false);
    setFile(undefined);
  };

  const fetchUser = async (blockstackUser: User) => {
    // TODO try catch
    // TODO continue to show loading while fetching this
    const sigleUserResponse = new SigleUser({ _id: blockstackUser.username });
    await sigleUserResponse.fetch();
    setSigleUser(sigleUserResponse);
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUser(user);
    }
  }, [loading]);

  if (loading) {
    // TODO nice loading
    return null;
  }

  if (!user) {
    // TODO protect page
    return null;
  }

  if (!sigleUser) {
    // TODO protect page
    return null;
  }

  const userImage = file
    ? file.preview
    : sigleUser.attrs.imageUrl
    ? sigleUser.attrs.imageUrl
    : defaultUserImage(sigleUser.attrs.username, 130);

  return (
    <React.Fragment>
      <Header />
      <Container>
        <MeContainer>
          <MeProfile>
            <img src={userImage} alt={sigleUser.attrs.username} />
            <div>
              <h2>{sigleUser.attrs.name || sigleUser.attrs.username}</h2>
              <p>{sigleUser.attrs.description}</p>
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
                  // TODO max length validation
                  value={sigleUser.attrs.name}
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
                  value={`${process.env.APP_URL}/@${user.username}`}
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
                  value={sigleUser.attrs.description}
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
      </Container>
      <Footer />
    </React.Fragment>
  );
};
