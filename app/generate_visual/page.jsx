"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ImageIcon, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import db from '../utils/firestore';
import { collection, addDoc } from "firebase/firestore";
import ProtectedRoute from "../ProtectedRoute";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ASPECT_RATIOS = {
  "square": { width: 1024, height: 1024, label: "Square (1:1)" },
  "portrait": { width: 832, height: 1216, label: "Portrait (2:3)" },
  "landscape": { width: 1216, height: 832, label: "Landscape (3:2)" }
};

export default function GenerateVisual() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("square");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    const urlAspectRatio = searchParams.get('aspectRatio');
    
    if (urlPrompt) setPrompt(decodeURIComponent(urlPrompt));
    if (urlAspectRatio && ASPECT_RATIOS[urlAspectRatio]) {
      setAspectRatio(urlAspectRatio);
    }
  }, [searchParams]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const dimensions = ASPECT_RATIOS[aspectRatio];

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width: dimensions.width,
          height: dimensions.height,
        }),
      });

      let prediction = await response.json();

      if (response.status !== 201) {
        throw new Error(prediction.detail || "Error generating image");
      }

      setPrediction(prediction);

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await sleep(1000);
        const response = await fetch("/api/predictions/" + prediction.id);
        prediction = await response.json();
        if (response.status !== 200) {
          throw new Error(prediction.detail || "Error checking generation status");
        }
        setPrediction(prediction);
      }

      if (prediction.status === "failed") {
        throw new Error("Image generation failed. Please try again.");
      }

      setNotification({ type: 'success', message: 'Image generated successfully!' });
    } catch (error) {
      setError(error.message);
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prediction?.output) return;
  
    setIsSaving(true);
    const imageUrl = prediction.output[prediction.output.length - 1];
  
    try {
      // Save to Firestore
      await addDoc(collection(db, "visuals"), {
        imageUrl,
        prompt: prediction.input.prompt,
        aspectRatio,
        createdAt: new Date(),
      });
  
      setNotification({ type: 'success', message: 'Image saved successfully!' });
  
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
      setNotification({ type: 'error', message: 'Failed to save image: ' + error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {notification && (
          <Alert 
            variant={notification.type === 'error' ? 'destructive' : 'default'} 
            className="mb-6"
          >
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
              Generate Image
            </CardTitle>
           
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left side - Settings */}
              <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aspect Ratio</label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Aspect Ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prompt</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || !prompt.trim()} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        Generate
                        <ImageIcon className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Right side - Image display */}
              <div className="w-full lg:w-2/3 space-y-4">
                {prediction && prediction.output ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-lg">
                      <Image
                        src={prediction.output[prediction.output.length - 1]}
                        alt="Generated image"
                        layout="fill"
                        objectFit="contain"
                        priority
                        className="bg-background"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Status: {prediction.status}
                      </p>
                      <Button 
                        onClick={handleSave} 
                        disabled={!prediction.output || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            Save Image
                            <Download className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-muted flex items-center justify-center rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                      <p>Generated image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}