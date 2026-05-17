from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MultiplyRequest(BaseModel):
    number: float

class MultiplyResponse(BaseModel):
    result: float

@app.post("/api/multiply", response_model=MultiplyResponse)
def multiply_number(request: MultiplyRequest):
    return MultiplyResponse(result=request.number * 2)


