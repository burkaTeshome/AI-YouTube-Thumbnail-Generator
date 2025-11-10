import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { generateThumbnail } from './services/geminiService';
import { Mood, ImageReaction, Refinements, ThumbnailStyle } from './types';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [title, setTitle] = useState<string>('My Awesome Video');
  const [concept, setConcept] = useState<string>('A tutorial on how to use AI');
  const [backgroundConcept, setBackgroundConcept] = useState<string>('Abstract tech background with glowing lines');
  const [mood, setMood] = useState<Mood>(Mood.ENERGETIC);
  const [imageReaction, setImageReaction] = useState<ImageReaction>(ImageReaction.EXCITED);
  const [thumbnailStyle, setThumbnailStyle] = useState<ThumbnailStyle>(ThumbnailStyle.REALISTIC);
  const [refinements, setRefinements] = useState<Refinements>({
    brightness: 'normal',
    color: '',
    layout: '',
  });

  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (isRefinement: boolean = false) => {
    if (!uploadedImage) {
      setError('Please upload an image first.');
      return;
    }
    if (!title || !concept || !backgroundConcept) {
        setError('Please fill out the Title, Core Concept, and Background Concept fields.');
        return;
    }
    setIsLoading(true);
    setError(null);
    if (!isRefinement) {
        setGeneratedThumbnail(null);
    }

    try {
      const result = await generateThumbnail({
        image: uploadedImage,
        title,
        concept,
        backgroundConcept,
        mood,
        imageReaction,
        thumbnailStyle,
        refinements: isRefinement ? refinements : undefined,
      });
      setGeneratedThumbnail(`data:image/png;base64,${result}`);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate thumbnail. Reason: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, title, concept, backgroundConcept, mood, imageReaction, thumbnailStyle, refinements]);
  
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ControlsPanel
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              title={title}
              setTitle={setTitle}
              concept={concept}
              setConcept={setConcept}
              backgroundConcept={backgroundConcept}
              setBackgroundConcept={setBackgroundConcept}
              mood={mood}
              setMood={setMood}
              imageReaction={imageReaction}
              setImageReaction={setImageReaction}
              thumbnailStyle={thumbnailStyle}
              setThumbnailStyle={setThumbnailStyle}
              refinements={refinements}
              setRefinements={setRefinements}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isGenerated={!!generatedThumbnail}
            />
          </div>
          <div className="lg:col-span-8">
            <ThumbnailPreview
              generatedThumbnail={generatedThumbnail}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;