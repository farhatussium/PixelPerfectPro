
import { ResizeSettings } from '../types';

const BACKEND_URL = 'http://localhost:8000';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Professional Resizer with Server Fallback
 * Tries the Python backend first, falls back to Canvas.
 */
export const resizeImage = async (
  imageUrl: string,
  settings: ResizeSettings,
  originalFile?: File
): Promise<{ url: string; mode: 'server' | 'client' }> => {
  
  if (originalFile) {
    try {
      const formData = new FormData();
      formData.append('file', originalFile);
      formData.append('width', settings.width.toString());
      formData.append('height', settings.height.toString());
      formData.append('format', settings.format);
      formData.append('quality', settings.quality.toString());

      const response = await fetch(`${BACKEND_URL}/api/resize`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        return { 
          url: URL.createObjectURL(blob), 
          mode: 'server' 
        };
      }
    } catch (e) {
      console.warn("Backend unreachable, falling back to client-side processing.");
    }
  }

  // Client-side Fallback using Canvas
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = settings.width;
  canvas.height = settings.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, settings.width, settings.height);

  return { 
    url: canvas.toDataURL(settings.format, settings.quality), 
    mode: 'client' 
  };
};

export const getFileMetadata = (file: File): Promise<{ width: number; height: number; aspectRatio: number }> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    img.src = url;
  });
};
