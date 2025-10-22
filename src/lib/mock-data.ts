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
      textElements: [
        { id: 'w1', text: 'The', x: 15, y: 15, width: 15, height: 8 },
        { id: 'w2', text: 'cat', x: 33, y: 15.5, width: 12, height: 7 },
        { id: 'w3', text: 'sat', x: 48, y: 15.5, width: 11.5, height: 7 },
        { id: 'w4', text: 'on', x: 15, y: 28, width: 9.5, height: 7 },
        { id: 'w5', text: 'the', x: 27, y: 28, width: 12.5, height: 7 },
        { id: 'w6', text: 'mat', x: 42, y: 28, width: 14, height: 7 },
      ],
    },
  ],
};
