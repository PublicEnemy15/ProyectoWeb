from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from connection import connection

app = FastAPI()

class User(BaseModel):
    id:int
    email:str
    pwd:str

users:List[User] = []

@app.get("/users", response_model=List[User])
def get_Users():
    return users

@app.post("/users", response_model=List[User])
def post_Users(user:User):
    for u in users:
        if u.id == user.id:
            raise HTTPException(status_code=400, detail='Ya esxite este ID')
    users.append(user)
    return user

@app.delete("/users/{id}")
def delete_Users(id:int):
    for u in users:
        if u.id == id:
            users.remove(u)
            return {"message": "Eliminado correctamente"}
    raise HTTPException(status_code=404, detail="No se encontró este ID")