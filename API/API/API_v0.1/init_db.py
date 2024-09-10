import sqlite3
from user import User
import hashlib
import json

DATABASE_USR = "storage/users.db"
DATABASE_IMGS = "storage/images.db"
DATABASE_FRIENDS = "storage/friends.db"
DATABASE_QUESTIONS = "storage/security_questions.db"
DATABASE_STORIES = "storage/stories.db"

db_usr = sqlite3.connect(DATABASE_USR)
db_img = sqlite3.connect(DATABASE_IMGS)
db_fr = sqlite3.connect(DATABASE_FRIENDS, check_same_thread=False)
db_sec = sqlite3.connect(DATABASE_QUESTIONS)
db_stories = sqlite3.connect(DATABASE_STORIES)


c_db_usr = db_usr.cursor()
c_db_img = db_img.cursor()
c_db_fr = db_fr.cursor()
c_db_sec = db_sec.cursor()
c_db_stories = db_stories.cursor()

def create_user_table():
    c_db_usr.execute("""CREATE TABLE users (
            username TEXT PRIMARY KEY,
            name TEXT,
            password TEXT,
            cover_image TEXT,
            profile_image TEXT,
            about TEXT,
            age INTEGER,
            location TEXT,
            gender TEXT,
            friends TEXT DEFAULT ''
            );""")
    db_usr.commit()

def create_friends_table():
    c_db_fr.execute("""
        CREATE TABLE IF NOT EXISTS friends (
            user_username TEXT,
            friend_username TEXT,
            PRIMARY KEY (user_username, friend_username)
        );
    """)
    db_fr.commit()

def create_img_table():
    c_db_img.execute("""
        CREATE TABLE images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            image BLOB NOT NULL,
            description TEXT,
            number_likes INTEGER DEFAULT 0,
            number_comments INTEGER DEFAULT 0,
            number_shares INTEGER DEFAULT 0,
            comment_list TEXT,
            liked_by TEXT DEFAULT '[]',
            upload_date TEXT NOT NULL
        );
    """)
    db_img.commit()

def create_security_questions_table():
    c_db_sec.execute("""
    CREATE TABLE IF NOT EXISTS security_questions (
        username TEXT PRIMARY KEY,
        question TEXT,
        answer TEXT
    );
    """)
    db_sec.commit()

def create_stories_table():
    c_db_stories.execute("""
        CREATE TABLE stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            image BLOB NOT NULL,
            date TEXT NOT NULL,
            nr_like INTEGER DEFAULT 0,
            apreciation_by TEXT DEFAULT '[]',
            media_type TEXT DEFAULT 'image'
        );
    """)
    db_stories.commit()

def add_user(user_object):
    c_db_usr.execute("""INSERT INTO users VALUES (:username, :password, :name, :cover_image, :profile_image, :about, :age, :location, :gender, :friends);""",
                     {'username': user_object.username,
                      'name': user_object.name,
                      'password': user_object.password,
                      'cover_image': user_object.cover_image,
                      'profile_image': user_object.profile_image,
                      'about': user_object.about,
                      'age': user_object.age,
                      'location': user_object.location,
                      'gender': user_object.gender,
                      'friends': user_object.friends})
    db_usr.commit()

def update_friends(user_obj, friends):
    c_db_usr.execute("""UPDATE users SET friends = :friends WHERE username = :username""",
                     {'username': user_obj.username,
                      'friends': json.dumps(friends)})
    db_usr.commit()

def hashPassword(password):
    """Hashes the password: plain-text password -> salted password"""
    password = password + "mcpuisor_stau_altfel_c3au!"
    return str(hashlib.md5(password.encode('utf-8')).hexdigest())

if __name__ == "__main__":
    create_user_table()
    create_friends_table()
    create_img_table()
    create_security_questions_table()
    create_stories_table()  # Adăugat

    user_1 = User("sabin_test4", hashPassword("sabin_test_pass"), 'Sabin', None, None, None, 22, None, None, "alexia_test4")
    user_2 = User("alexia_test4", hashPassword("alexia_test_pass"), 'Alexia', None, None, None, 21, None, None, "sorina_test4, sabin_test4")
    user_3 = User("sorina_test4", hashPassword("sorina_test_pass"), 'Sorina', None, None, None, 21, None, None, "alexia_test4")
    add_user(user_1)
    add_user(user_2)
    add_user(user_3)

    c_db_usr.execute("SELECT * from users")
    print(c_db_usr.fetchall())

    db_sec.commit()
    db_usr.commit()
    db_img.commit()
    db_fr.commit()
    db_stories.commit()

    db_sec.close()
    db_usr.close()
    db_img.close()
    db_fr.close()
    db_stories.close()