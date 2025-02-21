import TipTapPlaceholder from "@tiptap/extension-placeholder";

const Placeholder = (isMobile: boolean) => {
  return TipTapPlaceholder.configure({
    showOnlyWhenEditable: true,
    includeChildren: true,
    placeholder: ({ editor, node, pos }) => {
      if (node.type.name === "heading") {
        const level = node.attrs.level as number;
        if (level === 2) {
          return "Big Heading";
        } else if (level === 3) {
          return "Small Heading";
        }
      }

      if (node.type.name === "paragraph") {
        const parentNode = editor.state.doc.resolve(pos).parent;
        // When user start to write, only show this when the content is empty
        if (
          parentNode.type.name === "doc" &&
          editor.getJSON().content?.length === 1
        ) {
          return "Start your story here...";
        }

        if (parentNode.type.name === "listItem") {
          return "List";
        }

        if (parentNode.type.name === "blockquote") {
          // If there is more than one child in the quote, explain what to do next
          if (parentNode.content.childCount > 1) {
            return "Type or hit enter to exit quote";
          }
          return "Quote";
        }

        if (isMobile) {
          return "Type something...";
        }

        return "Type '/' for commands";
      }

      return "";
    },
  });
};

export { Placeholder as TipTapPlaceholder };
