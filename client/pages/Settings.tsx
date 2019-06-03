import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { MdLock } from 'react-icons/md';
import { config } from '../config';
import { UserContext } from '../context/UserContext';
import { Container, Link, Button } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { SigleUser } from '../models';
import { User } from '../types';

export const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

const MeMenu = styled.div`
  ${tw`w-full py-6`};

  @media (min-width: ${config.breakpoints.md}px) {
    width: 200px;
  }

  ul {
    ${tw`flex justify-around lg:flex-col sticky`};
    top: 0;
  }

  a {
    ${tw`py-2 block`};
  }

  .active span {
    ${tw`border-b border-solid border-black font-medium py-1`};
  }
`;

export const MeRight = styled.div`
  ${tw`w-full lg:w-3/4 bg-grey-light py-6 px-6`};

  @media (min-width: ${config.breakpoints.md}px) {
    width: calc(100% - 200px);
  }
`;

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

export const MeLeft = () => (
  <MeMenu>
    <ul>
      <li>
        <Link href="/me">
          <span>My stories</span>
        </Link>
      </li>
      <li>
        <Link href="/me/stats">
          <span>Stats</span>
        </Link>
      </li>
      <li>
        <Link href="/me/settings" className="active">
          <span>Settings</span>
        </Link>
      </li>
    </ul>
  </MeMenu>
);

// TODO protect this page, user needs to be connected
export const Settings = () => {
  const { user, loading } = useContext(UserContext);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [sigleUser, setSigleUser] = useState<any>();
  // TODO change this really ugly hack
  const [fakeSigleUser, setFakeSigleUser] = useState<any>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    console.log(sigleUser);
    // TODO try catch
    await sigleUser.save();
    setSaveLoading(false);
  };

  const fetchUser = async (blockstackUser: User) => {
    // TODO try catch
    // TODO continue to show loading while fetching this
    const sigleUserResponse = new SigleUser({ _id: blockstackUser.username });
    await sigleUserResponse.fetch();
    console.log(sigleUserResponse);
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

  return (
    <React.Fragment>
      <Header />
      <Container>
        <MeContainer>
          <MeLeft />
          <MeRight>
            <MeProfile>
              <img
                src="https://source.unsplash.com/random/100x100"
                alt="TODO"
              />
              <div>
                <h2>{sigleUser.attrs.name || sigleUser.attrs.username}</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                  quis accumsan arcu.
                </p>
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
                    <br />
                    To change it, you'll have to create a new profile.
                  </FormText>
                </FormRowCol>
              </FormRow>

              <FormRow>
                <FormRowCol>
                  <FormLabel>Profile picture</FormLabel>

                  <div>
                    <FormImage
                      src="https://source.unsplash.com/random/100x100"
                      alt="TODO"
                    />
                    <Button variant="outline" color="primary">
                      Change
                    </Button>
                  </div>
                </FormRowCol>
                <FormRowCol center={true}>
                  <FormText>
                    This picture will be resized to 45px by 45px.
                    <br />
                    Supported image types are JPEG, PNG, GIF, and ICO.
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
          </MeRight>
        </MeContainer>
      </Container>
      <Footer />
    </React.Fragment>
  );
};
