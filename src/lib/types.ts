export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  imageId: string;
  textElements: TextElement[];
}

export interface MockDocument {
  id: string;
  name: string;
  pages: DocumentPage[];
}
