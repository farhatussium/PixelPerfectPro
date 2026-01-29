
# PixelPerfect Pro - AI Photo Resizer

A professional full-stack web application for intelligent image resizing and optimization.

## 🚀 Features

- **Hybrid Processing**: Uses a Python (FastAPI + Pillow) backend for professional-grade resizing with Lanczos resampling, with a client-side Canvas fallback.
- **AI Smart Suggestions**: Integrated with Google Gemini 2.0 to analyze images and suggest optimal dimensions for social media (Instagram, LinkedIn, YouTube).
- **Privacy First**: Local-first architecture. Images are only processed on the server if the backend is enabled.
- **Modern UI**: Built with React 19, Tailwind CSS, and Plus Jakarta Sans.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Backend**: Python 3.10+, FastAPI
- **Image Processing**: Pillow (PIL)

## 📦 Installation & Setup

### 1. Backend Setup
```bash
# Navigate to project root
pip install -r requirements.txt
python main.py
```
The server will start at `http://localhost:8000`.

### 2. Frontend Setup
The frontend is built as an ES module and can be served directly. Ensure your `API_KEY` for Google Gemini is configured in your environment.

## 📂 Project Structure

- `main.py`: FastAPI server handling image processing logic.
- `App.tsx`: Main React component and state management.
- `services/`:
  - `imageProcessor.ts`: Logic for local vs. server-side resizing.
  - `geminiService.ts`: AI analysis and suggestion engine.
- `components/`: Modular UI components.

## 🔒 Privacy
This application supports a fully offline mode where all processing happens via the browser's Canvas API. Server-side processing is optional and provides higher-fidelity resampling.
