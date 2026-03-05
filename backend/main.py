from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from analyzer import analyze

app = FastAPI(title="Text Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze_text(req: AnalyzeRequest):
    return analyze(req.text)


@app.get("/")
@app.post("/")
def index():
    return FileResponse("/app/frontend/index.html")


app.mount("/", StaticFiles(directory="/app/frontend"), name="static")
