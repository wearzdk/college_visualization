import mysql.connector
from mysql.connector import Error

config = {
  'host': 'localhost',
  'user': 'college_guidance',
  'password': 'YKQGMJc53bJfk7R2',
  'database': 'college_guidance'
}

def query(sql, args=None):
  try:
    db = mysql.connector.connect(**config)
    cursor = db.cursor()
    cursor.execute(sql, args)
    data = cursor.fetchall()
    cursor.close()
    return data
  except Error as e:
    print(e)
    return None

def execute(sql, args=None):
  try:
    db = mysql.connector.connect(**config)
    cursor = db.cursor()
    cursor.execute(sql, args)
    db.commit()
    cursor.close()
  except Error as e:
    print(e)
    return None