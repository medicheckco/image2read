export interface Character {
  id: string;
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  imageId: string;
  characters: Character[];
}

export interface MockDocument {
  id: string;
  name: string;
  pages: DocumentPage[];
}
