from pydantic import BaseModel

class UserList(BaseModel):
    id:int
    email:str
    password:str

class UserRegister(BaseModel):
    email:str
    password:str