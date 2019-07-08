export interface User {
  username: string;
}

interface RadiksModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: any;
  save: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface RadiksSigleUser extends RadiksModel {
  attrs: {
    _id: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    username: string;
  };
}

interface StoryAttrs {
  _id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface RadiksPrivateStory extends RadiksModel {
  attrs: StoryAttrs & {
    radiksType: 'PrivateStory';
  };
}

export interface RadiksPublicStory extends RadiksModel {
  attrs: StoryAttrs & {
    radiksType: 'PublicStory';
  };
}
