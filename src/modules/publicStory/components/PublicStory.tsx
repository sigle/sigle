import React, { useEffect, useState } from 'react';
import * as blockstack from 'blockstack';
import { RouteComponentProps } from 'react-router';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import dompurify from 'dompurify';
import { Story } from '../../../types';
import { Container } from '../../../components';

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            return <img src={src} />;
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
      if (obj.type === 'image') {
        console.log(obj.type, obj.data.get('src'), obj.toString());
      }

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
];

const html = new Html({ rules });

const Title = styled.div`
  ${tw`text-2xl mt-16 font-bold`};
`;

const Content = styled.div`
  ${tw`text-base mt-8 mb-16`};

  p {
    ${tw`mb-2`};
  }

  img {
    ${tw`mb-2`};
    display: block;
    max-width: 100%;
    max-height: 20em;
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
      alert(error.message);
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
    return <Container>File not found</Container>;
  }

  return (
    <Container>
      <Title>{file.title}</Title>
      <Content
        dangerouslySetInnerHTML={{
          __html: dompurify.sanitize(
            html.serialize(Value.fromJSON(file.content))
          ),
        }}
      />
    </Container>
  );
};
