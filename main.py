
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image

app = FastAPI(title="PixelPerfect Pro Backend")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "Pillow"}

@app.post("/api/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    format: str = Form(...),  # e.g., "image/jpeg"
    quality: float = Form(...)
):
    try:
        # Read image into memory
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Convert to RGB if saving as JPEG and image has alpha channel
        target_format = format.split("/")[-1].upper()
        if target_format == "JPEG" and image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Professional-grade resizing using Lanczos resampling
        resized_image = image.resize((width, height), Image.Resampling.LANCZOS)

        # Save to buffer
        buffer = io.BytesIO()
        # Quality for PIL is 1-100
        pil_quality = int(quality * 100)
        
        resized_image.save(buffer, format=target_format, quality=pil_quality, optimize=True)
        buffer.seek(0)

        return Response(content=buffer.getvalue(), media_type=format)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
