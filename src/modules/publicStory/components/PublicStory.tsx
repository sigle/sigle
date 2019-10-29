import React, { useEffect, useState } from 'react';
import * as blockstack from 'blockstack';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import dompurify from 'dompurify';
import { toast } from 'react-toastify';
import format from 'date-fns/format';
import { Story } from '../../../types';
import { Container } from '../../../components';
import { NotFound } from '../../layout/components/NotFound';
import { Link } from 'react-router-dom';

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            return <img src={src} />;
          case 'list-item':
            return <li>{children}</li>;
          case 'numbered-list':
            return <ol>{children}</ol>;
          case 'bulleted-list':
            return <ul>{children}</ul>;
          case 'heading-one':
            return <h1>{children}</h1>;
          case 'heading-two':
            return <h2>{children}</h2>;
          case 'heading-three':
            return <h3>{children}</h3>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'inline') {
        switch (obj.type) {
          case 'link':
            const href = obj.data.get('href');
            return <a href={href}>{children}</a>;
        }
      }
    },
  },
];

const html = new Html({ rules });

export const Header = styled.div`
  ${tw`bg-black py-4 text-white`};
`;

export const HeaderContainer = styled.div`
  ${tw`mx-auto px-4 flex`};
  width: 100%;
  max-width: 1000px;
`;

export const HeaderTitle = styled.div`
  ${tw`font-bold`};
`;

export const HeaderLink = styled(Link)`
  ${tw`text-white no-underline ml-8`};
`;

const StyledContainer = styled(Container)<{ hasCover: boolean }>`
  max-width: 850px;

  ${props =>
    !props.hasCover &&
    css`
      .sigle-content {
        ${tw`mt-16`};
      }
    `}
`;

const Title = styled.div`
  ${tw`text-4xl mt-16 font-bold text-center`};
  font-family: 'Libre Baskerville', serif;
`;

const StoryDate = styled.div`
  ${tw`text-sm mt-4 text-center text-pink`};
`;

const CoverImage = styled.img`
  ${tw`mt-8`};
  display: block;
  max-width: 100%;
`;

export const Content = styled.div`
  ${tw`text-base mt-8 mb-16 leading-tight`};

  p,
  ol,
  ul {
    ${tw`mb-4`};
  }

  p {
    min-height: 1rem;
  }

  a {
    ${tw`text-pink`};
  }

  img {
    ${tw`mb-4`};
    display: block;
    max-width: 100%;
    max-height: 100em;
  }

  blockquote {
    ${tw`mb-4 py-4 px-4 italic text-sm`};
    border-left: 3px solid #ccc;
    font-family: 'Libre Baskerville', serif;
    letter-spacing: 0.01rem;
  }

  li + li {
    ${tw`mt-2`};
  }

  h1 {
    ${tw`mt-6 mb-4 text-4xl`};
    font-family: 'Libre Baskerville', serif;
  }

  h2 {
    ${tw`mt-6 mb-4 text-3xl`};
    font-family: 'Libre Baskerville', serif;
  }

  h3 {
    ${tw`mt-6 mb-4 text-2xl`};
    font-family: 'Libre Baskerville', serif;
  }
`;

type Props = RouteComponentProps<{ username: string; storyId: string }>;

export const PublicStory = ({ match }: Props) => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<Story | null>(null);

  const getUserFile = async () => {
    setLoading(true);
    try {
      let fileUrl = await blockstack.getUserAppFileUrl(
        match.params.storyId,
        match.params.username,
        window.location.origin
      );
      if (fileUrl) {
        fileUrl = `${fileUrl}.json`;
        const data = await fetch(fileUrl);
        if (data.status === 200) {
          const json = await data.json();
          setFile(json);
        }
      }
      setLoading(false);
    } catch (error) {
      // If story not found do nothing
      if (error.message === 'Name not found') {
        setLoading(false);
        return;
      }
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserFile();
  }, [false]);

  if (loading) {
    return <Container>Loading ...</Container>;
  }

  if (!file) {
    return <NotFound error="File not found" />;
  }

  return (
    <React.Fragment>
      <Header>
        <HeaderContainer>
          <HeaderTitle>{match.params.username}</HeaderTitle>
          <HeaderLink to={`/${match.params.username}`}>Stories</HeaderLink>
        </HeaderContainer>
      </Header>
      <StyledContainer hasCover={!!file.coverImage}>
        <Helmet>
          <title>{file.title}</title>
        </Helmet>
        <Title className="sigle-title">{file.title}</Title>
        <StoryDate className="sigle-date">
          {format(file.createdAt, 'dd MMMM yyyy')}
        </StoryDate>
        {file.coverImage && (
          <CoverImage className="sigle-cover" src={file.coverImage} />
        )}
        <Content
          className="sigle-content"
          dangerouslySetInnerHTML={{
            __html: dompurify.sanitize(
              html.serialize(Value.fromJSON(file.content))
            ),
          }}
        />
      </StyledContainer>
    </React.Fragment>
  );
};
