
import { ResizeSettings } from '../types';

const BACKEND_URL = 'http://localhost:8000';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle potential CORS for canvas
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Professional Resizer with Server Fallback and Cropping
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
      formData.append('progressive_jpeg', (!!settings.progressiveJpeg).toString());
      formData.append('optimize_png', (!!settings.optimizePng).toString());
      
      if (settings.crop) {
        formData.append('crop_x', Math.round(settings.crop.x).toString());
        formData.append('crop_y', Math.round(settings.crop.y).toString());
        formData.append('crop_w', Math.round(settings.crop.width).toString());
        formData.append('crop_h', Math.round(settings.crop.height).toString());
      }

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

  if (settings.crop) {
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      img,
      settings.crop.x,
      settings.crop.y,
      settings.crop.width,
      settings.crop.height,
      0,
      0,
      settings.width,
      settings.height
    );
  } else {
    ctx.drawImage(img, 0, 0, settings.width, settings.height);
  }

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
