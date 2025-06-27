CREATE DATABASE ProyectoTallerWeb;
USE ProyectoTallerWeb;

CREATE TABLE users(
	idUser INT PRIMARY KEY SERIAL DEFAULT VALUE,
    emailUser VARCHAR(50),
    passUser VARCHAR(50)
);

INSERT INTO proyectotallerweb.users(emailUser, passUser) VALUES
('ola@gmail.com', 'ola123'),
('admin@webproject.com','admin'),
('noc@xd.com','123');

SELECT * FROM proyectotallerweb.users;