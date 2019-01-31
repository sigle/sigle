export interface BlockstackUser {
  username: string;
}

export interface StoryFile {
  stories: SubsetStory[];
}

export interface Story {
  id: string;
  title: string;
  content: any;
  type: 'private' | 'public';
  createdAt: number;
  updatedAt: number;
}

export interface SubsetStory {
  id: string;
  title: string;
  content: string;
  type: 'private' | 'public';
  createdAt: number;
  updatedAt: number;
}
