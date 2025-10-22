import type { MockDocument } from './types';

// These coordinates and sizes are percentages of the parent image dimensions.
export const MOCK_DOC: MockDocument = {
  id: 'doc-1',
  name: 'Sample Childrens Book',
  pages: [
    {
      id: 'page-1',
      pageNumber: 1,
      imageId: 'doc-page-1',
      characters: [
        // Word: The
        { id: 'c1', char: 'T', x: 15, y: 15, width: 5.5, height: 8 },
        { id: 'c2', char: 'h', x: 21, y: 15.5, width: 4.5, height: 7 },
        { id: 'c3', char: 'e', x: 26, y: 17.5, width: 4, height: 5 },

        // Word: cat
        { id: 'c4', char: 'c', x: 33, y: 17.5, width: 4, height: 5 },
        { id: 'c5', char: 'a', x: 37.5, y: 17.5, width: 4, height: 5 },
        { id: 'c6', char: 't', x: 42, y: 15.5, width: 3, height: 7 },

        // Word: sat
        { id: 'c7', char: 's', x: 48, y: 17.5, width: 3.5, height: 5 },
        { id: 'c8', char: 'a', x: 52, y: 17.5, width: 4, height: 5 },
        { id: 'c9', char: 't', x: 56.5, y: 15.5, width: 3, height: 7 },
        
        // Word: on
        { id: 'c10', char: 'o', x: 15, y: 30, width: 4.5, height: 5 },
        { id: 'c11', char: 'n', x: 20, y: 30, width: 4.5, height: 5 },

        // Word: the
        { id: 'c12', char: 't', x: 27, y: 28, width: 3, height: 7 },
        { id: 'c13', char: 'h', x: 30.5, y: 28, width: 4.5, height: 7 },
        { id: 'c14', char: 'e', x: 35.5, y: 30, width: 4, height: 5 },

        // Word: mat
        { id: 'c15', char: 'm', x: 42, y: 30, width: 6, height: 5 },
        { id: 'c16', char: 'a', x: 48.5, y: 30, width: 4, height: 5 },
        { id: 'c17', char: 't', x: 53, y: 28, width: 3, height: 7 },
      ],
    },
  ],
};
