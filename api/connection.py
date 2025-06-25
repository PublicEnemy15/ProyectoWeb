import mysql.connector

connection = mysql.connector.connect(user = 'root', 
                                     password = 'root',
                                     host = 'localhost',
                                     database = 'ProyectoTallerWeb',
                                     port='3306')

print(connection)