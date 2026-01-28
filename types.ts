
export enum ImageFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp'
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ImageDataState {
  file: File;
  previewUrl: string;
  originalDimensions: Dimensions;
  currentDimensions: Dimensions;
  aspectRatio: number;
  format: ImageFormat;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number;
  format: ImageFormat;
}

export interface GeminiSuggestion {
  label: string;
  width: number;
  height: number;
  reason: string;
}
