"use client";

import { useState, useRef } from "react";
import Tesseract, { OEM } from "tesseract.js";
import { Loader2, UploadCloud, Sparkles } from "lucide-react";
import DocumentViewer from "@/components/document-viewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockDocument, TextElement } from "@/lib/types";
import { MOCK_DOC } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [document, setDocument] = useState<MockDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing Image...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (JPEG, PNG, etc.).",
        });
        return;
      }

      setIsLoading(true);
      const imageUrl = URL.createObjectURL(file);
      setLoadingMessage("Analyzing document with Tesseract...");

      try {
        const result = await Tesseract.recognize(imageUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const progress = (m.progress * 100).toFixed(0);
              setLoadingMessage(`Recognizing Text... ${progress}%`);
            }
          },
        });

        const {
          data: { words },
        } = result;

        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
          const { width: imgWidth, height: imgHeight } = image;

          const textElements: TextElement[] = words.map((word, index) => {
            const { bbox } = word;
            return {
              id: `word-${index}-${Date.now()}`,
              text: word.text,
              x: (bbox.x0 / imgWidth) * 100,
              y: (bbox.y0 / imgHeight) * 100,
              width: ((bbox.x1 - bbox.x0) / imgWidth) * 100,
              height: ((bbox.y1 - bbox.y0) / imgHeight) * 100,
            };
          });

          const newDoc: MockDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            pages: [
              {
                id: `page-1`,
                pageNumber: 1,
                imageId: "uploaded-image",
                textElements: textElements,
              },
            ],
          };

          (newDoc as any).uploadedImageUrl = imageUrl;
          setDocument(newDoc);
          setIsLoading(false);
        };
        image.onerror = () => {
          toast({
            variant: "destructive",
            title: "Image Load Failed",
            description: "Could not load image dimensions.",
          });
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Tesseract Error:", error);
        toast({
          variant: "destructive",
          title: "OCR Failed",
          description: "Could not process the image with Tesseract.",
        });
        setIsLoading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (document) {
    const imageUrl = (document as any).uploadedImageUrl || undefined;
    return (
      <DocumentViewer
        document={document}
        onExit={() => setDocument(null)}
        overrideImageUrl={imageUrl}
      />
    );
  }

  return (
    <div className="container mx-auto flex h-full min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-4xl">
            Welcome to PhonoTouch
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            Turn any document into an interactive reading lesson. Upload a file
            to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleUploadClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-6 w-6" />
            )}
            {isLoading ? loadingMessage : "Upload and Start Learning"}
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm text-muted-foreground">
          <p>Supported formats: JPEG, PNG</p>
          <p className="mt-4">
            Or you can still{" "}
            <button
              onClick={() => setDocument(MOCK_DOC)}
              className="text-primary underline"
              disabled={isLoading}
            >
              use the sample document
            </button>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
