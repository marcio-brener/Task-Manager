from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import certifi
import os

# ==========================
# LOAD ENV
# ==========================
load_dotenv()

# ==========================
# APP
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# MONGO CONNECTION
# ==========================
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client.taskmanager
tasks_collection = db.tasks

# ==========================
# GET TASKS
# ==========================
@app.route("/tasks", methods=["GET"])
def get_tasks():

    tasks = []

    for task in tasks_collection.find():

        tasks.append({
            "_id": str(task["_id"]),
            "text": task.get("text", ""),
            "priority": task.get("priority", ""),
            "deadline": task.get("deadline", ""),
            "done": task.get("done", False)
        })

    return jsonify(tasks)

# ==========================
# CREATE TASK
# ==========================
@app.route("/tasks", methods=["POST"])
def create_task():

    data = request.json

    task = {
        "text": data.get("text"),
        "priority": data.get("priority"),
        "deadline": data.get("deadline"),
        "done": False
    }

    result = tasks_collection.insert_one(task)

    task["_id"] = str(result.inserted_id)

    return jsonify(task), 201

# ==========================
# UPDATE TASK
# ==========================
@app.route("/tasks/<id>", methods=["PUT"])
def update_task(id):

    data = request.json

    update_task = {
        "text": data.get("text"),
        "priority": data.get("priority"),
        "deadline": data.get("deadline"),
        "done": data.get("done", False)
    }

    tasks_collection.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": update_task
        }
    )

    return jsonify({
        "message": "Task atualizada com sucesso"
    })

# ==========================
# DELETE TASK
# ==========================
@app.route("/tasks/<id>", methods=["DELETE"])
def delete_task(id):

    tasks_collection.delete_one({
        "_id": ObjectId(id)
    })

    return jsonify({
        "message": "Task removida com sucesso"
    })

# ==========================
# TEST ROUTE
# ==========================
@app.route("/")
def home():

    return jsonify({
        "message": "API TaskManager funcionando 🚀"
    })

# ==========================
# RUN
# ==========================
if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )