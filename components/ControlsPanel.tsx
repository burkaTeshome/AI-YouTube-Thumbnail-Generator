import React from 'react';
import { Mood, ImageReaction, Refinements, ThumbnailStyle } from '../types';
import { UploadIcon, RefreshIcon, SparklesIcon } from './IconComponents';

interface ControlsPanelProps {
  uploadedImage: { base64: string; mimeType: string } | null;
  setUploadedImage: (image: { base64: string; mimeType: string } | null) => void;
  title: string;
  setTitle: (title: string) => void;
  concept: string;
  setConcept: (concept: string) => void;
  backgroundConcept: string;
  setBackgroundConcept: (concept: string) => void;
  mood: Mood;
  setMood: (mood: Mood) => void;
  imageReaction: ImageReaction;
  setImageReaction: (reaction: ImageReaction) => void;
  thumbnailStyle: ThumbnailStyle;
  setThumbnailStyle: (style: ThumbnailStyle) => void;
  refinements: Refinements;
  setRefinements: (refinements: Refinements) => void;
  onGenerate: (isRefinement: boolean) => void;
  isLoading: boolean;
  isGenerated: boolean;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark-text mb-3 border-b-2 border-dark-border pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-dark-text-secondary mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-2 focus:ring-brand-blue focus:outline-none transition" />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-2 focus:ring-brand-blue focus:outline-none transition" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-2 focus:ring-brand-blue focus:outline-none transition" />
);


export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  uploadedImage,
  setUploadedImage,
  title,
  setTitle,
  concept,
  setConcept,
  backgroundConcept,
  setBackgroundConcept,
  mood,
  setMood,
  imageReaction,
  setImageReaction,
  thumbnailStyle,
  setThumbnailStyle,
  refinements,
  setRefinements,
  onGenerate,
  isLoading,
  isGenerated
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetWidth = 1280;
          const targetHeight = 720;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          // Fill background with black
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Calculate new dimensions to fit inside the canvas, preserving aspect ratio
          const imgAspectRatio = img.width / img.height;
          const canvasAspectRatio = targetWidth / targetHeight;
          let drawWidth = targetWidth;
          let drawHeight = targetHeight;
          let x = 0;
          let y = 0;

          if (imgAspectRatio > canvasAspectRatio) {
            drawHeight = targetWidth / imgAspectRatio;
            y = (targetHeight - drawHeight) / 2;
          } else {
            drawWidth = targetHeight * imgAspectRatio;
            x = (targetWidth - drawWidth) / 2;
          }
          
          ctx.drawImage(img, x, y, drawWidth, drawHeight);

          // Using JPEG for efficiency as we're adding a solid background
          const mimeType = 'image/jpeg';
          const base64 = canvas.toDataURL(mimeType).split(',')[1];
          
          setUploadedImage({
            base64,
            mimeType
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefinementChange = <K extends keyof Refinements,>(key: K, value: Refinements[K]) => {
      setRefinements(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-dark-surface p-6 rounded-lg shadow-xl border border-dark-border">
      
      <ControlSection title="1. Upload Image">
        <div 
          className="w-full aspect-[16/9] border-2 border-dashed border-dark-border rounded-lg flex flex-col items-center justify-center text-dark-text-secondary bg-dark-bg cursor-pointer hover:border-brand-blue transition relative overflow-hidden" 
          onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {uploadedImage ? (
                <>
                  <div 
                    className="absolute inset-0 bg-center bg-cover" 
                    style={{ backgroundImage: `url(data:${uploadedImage.mimeType};base64,${uploadedImage.base64})` }}
                    aria-label="Uploaded image preview"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center text-center text-white font-semibold p-2">
                    Click to change image
                  </div>
                </>
            ) : (
                <div className="text-center">
                    <UploadIcon className="w-10 h-10 mb-2 mx-auto" />
                    <p>Click to upload</p>
                    <p className="text-xs">Image will be framed to 16:9</p>
                </div>
            )}
        </div>
      </ControlSection>

      <ControlSection title="2. Define Content">
        <div>
          <Label htmlFor="title">Video Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., How to Bake a Cake" />
        </div>
        <div>
          <Label htmlFor="concept">Core Concept</Label>
          <Textarea id="concept" value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="e.g., A simple recipe for beginners..." rows={2} />
        </div>
        <div>
          <Label htmlFor="background-concept">Background Concept</Label>
          <Textarea id="background-concept" value={backgroundConcept} onChange={(e) => setBackgroundConcept(e.target.value)} placeholder="e.g., A futuristic city skyline at night" rows={2} />
        </div>
      </ControlSection>

      <ControlSection title="3. Set The Mood & Style">
        <div>
          <Label htmlFor="mood">Video Mood</Label>
          <Select id="mood" value={mood} onChange={(e) => setMood(e.target.value as Mood)}>
            {Object.values(Mood).map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="imageReaction">Subject's Reaction</Label>
          <Select id="imageReaction" value={imageReaction} onChange={(e) => setImageReaction(e.target.value as ImageReaction)}>
            {Object.values(ImageReaction).map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="thumbnailStyle">Artistic Style</Label>
          <Select id="thumbnailStyle" value={thumbnailStyle} onChange={(e) => setThumbnailStyle(e.target.value as ThumbnailStyle)}>
            {Object.values(ThumbnailStyle).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </ControlSection>
      
      <div className="mt-8">
        <button
          onClick={() => onGenerate(false)}
          disabled={isLoading || !uploadedImage}
          className="w-full flex items-center justify-center bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <RefreshIcon className="w-5 h-5 animate-spin mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
          {isLoading ? 'Generating...' : 'Generate Thumbnail'}
        </button>
      </div>

      {isGenerated && (
          <div className="mt-8 pt-6 border-t border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text mb-3">4. Refinements</h3>
              <div className="space-y-4">
                  <div>
                      <Label htmlFor="brightness">Brightness</Label>
                      <Select id="brightness" value={refinements.brightness} onChange={(e) => handleRefinementChange('brightness', e.target.value as Refinements['brightness'])}>
                          <option value="normal">Normal</option>
                          <option value="brighter">Brighter</option>
                          <option value="darker">Darker</option>
                      </Select>
                  </div>
                  <div>
                      <Label htmlFor="color">Color Palette</Label>
                      <Input id="color" value={refinements.color} onChange={(e) => handleRefinementChange('color', e.target.value)} placeholder="e.g., 'blue and gold' or 'monochromatic red'" />
                  </div>
                  <div>
                      <Label htmlFor="layout">Layout Notes</Label>
                      <Input id="layout" value={refinements.layout} onChange={(e) => handleRefinementChange('layout', e.target.value)} placeholder="e.g., 'place text on the left'" />
                  </div>
                  <button
                    onClick={() => onGenerate(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <RefreshIcon className="w-5 h-5 animate-spin mr-2" /> : <RefreshIcon className="w-5 h-5 mr-2" />}
                    Refine Thumbnail
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};