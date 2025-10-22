"use client";

import { useState } from "react";
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

export default function Home() {
  const [document, setDocument] = useState<MockDocument | null>(null);

  if (document) {
    return <DocumentViewer document={document} onExit={() => setDocument(null)} />;
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
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={() => setDocument(MOCK_DOC)}
          >
            <UploadCloud className="mr-2 h-6 w-6" />
            Upload and Start Learning
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm text-muted-foreground">
          <p>Supported formats: JPEG, PNG, PDF</p>
          <p className="mt-4">
            For demonstration, we'll use a sample document.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
