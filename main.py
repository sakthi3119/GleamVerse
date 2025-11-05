"""
    Project Name:       ARJewelBox
    Author:             Asutosh Pati (https://in.linkedin.com/in/asutoshpati)
    Date of Creation:   21 Jul 2020
    Purpose:            Demonstration of AR filters using python
    Description:
        AR Jewel Box is a virtual jewellery trial application where a person can
        trial a new jewellery with out physically handling it. This program
        showcase how AI can be used to implement AR. And how AR can be
        implemented using python.

        ADVISORY:
             As this program is created by Asutosh Pati for educational purpose
             so use of this project with out authors consent is strictly
             prohibited. This project can only be used for teaching purpose
             with authors consent and other uses of this program is completely
             banned.

    Version:
        V 0.0.1: Released with beta version
"""

################################   Libraries   ################################

import ctypes
import os.path
import uuid
import threading

import cv2
import loader
from flask import Flask, Response, render_template_string

#############################   Global variables   ############################

# Uncomment the source you want to select;
# for file & rtsp don't forget to change the path in assets\configs\settings.json
# VID_SOURCE = "USB_CAM"
VID_SOURCE = "FILE"
# VID_SOURCE = "RTSP"

# Change to True if you need to flip image
NEED_FLIP = False

# Default width & height of the images
WIDTH = 720
HEIGHT = 640

# Store the current jewellery information
jewellery = None
impose = None
mx = my = None
dw = dh = None

# Web streaming globals
app = Flask(__name__)
latest_jpeg_bytes = None


app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable caching for development
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
app.static_url_path = '/static'
latest_jpeg_bytes = None

@app.route("/")
def index():
    return render_template_string(
        """
        <!doctype html>
        <html>
          <head>
            <title>ARJewelBox Preview</title>
            <style>
              body {
                background: #111;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              img {
                max-width: 100%;
                height: auto;
                border: 1px solid #444;
              }
            </style>
          </head>
          <body>
            <img src="{{ url_for('static', filename='jewellery/necklace3.png') }}" id="jewelry-img" style="display:none;"/>
            <img src="/video_feed" id="video-feed"/>
          </body>
        </html>
        """
    )


def _mjpeg_generator():
    global latest_jpeg_bytes
    boundary = b"--frame\r\n"
    while True:
        if latest_jpeg_bytes is not None:
            yield boundary + b"Content-Type: image/jpeg\r\n\r\n" + latest_jpeg_bytes + b"\r\n"


@app.route("/video_feed")
def video_feed():
    return Response(_mjpeg_generator(), mimetype="multipart/x-mixed-replace; boundary=frame")


#############################   Helper functions   ############################

def update_impose():
    """
    Update the new jewellery info when previous or next button is pressed.

    Returns:
        None
    """
    global impose, mx, my, dw, dh
    impose = jewellery["path"]
    mx, my = jewellery["x"], jewellery["y"]
    dw, dh = jewellery["dw"], jewellery["dh"]


def save_picture(curr_frame):
    """
    Save the current frame as JPEG image.

    Args:
        curr_frame (np.array): Current frame when user wanted to save it
    Returns:
        None
    """
    # Create the output folder if not exists
    if not os.path.exists(loader.get_absolute_path("captures", True)):
        os.makedirs(loader.get_absolute_path("captures", True))

    filename = r"captures\Capture_"+str(uuid.uuid4())[:6]+".jpg"
    filename = loader.get_absolute_path(filename, True)
    # Get a unique filename
    while os.path.exists(filename):
        filename = r"captures\Capture_" + str(uuid.uuid4())[:6]+".jpg"
        filename = loader.get_absolute_path(filename, True)
    cv2.imwrite(filename, curr_frame)


###############################   Main Program   ##############################

