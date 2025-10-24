
"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2, UploadCloud, Sparkles, ArrowRight } from "lucide-react";
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
import type { MockDocument, TextElement, DocumentPage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function Home() {
  const [document, setDocument] = useState<MockDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [showLanding, setShowLanding] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const processTesseract = async (imageUrl: string, fileName: string, canvasWidth: number, canvasHeight: number) => {
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

      const textElements: TextElement[] = words.map((word, index) => {
        const { bbox } = word;
        return {
          id: `word-${index}-${Date.now()}`,
          text: word.text,
          x: (bbox.x0 / canvasWidth) * 100,
          y: (bbox.y0 / canvasHeight) * 100,
          width: ((bbox.x1 - bbox.x0) / canvasWidth) * 100,
          height: ((bbox.y1 - bbox.y0) / canvasHeight) * 100,
        };
      });

      const newDoc: MockDocument = {
        id: `doc-${Date.now()}`,
        name: fileName,
        pages: [
          {
            id: `page-1`,
            pageNumber: 1,
            imageId: "uploaded-image", // This will be overridden
            textElements: textElements,
          },
        ],
      };
      
      (newDoc as any).uploadedImageUrls = [imageUrl];
      setDocument(newDoc);
      setIsLoading(false);

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

  const preProcessImage = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = canvasRef.current;
       if (!canvas) {
          toast({ variant: "destructive", title: "Error", description: "Canvas element not found." });
          setIsLoading(false);
          return;
        }
      const context = canvas.getContext("2d");
      if (!context) {
          toast({ variant: "destructive", title: "Error", description: "Could not get canvas context." });
          setIsLoading(false);
          return;
      }

      // Upscale image for better OCR
      const scaleFactor = 2;
      const upscaledWidth = image.width * scaleFactor;
      const upscaledHeight = image.height * scaleFactor;

      canvas.width = upscaledWidth;
      canvas.height = upscaledHeight;
      context.drawImage(image, 0, 0, upscaledWidth, upscaledHeight);

      const upscaledImageUrl = canvas.toDataURL();
      
      processTesseract(upscaledImageUrl, file.name, upscaledWidth, upscaledHeight);
    };
    image.onerror = () => {
        toast({ variant: "destructive", title: "Image Load Failed", description: "Could not load the uploaded image file." });
        setIsLoading(false);
    }
  }

  const processPdf = async (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const typedarray = new Uint8Array(fileReader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const numPages = pdf.numPages;
        const pages: DocumentPage[] = [];
        const pageImageUrls: string[] = [];

        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error("Canvas element not found.");
        }
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Failed to get canvas context");
        }

        for (let i = 1; i <= numPages; i++) {
          setLoadingMessage(`Processing Page ${i} of ${numPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.5 });
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imageUrl = canvas.toDataURL();
          pageImageUrls.push(imageUrl);

          setLoadingMessage(`Recognizing text on page ${i}...`);
          const result = await Tesseract.recognize(imageUrl, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text") {
                const progress = (m.progress * 100).toFixed(0);
                setLoadingMessage(
                  `Page ${i}/${numPages}: Recognizing Text... ${progress}%`
                );
              }
            },
          });
          
          const { data: { words } } = result;

          const textElements: TextElement[] = words.map((word, index) => {
            const { bbox } = word;
            return {
              id: `word-p${i}-${index}-${Date.now()}`,
              text: word.text,
              x: (bbox.x0 / viewport.width) * 100,
              y: (bbox.y0 / viewport.height) * 100,
              width: ((bbox.x1 - bbox.x0) / viewport.width) * 100,
              height: ((bbox.y1 - bbox.y0) / viewport.height) * 100,
            };
          });

          pages.push({
            id: `page-${i}`,
            pageNumber: i,
            imageId: `pdf-page-${i}`,
            textElements: textElements,
          });
        }
        
        const newDoc: MockDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            pages: pages,
        };

        (newDoc as any).uploadedImageUrls = pageImageUrls;
        setDocument(newDoc);
        setIsLoading(false);

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
        preProcessImage(file);
      } else if (isPdf) {
        setLoadingMessage("Rendering PDF...");
        processPdf(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (showLanding) {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background text-foreground">
        <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center space-y-6 p-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Image2read
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Transform reading into an interactive adventure. Upload documents and tap on words to hear them spoken aloud, making learning engaging and fun for children.
          </p>
          <Button size="lg" onClick={() => setShowLanding(false)}>
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (document) {
    const imageUrls = (document as any).uploadedImageUrls || undefined;
    return (
      <DocumentViewer
        document={document}
        onExit={() => setDocument(null)}
        overrideImageUrls={imageUrls}
      />
    );
  }

  return (
    <div className="container mx-auto flex h-full min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <canvas ref={canvasRef} className="hidden" />
      <Card className="w-full max-w-lg text-center shadow-lg border-0">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">
            Upload a Document
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            Turn any document into an interactive reading lesson.
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
        </CardFooter>
      </Card>
    </div>
  );
}
