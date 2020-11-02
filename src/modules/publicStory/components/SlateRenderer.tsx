import React from 'react';
import { Node, Text } from 'slate';

interface ElementProps {
  node: Node;
  children: React.ReactNode;
}

const Element = ({ node, children }: ElementProps) => {
  switch (node.type) {
    case 'paragraph':
      return <p>{children}</p>;
    case 'block-quote':
      return <blockquote>{children}</blockquote>;
    // case 'image':
    //   const src = obj.data.get('src');
    //   // eslint-disable-next-line
    //   return <img src={src} />;
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
    default:
      return children as React.ReactElement<any>;
  }
};

interface LeafProps {
  node: Node;
  children: React.ReactNode;
}

const Leaf = ({ node, children }: LeafProps) => {
  if (node.bold) {
    children = <strong>{children}</strong>;
  }
  if (node.code) {
    children = <code>{children}</code>;
  }
  if (node.italic) {
    children = <em>{children}</em>;
  }
  if (node.underline) {
    children = <u>{children}</u>;
  }
  return children as React.ReactElement<any>;
};

const serialize = (node: Node, index: number) => {
  if (Text.isText(node)) {
    return (
      <Leaf key={index} node={node}>
        {node.text}
      </Leaf>
    );
  }

  const children = node.children.map(serialize);

  return (
    <Element key={index} node={node}>
      {children}
    </Element>
  );
};

interface SlateRendererProps {
  content: Node[];
}

export const SlateRenderer = ({ content }: SlateRendererProps) => {
  return <React.Fragment>{content.map(serialize)}</React.Fragment>;
};
