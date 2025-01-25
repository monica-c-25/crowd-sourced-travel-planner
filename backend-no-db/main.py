from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/api/data', methods=['POST', 'GET'])
def request_handler():

    if request.method == 'POST':
        data = request.get_json()

        response = {
            'message': 'Data received successfully',
            'data': data
        }
        return jsonify(response)

    if request.method == 'GET':
        response = {
            'Request Method': 'POST',
            'Message': 'Have a Jolly Good Day'
        }
        return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True, port=8001)
