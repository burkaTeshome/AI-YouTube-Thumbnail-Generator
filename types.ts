export enum Mood {
  ENERGETIC = 'Energetic',
  DRAMATIC = 'Dramatic',
  PROFESSIONAL = 'Professional',
  FUNNY = 'Funny',
  INSPIRATIONAL = 'Inspirational',
}

export enum ImageReaction {
  SURPRISED = 'Surprised',
  EXCITED = 'Excited',
  THOUGHTFUL = 'Thoughtful',
  HAPPY = 'Happy',
  INTENSE = 'Intense',
}

export enum ThumbnailStyle {
  REALISTIC = 'Realistic Photography',
  DRAWING = 'Digital Drawing/Illustration',
  CARTOON = 'Cartoon / Animated',
  THREE_D_RENDER = '3D Render',
  PIXEL_ART = 'Pixel Art',
}

export interface Refinements {
  brightness: 'normal' | 'brighter' | 'darker';
  color: string;
  layout: string;
}

export interface ThumbnailSuggestion {
  title: string;
  backgroundConcept: string;
  mood: Mood;
  imageReaction: ImageReaction;
  thumbnailStyle: ThumbnailStyle;
}
