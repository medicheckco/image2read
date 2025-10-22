"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
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

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function Home() {
  const [document, setDocument] = useState<MockDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const processTesseract = async (imageUrl: string, fileName: string) => {
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
          name: fileName,
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
          description: "Could not load image dimensions for processing.",
        });
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Tesseract Error:", error);
      toast({
        variant: "destructive",
        title: "OCR Failed",
        description: "Could not process the file with Tesseract.",
      });
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image or PDF file.",
        });
        return;
      }

      setIsLoading(true);

      if (isImage) {
        const imageUrl = URL.createObjectURL(file);
        processTesseract(imageUrl, file.name);
      } else if (isPdf) {
        setLoadingMessage("Rendering PDF...");
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          try {
            const typedarray = new Uint8Array(fileReader.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1); // Process first page
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            if (!canvas) {
                throw new Error("Canvas element not found.");
            }
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) {
              throw new Error("Failed to get canvas context");
            }
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            processTesseract(canvas.toDataURL(), file.name);

          } catch (error) {
            console.error("PDF Processing Error:", error);
            toast({
              variant: "destructive",
              title: "PDF Processing Failed",
              description: "Could not read or render the PDF file.",
            });
            setIsLoading(false);
          }
        };
        fileReader.readAsArrayBuffer(file);
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
      <canvas ref={canvasRef} className="hidden" />
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
            accept="image/*,application/pdf"
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
          <p>Supported formats: JPEG, PNG, PDF</p>
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
