from fastapi import FastAPI
from routes.database import router

app = FastAPI(
    title="Database Application"
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Database Application"}