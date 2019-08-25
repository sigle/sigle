import React, { useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getConfig } from 'radiks';
import { useDropzone } from 'react-dropzone';
import { UserContext } from '../../../context/UserContext';
import { User, RadiksSigleUser } from '../../../types';
import { SigleUser } from '../../../models';
import { defaultUserImage } from '../../../utils';
import { Settings as Component } from '../components/Settings';

export const Settings = () => {
  const { user, loading } = useContext(UserContext);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [sigleUser, setSigleUser] = useState<RadiksSigleUser | undefined>();
  // TODO change this really ugly hack
  // eslint-disable-next-line
  const [fakeSigleUser, setFakeSigleUser] = useState<any | undefined>();

  if (!loading && !user) {
    // TODO show protected page
  }

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
    if (!sigleUser) return;
    setSaveLoading(true);

    try {
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

      // TODO refetch header graphql query so the header preview is updated

      setSaveLoading(false);
      setFile(undefined);
      toast.success('Settings changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
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

  const isLoading = Boolean(loading || !user || !sigleUser);

  const userImage =
    isLoading || !sigleUser
      ? null
      : file
      ? file.preview
      : sigleUser.attrs.imageUrl
      ? sigleUser.attrs.imageUrl
      : defaultUserImage(sigleUser.attrs.username, 130);

  return (
    <Component
      isLoading={isLoading}
      saveLoading={saveLoading}
      sigleUser={sigleUser}
      user={user}
      setFakeSigleUser={setFakeSigleUser}
      handleSubmit={handleSubmit}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      userImage={userImage}
    />
  );
};
