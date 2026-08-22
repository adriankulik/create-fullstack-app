import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MultiplyRequest(BaseModel):
    number: float

class MultiplyResponse(BaseModel):
    result: float

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/appdb")

def save_calculation(number: float, result: float):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO calculations (input_number, result) VALUES (%s, %s)",
        (number, result)
    )
    conn.commit()
    cursor.close()
    conn.close()

@app.post("/api/multiply", response_model=MultiplyResponse)
def multiply_number(request: MultiplyRequest):
    result = request.number * 2
    try:
        save_calculation(request.number, result)
    except Exception as e:
        print(f"Error saving to db: {e}")
    return MultiplyResponse(result=result)
