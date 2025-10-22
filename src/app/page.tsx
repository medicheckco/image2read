"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { UploadCloud, Sparkles } from "lucide-react";
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
import type { MockDocument } from "@/lib/types";
import { MOCK_DOC } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [document, setDocument] = useState<MockDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // NOTE: We are creating a new mock document but replacing the image.
        // The character data is still from the mock document.
        const newDoc: MockDocument = {
          ...MOCK_DOC,
          pages: [
            {
              ...MOCK_DOC.pages[0],
              imageId: "uploaded-image",
            },
          ],
        };

        // This is a bit of a hack to temporarily store the uploaded image URL
        // without modifying the placeholder structure.
        (newDoc as any).uploadedImageUrl = imageUrl;
        setDocument(newDoc);
      };
      reader.readAsDataURL(file);
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
            accept="image/*,application/pdf"
          />
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleUploadClick}
          >
            <UploadCloud className="mr-2 h-6 w-6" />
            Upload and Start Learning
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm text-muted-foreground">
          <p>Supported formats: JPEG, PNG, PDF</p>
          <p className="mt-4">
            Or you can still{" "}
            <button
              onClick={() => setDocument(MOCK_DOC)}
              className="text-primary underline"
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
