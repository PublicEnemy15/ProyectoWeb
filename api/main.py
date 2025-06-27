from fastapi import FastAPI, HTTPException
from typing import List
from BDC import cursor
from BDC import conn
from User import UserList
from User import UserRegister
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/users", response_model=List[UserList])
def get_Users():
    userL:List[UserList] = []
    cursor.execute("SELECT * FROM proyectotallerweb.users")
    rows = cursor.fetchall()
    for row in rows:
        userL.append(UserList(id=row[0], email=row[1], password=row[2]))
    return userL
    

@app.post("/users", response_model=List[UserRegister])
def post_Users(userR:UserRegister):
    try:
        cursor.execute("INSERT INTO proyectotallerweb.users(emailUser, passUser) VALUES (%s, %s)", (userR.email, userR.password))
        conn.commit()
        return {"message":"Usuario registrado correctamente"}
    except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Error al insertar usuario: {str(e)}")


@app.delete("/users/{id}")
def delete_Users(id:int):
    for u in get_Users():
        if u.id == id:
            #userL.remove(u) query DELETE
            return {"message": "Eliminado correctamente"}
    raise HTTPException(status_code=404, detail="No se encontró este ID")
