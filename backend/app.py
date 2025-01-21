from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
# Handling corss-origin request between React frontend and Flask backend. (Allow React app on localhost:3000)
CORS(app, origins=["http://localhost:3000"])    

@app.route('/')
def index():
    return "This is the flask backend!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 46725))
    app.run(port=port, debug=True)