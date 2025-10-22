'use server';
/**
 * @fileOverview A flow for processing a document image to extract characters and their positions.
 *
 * - processDocument - A function that handles the document processing.
 * - ProcessDocumentInput - The input type for the processDocument function.
 * - ProcessDocumentOutput - The return type for the processDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Character } from '@/lib/types';

const ProcessDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a document page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessDocumentInput = z.infer<typeof ProcessDocumentInputSchema>;

const CharacterSchema = z.object({
  id: z.string().describe("A unique identifier for the character."),
  char: z.string().describe("The character itself."),
  x: z.number().describe("The x-coordinate of the top-left corner of the character's bounding box, as a percentage of the image width."),
  y: z.number().describe("The y-coordinate of the top-left corner of the character's bounding box, as a percentage of the image height."),
  width: z.number().describe("The width of the character's bounding box, as a percentage of the image width."),
  height: z.number().describe("The height of the character's bounding box, as a percentage of the image height."),
});

const ProcessDocumentOutputSchema = z.object({
  characters: z.array(CharacterSchema).describe("An array of characters found on the page.")
});

export type ProcessDocumentOutput = {
  characters: Character[];
};

export async function processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentOutput> {
  const result = await processDocumentFlow(input);
  return {
    // The schema from Zod is slightly different from the TypeScript type, so we cast it.
    characters: result.characters as Character[],
  };
}

const prompt = ai.definePrompt({
  name: 'processDocumentPrompt',
  input: { schema: ProcessDocumentInputSchema },
  output: { schema: ProcessDocumentOutputSchema },
  prompt: `You are an expert in Optical Character Recognition (OCR). Your task is to analyze the provided image of a document page and extract every single character, its position, and its bounding box.

The coordinates (x, y) and dimensions (width, height) must be expressed as percentages of the total image dimensions.

For example, if a character 'A' is located at (100px, 200px) in an image of size 1000px by 1500px, and its bounding box is 50px wide and 75px high, the output for that character should be:
{
  char: 'A',
  x: 10, // 100 / 1000 * 100
  y: 13.33, // 200 / 1500 * 100
  width: 5, // 50 / 1000 * 100
  height: 5, // 75 / 1500 * 100
}

Pay close attention to punctuation and symbols. Ensure every character is extracted accurately.

Image to process: {{media url=photoDataUri}}`,
});

const processDocumentFlow = ai.defineFlow(
  {
    name: 'processDocumentFlow',
    inputSchema: ProcessDocumentInputSchema,
    outputSchema: ProcessDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to process document. The AI model did not return any output.');
    }
    return output;
  }
);
