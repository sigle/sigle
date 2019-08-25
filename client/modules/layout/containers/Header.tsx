import React, { useState, useContext } from 'react';
import { getConfig } from 'radiks';
import { toast } from 'react-toastify';
import Router from 'next/router';
import { UserContext } from '../../../context/UserContext';
import { PrivateStory } from '../../../models';
import { getEditorRoute } from '../../../utils/routes';
import { Header as Component } from '../components/Header';

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [createStoryLoading, setCreateStoryLoading] = useState<boolean>(false);
  const { user, sigleUser, loading } = useContext(UserContext);

  const handleLogout = () => {
    const { userSession } = getConfig();
    userSession.signUserOut();
    window.location.href = '/discover';
  };

  // TODO remove once issue is fixed on blockstack side
  const handleLogin = () => {
    const { userSession } = getConfig();
    userSession.redirectToSignIn();
  };

  const handleNewStory = async () => {
    setCreateStoryLoading(true);
    try {
      const privateStory = new PrivateStory({
        title: '',
        content: '',
      });
      await privateStory.save();
      const editorRoute = getEditorRoute({
        storyId: privateStory._id,
        radiksType: privateStory.attrs.radiksType,
      });
      Router.push(editorRoute.href, editorRoute.as);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setCreateStoryLoading(false);
    }
  };

  return (
    <Component
      loading={!!loading}
      user={user}
      createStoryLoading={createStoryLoading}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      loginOpen={loginOpen}
      setLoginOpen={setLoginOpen}
      handleLogin={handleLogin}
      handleLogout={handleLogout}
      handleNewStory={handleNewStory}
    />
  );
};
