from flask import Flask
from flask import request, jsonify, g
from datetime import datetime, timedelta, timezone
import jwt
import json
import requests
from flask_cors import CORS
import random
import hashlib
import string
import sqlite3
import base64

from datetime import datetime


########## Data section ##########
secretKey = "mcpuisor_stau_altfel_c3au!"
##################################

########## Database section ##########
DATABASE_USR = "storage/users.db"
DATABASE_IMGS = "storage/images.db"
DATABASE_FRIENDS = "storage/friends.db"
DATABASE_SEC = "storage/security_questions.db"
DATABASE_STORIES = "storage/stories.db"

##################################


def createToken(username):
    """Given an username, this will create and return a JWT for that username, valid for one day. If it fails, it returns None"""
    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(days=1, seconds=0),
            'iat': datetime.now(timezone.utc),
            'sub': username
        }

        return jwt.encode(
            payload,
            secretKey,
            algorithm='HS256'
        )
    except Exception as e:
        print(e)
        return ""


def checkToken(token):
    """Given a token, it will extract the username to which the token was given. If it fails (invalid token), it returns the error."""
    try:
        payload = jwt.decode(token, secretKey, algorithms=["HS256"])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return "Token Expired."
    except jwt.InvalidTokenError:
        return "Invalid Token."


def hashPassword(password):
    """Hashses the password: plain-text password -> salted password"""
    password = password + secretKey
    return str(hashlib.md5(password.encode('utf-8')).hexdigest())