if __name__ == "__main__":
    # Set window icon during .exe execution
    MY_APP_ID = "asutosh.arjbx.v0.0.1"  # arbitrary string
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(MY_APP_ID)

    # Get the source from settings configuration file
    # print(loader.get_source(VID_SOURCE))
    cam = cv2.VideoCapture(loader.get_source(VID_SOURCE))
    cv2.imshow("preview", loader.generate_loading_screen(HEIGHT, WIDTH))

    # Load the required files into memory
    cascade, jewelleries = loader.load_files()
    jewel_key_list = list(jewelleries)

    # Set the first jewellery as current jewellery in use
    curr_jewel_index = 0
    jewellery = jewelleries[jewel_key_list[curr_jewel_index]]
    impose = jewellery["path"]
    mx, my = jewellery["x"], jewellery["y"]
    dw, dh = jewellery["dw"], jewellery["dh"]

    # Start reading the frames from source
    # alpha = 0.9 # 0.0 to 1.0
    check, frame = cam.read()
    cv2.waitKey(2000)

    # Start web server in background
    def _run_server():
        app.run(host="0.0.0.0", port=5000, debug=False, threaded=True, use_reloader=False)

    server_thread = threading.Thread(target=_run_server, daemon=True)
    server_thread.start()

    if check:
        # If able to read the source; start capturing frames
        while check:
            check, frame = cam.read()
            if not check:
                continue

            # If you need to flip the image horizontally;
            # just change the NEED_FLIP to True above in global variable section
            if NEED_FLIP:
                frame = cv2.flip(frame, 1)

            # Resize the frame
            frame = cv2.resize(frame, (WIDTH, HEIGHT))
            # cv2.imshow('preview', frame)

            # Detect available faces in frame
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # you can change the scaleFactor & minNeighbors if required
            faces = cascade.detectMultiScale(gray, scaleFactor=1.8, minNeighbors=3)
            # for x, y, w, h in faces:
            #     frame = cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 255, 0), 2)

            # Show the filter, if only 1 face is found otherwise it may create inconsistency
            # You can try with multiple faces... here
            if len(faces) == 1:
                # Extract face location
                x, y, w, h = faces[0]

                # Adjust the jewelery to the face's placement
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
                fw, fh = int(w * dw), int(w * dh)
                new_impose = cv2.resize(impose, (fw, fh))

                # Super impose the jewellery over captured frame
                iw, ih, c = new_impose.shape
                for i in range(0, iw):
                    for j in range(0, ih):
                        if new_impose[i, j][3] != 0:
                            if y + i + h + my < HEIGHT and x + j + mx < WIDTH:
                                # print(y + i + h + my, x + j + mx)
                                frame[y + i + h + my, x + j + mx] = new_impose[i, j]

            # Display the final image
            cv2.imshow("preview", frame)

            # Update web stream
            try:
                _, jpeg = cv2.imencode('.jpg', frame if frame.shape[2] == 3 else cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR))
                latest_jpeg_bytes = jpeg.tobytes()
            except Exception:
                pass

            # Set ESC key to quit the program
            k = cv2.waitKey(15)
            if k == 27:
                break

            # Goto next jewellery when N is pressed
            elif k == ord("n") or k == ord("N"):
                if curr_jewel_index + 1 != len(jewel_key_list):
                    curr_jewel_index += 1
                else:
                    curr_jewel_index = 0
                jewellery = jewelleries[jewel_key_list[curr_jewel_index]]
                update_impose()

            # Goto previous jewellery when P is pressed
            elif k == ord("p") or k == ord("P"):
                if curr_jewel_index - 1 < 0:
                    curr_jewel_index = len(jewel_key_list) - 1
                else:
                    curr_jewel_index -= 1
                jewellery = jewelleries[jewel_key_list[curr_jewel_index]]
                update_impose()

            # Save the picture when S is pressed
            elif k == ord("s") or k == ord("S"):
                save_picture(frame)

    else:
        print("Error: Can't read camera")

    cv2.destroyAllWindows()
    cam.release()
