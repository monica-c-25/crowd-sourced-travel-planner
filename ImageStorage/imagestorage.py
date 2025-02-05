from flask import Flask, request, send_file, render_template, jsonify
from google.cloud import storage, datastore
import io


app = Flask(__name__)

client = datastore.Client()

# PHOTO_BUCKET = 'crowd-sourced-travel-planner-experience-photos'
# PHOTO_BUCKET = 'cs467-capstone-test-image-storage'
PHOTO_BUCKET = 'cs467-crowd-sourced-travel-planner-images'


@app.route('/images', methods=['GET'])
def upload_page():
    # Render the file upload form when visiting /images
    return render_template('file_upload.html')


@app.route('/images', methods=['POST'])
def store_image():
    # Any files in the request will be available in request.files object
    # Check if there is an entry in request.files with the key 'file'
    if 'file' not in request.files:
        return ('No file sent in request', 400)
    # Set file_obj to the file sent in the request
    file_obj = request.files['file']
    # If the multipart form data has a part with name 'tag', set the
    # value of the variable 'tag' to the value of 'tag' in the request.
    # Note we are not doing anything with the variable 'tag' in this
    # example, however this illustrates how we can extract data from the
    # multipart form data in addition to the files.
    # if 'tag' in request.form:
    #     tag = request.form['tag']
    # Create a storage client
    storage_client = storage.Client()
    # Get a handle on the bucket
    bucket = storage_client.get_bucket(PHOTO_BUCKET)
    # Create a blob object for the bucket with the name of the file
    blob = bucket.blob(file_obj.filename)
    # Position the file_obj to its beginning
    file_obj.seek(0)
    # Upload the file into Cloud Storage
    # blob.upload_from_file(file_obj)
    # return ({'file_name': file_obj.filename}, 201)
    # return redirect(url_for('upload_page', file_name=file_obj.filename))
    image_url = blob.public_url
    return jsonify({'image_url': image_url}, 201)


@app.route('/images/<file_name>', methods=['GET'])
def get_image(file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(PHOTO_BUCKET)
    # Create a blob with the given file name
    blob = bucket.blob(file_name)
    # Create a file object in memory using Python io package
    file_obj = io.BytesIO()
    # Download the file from Cloud Storage to the file_obj variable
    blob.download_to_file(file_obj)
    # Position the file_obj to its beginning
    file_obj.seek(0)
    # Send the object as a file in the response with the correct MIME type and file name
    image_url = blob.public_url
    return jsonify({'image_url': image_url})
    # return send_file(file_obj, mimetype=None, download_name=file_name)
    # return image_url  #Returns the url of the image instead of download


@app.route('/images/<file_name>', methods=['DELETE'])
def delete_image(file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(PHOTO_BUCKET)
    blob = bucket.blob(file_name)
    # Delete the file from Cloud Storage
    blob.delete()
    return '', 204


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