def createServer():
    app = Flask(__name__)
    CORS(app)

    @app.route("/")
    def sayHi():
        return "Hi, there!"

    def get_user_field(username, field):
        valid_fields = ['name', 'cover_image', 'profile_image', 'about', 'age', 'location', 'gender']

        if field not in valid_fields:
            return "ERROR: Invalid field requested.", 400

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        # SQL SELECT statement to fetch a specific field for a given username
        select_query = f"SELECT {field} FROM users WHERE username = ?"

        cursor.execute(select_query, (username,))
        result = cursor.fetchone()

        if result:
            return result[0], 200
        else:
            return "ERROR: No user found with the specified username.", 400

    def add_new_user(username, password):
        insert_query = """INSERT INTO users (username, password) VALUES (?, ?)"""
        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        try:
            cursor.execute(insert_query, (username, password))
            db_temp.commit()
        except sqlite3.InternalError:
            return "User already exists."

        return "OK"

    def update_age(username, age):
        update_query = """UPDATE users SET age = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (age, username))
        db_temp.commit()


    def update_profile_image(username, profile_image):
        update_query = """UPDATE users SET profile_image = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (profile_image, username))
        db_temp.commit()

    def update_cover_image(username, cover_image):
        update_query = """UPDATE users SET cover_image = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (cover_image, username))
        db_temp.commit()


    def update_gender(username, gender):
        update_query = """UPDATE users SET gender = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (gender, username))
        db_temp.commit()


    def update_name(username, name):
        update_query = """UPDATE users SET name = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (name, username))
        db_temp.commit()

    def update_password(username, password):
        update_query = """UPDATE users SET password = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (hashPassword(password), username))
        db_temp.commit()


    def update_location(username, location):
        update_query = """UPDATE users SET location = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (location, username))
        db_temp.commit()

    def update_about(username, about):
        update_query = """UPDATE users SET about = ? WHERE username = ?"""

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (about, username))
        db_temp.commit()

    def get_db_usr():
        db = getattr(g, '_db_usr', None)
        if db is None:
            db = g._db_usr = sqlite3.connect(DATABASE_USR)

        return db
    def get_db_fr():
        db = getattr(g, '_db_fr', None)
        if db is None:
            db = g._db_fr = sqlite3.connect(DATABASE_FRIENDS)
        return db

    def get_db_imgs():
        db = getattr(g, '_db_imgs', None)
        if db is None:
            db = g._db_usr = sqlite3.connect(DATABASE_IMGS)

        return db

    def get_db_sec():
        db = getattr(g, '_db_sec', None)
        if db is None:
            db = g._db_usr = sqlite3.connect(DATABASE_SEC)

        return db

    @app.teardown_appcontext
    def teardown_dbs(exception):
        db_usr = g.pop('_db_usr', None)
        db_imgs = g.pop('_db_imgs', None)
        db_stories = g.pop('_db_stories', None)

        if db_usr is not None:
            db_usr.close()

        if db_imgs is not None:
            db_imgs.close()

        if db_stories is not None:
            db_stories.close()

    def checkCredentials(username, password):
        cur = get_db_usr().cursor()

        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        fetched_data = cur.fetchone()
        
        if not fetched_data:
            return False
        return fetched_data[2] == password 
    

    @app.route("/login", methods=['POST'])
    def login():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        username = content["username"]
        password = content["password"]

        password = hashPassword(password)

        if not checkCredentials(username, password):
            return {
                "status": "Wrong credentials"
            }, 400

        userToken = createToken(username)

        if userToken is None:
            print("Somehow JWT creation failed and should be inspected.")
            return {
                "status": "Server failed for some reason"
            }, 400

        print("New token {} generated for {} user.".format(userToken, username))

        return {
            "status": "OK",
            "token": str(userToken)
        }

    @app.route("/change_age", methods=['POST'])
    def change_age():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_age = content["age"]
        username = tokenVerify

        update_age(username, new_age)

        return {
            "status": "OK"
        }

    # @app.route("/change_password", methods=['POST'])
    # def change_password():
    #     if request.headers.get('Content-Type') != 'application/json':
    #         return {"status": "Only application/json supported as content-type"}, 400

    #     authValue = request.headers.get('Authorization')

    #     if authValue is None:
    #         return {
    #             "status": "Bearer token required."
    #         }, 400

    #     token = authValue[7:]

    #     tokenVerify = checkToken(token)

    #     if "Expired" in tokenVerify or "Invalid" in tokenVerify:
    #         return {
    #             "status": tokenVerify,
    #         }, 400

    #     content = json.loads(request.data)
    #     new_password = content["password"]
    #     username = tokenVerify

    #     update_password(username, new_password)

    #     return {
    #         "status": "OK"
    #     }

    @app.route("/change_name", methods=['POST'])
    def change_name():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_name = content["name"]
        username = tokenVerify

        update_name(username, new_name)

        return {
            "status": "OK"
        }

    @app.route("/change_gender", methods=['POST'])
    def change_gender():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_gender = content["gender"]
        username = tokenVerify

        update_gender(username, new_gender)

        return {
            "status": "OK"
        }


    @app.route("/change_location", methods=['POST'])
    def change_location():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_loc = content["location"]
        username = tokenVerify

        update_location(username, new_loc)

        return {
            "status": "OK"
        }


    @app.route("/change_about", methods=['POST'])
    def change_about():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_about = content["about"]
        username = tokenVerify

        update_about(username, new_about)

        return {
            "status": "OK"
        }

    @app.route("/change_profile_image", methods=['POST'])
    def change_profile_image():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_profile = content["profile_image"]
        username = tokenVerify

        update_profile_image(username, new_profile)

        return {
            "status": "OK"
        }

    @app.route("/change_cover_image", methods=['POST'])
    def change_cover_image():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        content = json.loads(request.data)
        new_cover = content["cover_image"]
        username = tokenVerify

        update_cover_image(username, new_cover)

        return {
            "status": "OK"
        } 

    @app.route("/getUsers", methods=['GET'])
    def get_users():

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        cur = get_db_usr().cursor()
        cur.execute("SELECT username FROM users",)
        fetched_data = cur.fetchall()

        return fetched_data
    
    @app.route("/get/<field>", methods=['GET'])
    def get_field(field):
        # print(request.headers)
        # if request.headers.get('Content-Type') != 'application/json':
        #     return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        username =  request.args.get('username')


        field_value, status_code = get_user_field(username, field)

        return {
            "value": field_value
        }, status_code


    @app.route("/getScores/<gameName>")
    def getScores(gameName):
        scores = []

        gameData = gamesCollection.find_one({"title": gameName})

        if gameData is None:
            return {
                "status": "Game does not exist"
            }, 400

        gameID = gameData["_id"]

        scoresData = scoresCollection.find({"game": gameID})

        for score in scoresData:
            username = getUserByID(score["user"])
            scores.append({
                "user": username,
                "score": score["score"]
            })

        return {
            "status": "OK",
            "scores": scores
        }

    @app.route("/getGames")
    def getGames():
        gamesList = []

        gamesData = gamesCollection.find()
        if gamesData is None:
            return {
                "status": "No games",
                "games": [],
            }

        for gameData in gamesData:
            gamesList.append({
                "name": gameData["title"],
                "text": gameData["description"],
            })

        return {
            "status": "OK",
            "games": gamesList,
        }

    @app.route("/register", methods=['PUT'])
    def register():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        username = content["username"]
        password = content["password"]
        password = hashPassword(password)

        if username == "":
            return {
                "status": "Please provide a username",
            }, 400

        if "password" == "":
            return {
                "status": "Please provide a password",
            }, 400

        return_msg = add_new_user(username, password)
        return_code = 400 if "exists" in return_msg else 200

        return {
            "status": return_msg
        }, return_code

    @app.route("/images/<imageName>", methods=['GET'])
    def getImage(imageName):
        imageID = ""

        gameData = gamesCollection.find_one({"title": imageName})

        if gameData is None:
            return {
                "status": "Bad filename."
            }, 400

        imageID = gameData["imageID"]

        imageData = gridFS.get(imageID)

        return imageData.read()

    @app.route("/verifyToken", methods=['GET'])
    def verifyToken():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {
                "status": "Bearer token required."
            }, 400

        token = authValue[7:]

        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {
                "status": tokenVerify,
            }, 400

        return {
            "status": "OK"
        }

    @app.route("/addScore/<gameTitle>", methods=['POST'])
    def addScore(gameTitle):
        reqHeaders = dict(request.headers)
        url = request.base_url[:-(len(gameTitle) + 9)] + "verifyToken"

        reqVerifyToken = requests.get(url, headers=reqHeaders)
        if "OK" not in reqVerifyToken.text:
            return reqVerifyToken.json(), 400

        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        score = content["score"]

        gameID = getGameID(gameTitle)

        authValue = request.headers.get('Authorization')
        token = authValue[7:]
        tokenSub = checkToken(token)

        userID = getUserID(tokenSub)

        scoreData = scoresCollection.find_one({"game": gameID, "user": userID})

        if scoreData is None:
            scoresCollection.insert_one(
                {"game": gameID, "user": userID, "score": score}
            )
        else:
            if int(score) > int(scoreData["score"]):
                scoresCollection.update_one({
                    '_id': scoreData["_id"]
                }, {
                    '$set': {
                        'score': score
                    }
                }, upsert=False)

        return {
            "status": "OK"
        }

    @app.route("/getUsername", methods=['GET'])
    def getUsername():
        reqHeaders = dict(request.headers)
        url = request.base_url[:-11] + "verifyToken"

        reqVerifyToken = requests.get(url, headers=reqHeaders)
        if "OK" not in reqVerifyToken.text:
            return reqVerifyToken.json(), 400

        # if request.headers.get('Content-Type') != 'application/json':
        #     return {
        #         "status": "Only application/json supported as content-type"
        #     }, 400

        authValue = request.headers.get('Authorization')
        token = authValue[7:]
        tokenSub = checkToken(token)

        return {
            "status": "OK",
            "username": tokenSub
        }

    @app.route("/getUserScores", methods=['GET'])
    def getUserScores():
        reqHeaders = dict(request.headers)
        url = request.base_url[:-13] + "verifyToken"

        reqVerifyToken = requests.get(url, headers=reqHeaders)
        if "OK" not in reqVerifyToken.text:
            return reqVerifyToken.json(), 400

        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        authValue = request.headers.get('Authorization')
        token = authValue[7:]
        tokenSub = checkToken(token)

        userID = getUserID(tokenSub)

        scoreData = scoresCollection.find({"user": userID})

        userScores = []

        if scoreData is None:
            return {
                "status": "OK",
                "scores": []
            }

        for score in scoreData:
            userScores.append({
                "score": score["score"],
                "game": getGameByID(score["game"])
            })

        return {
            "status": "OK",
            "scores": userScores,
        }

    @app.route("/follow/<userToFollow>", methods=['PUT'])
    def followUser(userToFollow):
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        username = tokenVerify
        current_friends = get_friends(username)
        if userToFollow not in current_friends:
            current_friends.append(userToFollow)
            update_friends(username, current_friends)
        return {"status": "OK"}
    

    @app.route("/following", methods=['GET'])
    def following():
        reqHeaders = dict(request.headers)
        url = request.base_url[:-9] + "verifyToken"

        reqVerifyToken = requests.get(url, headers=reqHeaders)
        if "OK" not in reqVerifyToken.text:
            return reqVerifyToken.json(), 400

        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        authValue = request.headers.get('Authorization')
        token = authValue[7:]
        tokenSub = checkToken(token)

        userID = getUserID(tokenSub)

        userData = usersCollection.find_one({"_id": userID})

        if userData is None:
            return {
                "status": "OK",
                "data": []
            }

        following = userData["following"]

        if following == "":
            return {
                "status": "OK",
                "data": []
            }

        tempUsers = following.split(",")

        followingUsersScores = []

        for user in tempUsers:
            tempUserID = getUserID(user)

            scoreData = scoresCollection.find({"user": tempUserID})

            if scoreData is None:
                continue

            for score in scoreData:
                followingUsersScores.append({
                    "score": score["score"],
                    "game": getGameByID(score["game"]),
                    "username": user
                })

        return {
            "status": "OK",
            "data": followingUsersScores
        }

    @app.route("/unfollow/<userToUnfollow>", methods=['PUT'])
    def unfollowUser(userToUnfollow):
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        username = tokenVerify
        current_friends = get_friends(username)
        if userToUnfollow in current_friends:
            current_friends.remove(userToUnfollow)
            update_friends(username, current_friends)
        return {"status": "OK"}

    @app.route("/getQuote", methods=['GET'])
    def getQuote():
        reqHeaders = dict(request.headers)
        url = request.base_url[:-8] + "verifyToken"

        reqVerifyToken = requests.get(url, headers=reqHeaders)
        if "OK" not in reqVerifyToken.text:
            return reqVerifyToken.json(), 400

        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        randomQuote = random.choice(quotes)

        return {
            "status": "OK",
            "data": randomQuote
        }

    @app.route("/resetPassCode", methods=['POST'])
    def resetPassCode():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        username = content["username"]

        resetCode = ''.join(random.choices(string.ascii_lowercase, k=10))

        print("************** Reset Code for {} *************************".format(username))
        print("===> {}".format(resetCode))
        print("**********************************************************")

        resetPasswordsCodes[resetCode] = username

        return {
            "status": "OK",
        }

    @app.route("/resetPass", methods=['POST'])
    def resetPass():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        newPass = content["pass"]
        resetCode = content["code"]

        if resetCode not in resetPasswordsCodes.keys():
            return {
                "status": "Code is not good"
            }

        userToReset = resetPasswordsCodes[resetCode]
        userToResetID = getUserID(userToReset)

        if userToResetID == "":
            return {
                "status": "OK"
            }

        usersCollection.update_one({
            '_id': userToResetID
        }, {
            '$set': {
                'password': hashPassword(newPass)
            }
        }, upsert=False)

        return {
            "status": "OK",
        }


    # vali
    def get_current_datetime():
        """Returns the current date and time in the format 'YYYY-MM-DD HH:MM:SS'"""
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def add_image(username, image, description):
        insert_query = """
            INSERT INTO images (username, image, description, upload_date) 
            VALUES (?, ?, ?, ?)
        """
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()
        upload_date = get_current_datetime()  # Folosim funcția pentru a obține data și ora curente

        cursor.execute(insert_query, (username, image, description, upload_date))
        db_temp.commit()

    def get_images_by_user(username):
        select_query = """
            SELECT id, image, description, number_likes, number_comments, number_shares, comment_list, upload_date
            FROM images 
            WHERE username = ?
        """
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query, (username,))
        result = cursor.fetchall()
        images = []
        for row in result:
            images.append({
                "id": row[0],
                "image": base64.b64encode(row[1]).decode('utf-8'),
                "description": row[2],
                "number_likes": row[3],
                "number_comments": row[4],
                "number_shares": row[5],
                "comment_list": row[6],
                "upload_date": row[7]  # Adăugăm `upload_date`
            })
        return images

    
    @app.route("/upload_image", methods=['POST'])
    def upload_image():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        username = tokenVerify
        image = base64.b64decode(content["image"])
        description = content.get("description", "")

        add_image(username, image, description)

        return {"status": "OK", "upload_date": get_current_datetime()}  # Returnăm `upload_date`
# stop aici

    @app.route("/images", methods=['GET'])
    def get_user_images():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        username = request.args.get('username', tokenVerify)
        images = get_images_by_user(username)

        return jsonify(images)

    def update_likes(image_id, liked, username):
        select_query = "SELECT number_likes, liked_by FROM images WHERE id = ?"
        update_query = "UPDATE images SET number_likes = ?, liked_by = ? WHERE id = ?"
        
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query, (image_id,))
        result = cursor.fetchone()

        if result is None:
            return "Image not found", 400

        number_likes, liked_by = result
        liked_by = json.loads(liked_by)

        if liked and username not in liked_by:
            liked_by.append(username)
            number_likes += 1
        elif not liked and username in liked_by:
            liked_by.remove(username)
            number_likes -= 1

        cursor.execute(update_query, (number_likes, json.dumps(liked_by), image_id))
        db_temp.commit()

        return "OK", 200


    @app.route("/update_likes", methods=['POST'])
    def update_likes_route():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        image_id = content["image_id"]
        liked = content["liked"]

        status, code = update_likes(image_id, liked, tokenVerify)
        return {"status": status}, code

    
    @app.route("/update_comment_list", methods=['POST'])
    def update_comment_list_route():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        image_id = content["image_id"]
        comment_list = json.dumps(content["comment_list"])

        update_comment_list(image_id, comment_list)
        return {"status": "OK"}
    
    def update_comment_list(image_id, comment_list):
        number_comments = len(comment_list)
        update_query = "UPDATE images SET comment_list = ?, number_comments = ? WHERE id = ?"
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()
        cursor.execute(update_query, (json.dumps(comment_list), number_comments, image_id))
        db_temp.commit()

    @app.route("/add_comment", methods=['POST'])
    def add_comment():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        image_id = content["image_id"]
        new_comment = content["comment"]
        new_comment["user"] = tokenVerify  # Add the username to the comment

        # Fetch existing comments
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()
        cursor.execute("SELECT comment_list FROM images WHERE id = ?", (image_id,))
        result = cursor.fetchone()
        if result is None:
            return {"status": "Image not found"}, 400

        comment_list = json.loads(result[0]) if result[0] else []
        comment_list.append(new_comment)

        update_comment_list(image_id, comment_list)
        return {"status": "OK", "comment_list": comment_list, "number_comments": len(comment_list)}

        
    def update_comment_like(image_id, comment_id, liked):
        select_query = "SELECT comment_list FROM images WHERE id = ?"
        update_query = "UPDATE images SET comment_list = ?, number_comments = ? WHERE id = ?"
        
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query, (image_id,))
        result = cursor.fetchone()

        if result is None:
            return "Image not found", 400

        comment_list = json.loads(result[0]) if result[0] else []

        for comment in comment_list:
            if comment["id"] == comment_id:
                comment["liked"] = liked
                comment["likes"] += 1 if liked else -1
                break

        cursor.execute(update_query, (json.dumps(comment_list), len(comment_list), image_id))
        db_temp.commit()

        return "OK", 200
    
    @app.route("/update_comment_like", methods=['POST'])
    def update_comment_like_route():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        image_id = content["image_id"]
        comment_id = content["comment_id"]
        liked = content["liked"]

        status, code = update_comment_like(image_id, comment_id, liked)
        return {"status": status}, code
    
    def update_friends(username, friends):
        update_query = """UPDATE users SET friends = ? WHERE username = ?"""
        db_temp = get_db_usr()
        cursor = db_temp.cursor()
        cursor.execute(update_query, (json.dumps(friends), username))
        db_temp.commit()

    def get_friends(user_username):
        select_query = """SELECT friends FROM users WHERE username = ?"""
        db_temp = get_db_usr()
        cursor = db_temp.cursor()
        cursor.execute(select_query, (user_username,))
        result = cursor.fetchone()
        return json.loads(result[0]) if result else []

    @app.route("/add_friend", methods=['POST'])
    def add_friend():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400
        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400
        content = json.loads(request.data)
        friend_username = content["friend_username"]
        username = tokenVerify
        current_friends = get_friends(username)
        if friend_username not in current_friends:
            current_friends.append(friend_username)
            update_friends(username, current_friends)
        return {"status": "OK"}

    @app.route("/remove_friend", methods=['POST'])
    def remove_friend():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400
        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400
        content = json.loads(request.data)
        friend_username = content["friend_username"]
        username = tokenVerify
        current_friends = get_friends(username)
        if friend_username in current_friends:
            current_friends.remove(friend_username)
            update_friends(username, current_friends)
        return {"status": "OK"}

    @app.route("/get_friends", methods=['GET'])
    def get_friends_route():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400
        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400
        username = request.args.get('username', tokenVerify)
        friends = get_friends(username)
        return jsonify(friends)
    
# vali2
    def update_username(old_username, new_username):
        update_query = """UPDATE users SET username = ? WHERE username = ?"""
        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (new_username, old_username))
        db_temp.commit()

    @app.route("/change_username", methods=['POST'])
    def change_username():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        old_username = content["old_username"]
        new_username = content["new_username"]

        if old_username == "" or new_username == "":
            return {
                "status": "Please provide both old and new usernames",
            }, 400

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        # Check if the new username already exists
        cursor.execute("SELECT username FROM users WHERE username = ?", (new_username,))
        if cursor.fetchone():
            return {
                "status": "Username already exists"
            }, 400

        # Update the username
        cursor.execute("UPDATE users SET username = ? WHERE username = ?", (new_username, old_username))
        db_temp.commit()

        return {
            "status": "OK"
        }, 200
    
    @app.route("/delete_user", methods=['POST'])
    def delete_user():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        username = content["username"]
        password = content["password"]

        if username == "" or password == "":
            return {
                "status": "Please provide both username and password",
            }, 400

        password = hashPassword(password)

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        # Check if the username and password are correct
        cursor.execute("SELECT username FROM users WHERE username = ? AND password = ?", (username, password))
        if cursor.fetchone() is None:
            return {
                "status": "Invalid username or password"
            }, 400

        # Delete the user
        cursor.execute("DELETE FROM users WHERE username = ?", (username,))
        db_temp.commit()

        return {
            "status": "OK"
        }, 200

    @app.route("/change_password", methods=['POST'])
    def change_password():
        if request.headers.get('Content-Type') != 'application/json':
            return {
                "status": "Only application/json supported as content-type"
            }, 400

        content = json.loads(request.data)
        username = content["username"]
        old_password = content["old_password"]
        new_password = content["new_password"]

        if username == "" or old_password == "" or new_password == "":
            return {
                "status": "Please provide username, old password, and new password",
            }, 400

        old_password = hashPassword(old_password)
        new_password = hashPassword(new_password)

        db_temp = get_db_usr()
        cursor = db_temp.cursor()

        # Check if the username and old password are correct
        cursor.execute("SELECT username FROM users WHERE username = ? AND password = ?", (username, old_password))
        if cursor.fetchone() is None:
            return {
                "status": "Invalid username or old password"
            }, 400

        # Update the password
        cursor.execute("UPDATE users SET password = ? WHERE username = ?", (new_password, username))
        db_temp.commit()

        return {
            "status": "OK"
        }, 200

    def update_security_question(username, question, answer):
        update_query = """
        INSERT INTO security_questions (username, question, answer) 
        VALUES (?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET 
        question = excluded.question, answer = excluded.answer
        """

        db_temp = get_db_sec()
        cursor = db_temp.cursor()

        cursor.execute(update_query, (username, question, answer))
        db_temp.commit()


    @app.route("/update_security_question", methods=['POST'])
    def update_security_question_route():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)
        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        question = content["question"]
        answer = content["answer"]

        username = tokenVerify
        update_security_question(username, question, answer)

        return {"status": "OK"}

# vali3
    def get_all_images():
        select_query = """
            SELECT id, username, image, description, number_likes, number_comments, number_shares, comment_list, upload_date
            FROM images
            ORDER BY upload_date ASC
        """
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query)
        result = cursor.fetchall()
        images = []
        for row in result:
            images.append({
                "id": row[0],
                "username": row[1],
                "image": base64.b64encode(row[2]).decode('utf-8'),
                "description": row[3],
                "number_likes": row[4],
                "number_comments": row[5],
                "number_shares": row[6],
                "comment_list": row[7],
                "upload_date": row[8]
            })
        return images


    @app.route("/imagess", methods=['GET'])
    def get_all_images_route():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        images = get_all_images()
        return jsonify(images)

    def get_all_images_desc():
        select_query = """
            SELECT id, username, image, description, number_likes, number_comments, number_shares, comment_list, upload_date
            FROM images
            ORDER BY upload_date DESC
        """
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query)
        result = cursor.fetchall()
        images = []
        for row in result:
            images.append({
                "id": row[0],
                "username": row[1],
                "image": base64.b64encode(row[2]).decode('utf-8'),
                "description": row[3],
                "number_likes": row[4],
                "number_comments": row[5],
                "number_shares": row[6],
                "comment_list": row[7],
                "upload_date": row[8]
            })
        return images

    def get_all_images_by_likes():
        select_query = """
            SELECT id, username, image, description, number_likes, number_comments, number_shares, comment_list, upload_date
            FROM images
            ORDER BY number_likes ASC
        """
        db_temp = get_db_imgs()
        cursor = db_temp.cursor()

        cursor.execute(select_query)
        result = cursor.fetchall()
        images = []
        for row in result:
            images.append({
                "id": row[0],
                "username": row[1],
                "image": base64.b64encode(row[2]).decode('utf-8'),
                "description": row[3],
                "number_likes": row[4],
                "number_comments": row[5],
                "number_shares": row[6],
                "comment_list": row[7],
                "upload_date": row[8]
            })
        return images

    @app.route("/images_desc", methods=['GET'])
    def get_all_images_desc_route():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        images = get_all_images_desc()
        return jsonify(images)

    @app.route("/images_by_likes", methods=['GET'])
    def get_all_images_by_likes_route():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        images = get_all_images_by_likes()
        return jsonify(images)







    def get_current_datetime():
        """Returns the current date and time in the format 'YYYY-MM-DD HH:MM:SS'"""
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def add_story(username, media, media_type, date):
        insert_query = """
            INSERT INTO stories (username, image, media_type, date) 
            VALUES (?, ?, ?, ?)
        """
        db_temp = get_db_stories()
        cursor = db_temp.cursor()

        cursor.execute(insert_query, (username, media, media_type, date))
        db_temp.commit()



    def get_all_stories():
        select_query = """
            SELECT id, username, image, media_type, nr_like, apreciation_by 
            FROM stories
        """
        db_temp = get_db_stories()
        cursor = db_temp.cursor()

        cursor.execute(select_query)
        result = cursor.fetchall()
        stories = []
        for row in result:
            stories.append({
                "id": row[0],
                "username": row[1],
                "media": base64.b64encode(row[2]).decode('utf-8'),
                "mediaType": row[3],
                "nr_likes": row[4],
                "apreciation_by": json.loads(row[5]),
            })
        return stories


    def get_db_stories():
        db = getattr(g, '_db_stories', None)
        if db is None:
            db = g._db_stories = sqlite3.connect(DATABASE_STORIES)
        return db

    @app.route("/stories", methods=['GET'])
    def get_stories():
        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        stories = get_all_stories()
        return jsonify(stories)

    @app.route("/add_story", methods=['POST'])
    def add_story_route():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        username = tokenVerify
        media = base64.b64decode(content["media"])
        media_type = content["mediaType"]

        add_story(username, media, media_type, get_current_datetime())

        return {"status": "OK", "date": get_current_datetime()}


    @app.route("/update_story_like", methods=['POST'])
    def update_story_like():
        if request.headers.get('Content-Type') != 'application/json':
            return {"status": "Only application/json supported as content-type"}, 400

        authValue = request.headers.get('Authorization')

        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        story_id = content["story_id"]
        liked = content["liked"]
        username = tokenVerify

        # Fetch the story from the database
        db_temp = get_db_stories()
        cursor = db_temp.cursor()

        cursor.execute("SELECT nr_like, apreciation_by FROM stories WHERE id = ?", (story_id,))
        result = cursor.fetchone()

        if result is None:
            return {"status": "Story not found"}, 400

        nr_likes, apreciation_by = result
        apreciation_by = json.loads(apreciation_by)

        if liked and username not in apreciation_by:
            apreciation_by.append(username)
            nr_likes += 1
        elif not liked and username in apreciation_by:
            apreciation_by.remove(username)
            nr_likes -= 1

        cursor.execute("UPDATE stories SET nr_like = ?, apreciation_by = ? WHERE id = ?", (nr_likes, json.dumps(apreciation_by), story_id))
        db_temp.commit()

        return {"status": "OK"}, 200


    def get_current_friends(username):
        cursor = get_db_usr().cursor()

        query = '''
           SELECT friends FROM users WHERE username = ?
           '''

        try:
            cursor.execute(query, (username,))
            result = cursor.fetchone()
            if result:
                return result[0].split(',')  # Assuming friends field contains a list or comma-separated string
            else:
                return None
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            return None
        
        
    def get_current_friends_reqs(username):
        cursor = get_db_fr().cursor()

        query = '''
           SELECT user_username FROM friends WHERE friend_username = ?
           '''

        try:
            cursor.execute(query, (username,))
            result = cursor.fetchall()
            if result:
                return [x[0] for x in result]
            else:
                return None
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            return None

    def try_add_friend(username, friend_id):
        current_friends = get_current_friends(username)

        if friend_id in current_friends:
            return "error"

        db_temp = get_db_fr()
        cursor = db_temp.cursor()
        cursor.execute(
            """INSERT INTO friends ('user_username', 'friend_username')
                    SELECT :user_username, :friend_username
                    WHERE NOT EXISTS (
                        SELECT 1 FROM friends 
                        WHERE user_username = :user_username AND friend_username = :friend_username
                    );""",
            {'user_username': username,
             'friend_username': friend_id})
        db_temp.commit()

        return "Ok"


    def try_accept_friend_req(username, friend_id):
        current_friends = get_current_friends(username)
        current_friend_reqs = get_current_friends_reqs(username)

        if friend_id in current_friends:
            return "error"

        if friend_id not in current_friend_reqs:
            return "error"

        current_friends.append(friend_id)
        current_friends_str = ",".join(current_friends)

        db_temp = get_db_fr()
        cursor = db_temp.cursor()
        cursor.execute(
            """DELETE FROM friends WHERE user_username = :user_username AND friend_username = :friend_username""" ,
            {'user_username': friend_id,
             'friend_username': username})
        db_temp.commit()

        db_temp = get_db_usr()
        cursor = db_temp.cursor()
        cursor.execute(
            """UPDATE users SET friends = :friends 
               WHERE username = :username;""",
            {'friends': current_friends_str,
             'username': username})

        current_friends = get_current_friends(friend_id)
        current_friends.append(username)
        current_friends_str = ",".join(current_friends)

        cursor.execute(
            """UPDATE users SET friends = :friends 
               WHERE username = :username""",
            {'friends':  current_friends_str ,
             'username': friend_id})
        db_temp.commit()



        return "Ok"




    def try_cancel_friend_req(username, friend_id):
        current_friends = get_current_friends(username)
        #current_friend_reqs = get_current_friends_reqs(username)

        if friend_id in current_friends:
            return "error"

        # if friend_id not in current_friend_reqs:
        #     return "error"

        current_friends.append(friend_id)
        current_friends_str = ",".join(current_friends)

        db_temp = get_db_fr()
        cursor = db_temp.cursor()
        cursor.execute(
            """DELETE FROM friends WHERE user_username = :user_username AND friend_username = :friend_username""" ,
            {'user_username': username ,
             'friend_username': friend_id})
        db_temp.commit()


        return "Ok"


    def try_delete_friend(username, friend_id):
        current_friends = get_current_friends(username)

        if friend_id not in current_friends:
            return "error"

        current_friends.remove(friend_id)
        current_friends_str = ",".join(current_friends)

        db_temp = get_db_usr()
        cursor = db_temp.cursor()
        cursor.execute(
            """UPDATE users SET friends = :friends 
               WHERE username = :username;""",
            {'friends': current_friends_str,
             'username': username})

        db_temp.commit()

        return "Ok"



    @app.route("/add_friend_request", methods=['POST'])
    def add_friend_request():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)

        status_action = try_add_friend(tokenVerify, content["friend_username"])

        return {"status": status_action}

    @app.route("/accept_friend_request", methods=['POST'])
    def accept_friend_request():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        friend_id = content["friend_username"]

        status_action = try_accept_friend_req(tokenVerify, friend_id)
        return {"status": status_action}

    @app.route("/cancel_friend_request", methods=['POST'])
    def cancel_friend_request():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        friend_id = content["friend_username"]

        status_action = try_cancel_friend_req(tokenVerify, friend_id)
        return {"status": status_action}

    @app.route("/delete_friend_request", methods=['POST'])
    def delete_friend_request():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        content = json.loads(request.data)
        friend_id = content["friend_username"]

        status_action_1 = try_delete_friend(tokenVerify, friend_id)
        status_action_2 = try_delete_friend(friend_id, tokenVerify)
        status = status_action_1 and status_action_2
        return {"status": status}


    @app.route("/get_list_requests", methods=['GET'])
    def get_list_requests():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        result = get_current_friends_reqs(tokenVerify)
        if result is None:
            return {"status": "No friend requests"}
        return {"result": result}

    @app.route("/get_friends_request", methods=['GET'])
    def get_friends_request():
        authValue = request.headers.get('Authorization')
        if authValue is None:
            return {"status": "Bearer token required."}, 400

        token = authValue[7:]
        tokenVerify = checkToken(token)

        if "Expired" in tokenVerify or "Invalid" in tokenVerify:
            return {"status": tokenVerify}, 400

        result = get_current_friends(tokenVerify)
        if len(result) == 1 and (result[0] == '' or result is None):
            return {"status": "No friends"}
        return {"result": result}



    return app

if __name__ == "__main__":
    app = createServer()
    app.run(host='0.0.0.0', port=5001)
