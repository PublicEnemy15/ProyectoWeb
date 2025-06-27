import mysql.connector
conn = mysql.connector.connect(user = 'root', 
                                     password = 'root',
                                     host = 'localhost',
                                     database = 'ProyectoTallerWeb',
                                     port='3306')
cursor = conn.cursor()