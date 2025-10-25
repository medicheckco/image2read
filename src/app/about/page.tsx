
import { Lightbulb, BookOpenCheck, Settings, UploadCloud, MousePointerClick, Volume2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="py-20 text-center bg-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary">
              Unlock the Joy of Reading
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Image2read is an innovative tool designed to transform reading into an interactive adventure, making it more accessible and enjoyable for children everywhere.
            </p>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-4">Our Mission</h2>
              <p>
                At Image2read, we believe that every child deserves to experience the magic of reading. Our mission is to break down barriers that can make reading challenging. We provide a multi-sensory learning tool that bridges the gap between visual text and auditory learning. By allowing children to see and hear words simultaneously, we help build confidence, improve pronunciation, and foster a lifelong love for stories and knowledge.
              </p>
            </div>
            <div className="flex justify-center">
                <Lightbulb className="w-32 h-32 text-primary/20" strokeWidth={1} />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-12">
              Simple Steps to Start Learning
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-4">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="font-headline text-2xl font-semibold mb-2">1. Upload</h3>
                <p className="text-muted-foreground">
                  Easily upload any image or PDF document from your device. It can be a page from a favorite book, a worksheet, or any text-based image.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-4">
                  <MousePointerClick className="w-10 h-10" />
                </div>
                <h3 className="font-headline text-2xl font-semibold mb-2">2. Interact</h3>
                <p className="text-muted-foreground">
                  Our app uses advanced OCR to make the text in your document interactive. Simply hover over or tap on any word.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-4">
                  <Volume2 className="w-10 h-10" />
                </div>
                <h3 className="font-headline text-2xl font-semibold mb-2">3. Listen</h3>
                <p className="text-muted-foreground">
                  Hear the selected word spoken aloud clearly. This auditory feedback helps reinforce learning and pronunciation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-center text-3xl md:text-4xl text-foreground mb-12">
              Powerful Features for Modern Learning
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border bg-card">
                 <BookOpenCheck className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Interactive Text Recognition</h3>
                <p className="text-muted-foreground">
                    Our powerful OCR technology intelligently detects and digitizes text from any image or PDF, turning static pages into a dynamic learning experience.
                </p>
              </div>
               <div className="p-6 rounded-lg border bg-card">
                <Volume2 className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Clear Audio Playback</h3>
                <p className="text-muted-foreground">
                  High-quality text-to-speech synthesis provides clear and natural-sounding audio for every word, helping children with pronunciation and comprehension.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                 <Settings className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Customizable Experience</h3>
                <p className="text-muted-foreground">
                  Adjust settings to fit your child's needs. Change the voice, language, and playback speed to create a personalized learning environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-4">
              Ready to Start the Adventure?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
              Upload your first document and see how Image2read can make a difference in your child's reading journey.
            </p>
            <Button asChild size="lg">
              <Link href="/">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
