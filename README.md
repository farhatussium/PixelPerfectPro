
# 📸 PixelPerfect Pro: AI-Powered Photo Resizer

PixelPerfect Pro is a "full-stack" web application. This means it has a **Frontend** (what you see in the browser) and a **Backend** (a server that does heavy lifting). It uses Artificial Intelligence (Google Gemini) to suggest the best sizes for your images.

---

## 🌟 What makes this special?

1.  **AI Intelligence**: It "looks" at your photo and suggests sizes for Instagram, YouTube, or LinkedIn.
2.  **Professional Quality**: Uses the Python `Pillow` library and `Lanczos` resampling for much cleaner results than standard browser resizing.
3.  **Hybrid Power**: If the Python server is off, it automatically switches to a browser-based resizer so it never stops working.

---

## 🛠 Prerequisites

Before starting, make sure you have these installed on your computer:
*   [Python 3.10+](https://www.python.org/downloads/) (For the image processing engine)
*   [Node.js](https://nodejs.org/) (For the web interface)
*   A Google Account (To get a free Gemini API key)

---

## 🚀 Getting Started

### Step 1: Get your API Key
1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **"Create API key"**.
3.  Copy the key and paste it into the `.env` file in this folder:
    ```env
    API_KEY=your_actual_key_here
    ```

### Step 2: Set up the Python Backend
The backend is the "engine" that handles high-quality image processing.
1.  Open your terminal/command prompt in this folder.
2.  (Recommended) Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the environment:
    *   **Windows:** `venv\Scripts\activate`
    *   **Mac/Linux:** `source venv/bin/activate`
4.  Install the required tools:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the server:
    ```bash
    python main.py
    ```
    *Keep this terminal window open! You should see "Uvicorn running on http://0.0.0.0:8000".*

### Step 3: Launch the Web App
1.  In a **new** terminal window, start your frontend development server (usually `npm run dev` or simply opening the project in your IDE).
2.  Open your browser to the provided local address.
3.  Look for the green **"Backend Node"** light in the top right—this confirms your Python server is working!

---

## 📁 Project Overview

*   `App.tsx`: The heart of the interface.
*   `main.py`: The Python script that resizes images perfectly.
*   `services/geminiService.ts`: Talks to Google's AI to get smart suggestions.
*   `services/imageProcessor.ts`: The logic that decides whether to use Python or the Browser.
*   `.gitignore`: Tells Git to ignore files like `node_modules`, `venv`, and `.env`.

---

## ❓ Troubleshooting

**"The 'Backend Node' light is grey!"**
*   Make sure you ran `python main.py` and it didn't show any errors.
*   Ensure your browser isn't blocking `http://localhost:8000`.

**"AI suggestions aren't appearing"**
*   Double-check your `.env` file. Make sure there are no spaces around the `=` sign.
*   Check your internet connection.

---

## 🔒 Privacy & Security
*   **Local-First**: If you use the browser-only mode, your images never even leave your computer.
*   **In-Memory Processing**: When the backend is running, images are processed in memory and **never saved** to a disk or database.
*   **Git Security**: A `.gitignore` file is included to ensure that your private `.env` (which contains your Gemini API key) and bulky folders like `venv` or `node_modules` are never uploaded to GitHub or other git providers.
