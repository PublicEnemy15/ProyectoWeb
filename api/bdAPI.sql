CREATE DATABASE ProyectoTallerWeb;
USE ProyectoTallerWeb;

CREATE TABLE users(
	idUser INT PRIMARY KEY SERIAL DEFAULT VALUE,
    emailUser VARCHAR(50),
    passUser VARCHAR(50)
);