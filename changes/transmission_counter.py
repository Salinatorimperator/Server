from imutils.video import VideoStream
from imutils.video import FPS
import numpy as np
import argparse 
import imutils
import time
import cv2
import csv

from datetime import datetime

ap = argparse.ArgumentParser()
#ap.add_argument("-p". "--prototext", required=True, help="path to prototxt file")
#ap.add_argument("-m", "--model", required=True, help="path to model")
ap.add_argument("-c", "--confidence", type=float, default=0.4, help="minimum probability to filter weak detections")
args = vars(ap.parse_args())

print("[INFO] loading labels...")

CLASSES = [" "]
f = open('class_names.txt')
label_file = f.read()
f.close()
labels = label_file.split('\n')
for label in labels:
    CLASSES.append(label)
#COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))
COLORS = [(128, 128, 128), (0, 129, 0), (0, 32, 255), (255, 0, 0), (255, 224, 32)]

print("[INFO] loading model...")
#cvNet = cv2.dnn.readNetFromTensorflow(args["model"], args["prototext"])
cvNet = cv2.dnn.readNetFromCaffe('MobileNetSSD_deploy.prototxt', 'MobileNetSSD_deploy.caffemodel')

pass_filename = 'data.csv'

print("[INFO] starting video stream...")
vs = VideoStream(src=0).start()
time.sleep(2.0)
fps = FPS().start()

frame_cnt = 0
max_conf = -99.99
max_class = CLASSES[1]

start = datetime.now()
now = datetime.now()
interval = 30

with open(pass_filename, "w+", 1) as pass_file:

    pass_writer = csv.writer(pass_file, lineterminator="\n")
    header = ["State", "Timestamp"]
    pass_writer.writerow(header)

    while True:
        frame = vs.read()

        (rows, cols) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1.0/127.5, (300, 300), (127.5, 127.5, 127.5), swapRB=True, crop=False) 
    
        cvNet.setInput(blob)
        cvOut = cvNet.forward()
         
        idx = 1
        for detection in cvOut[0, 0, :, :]:
            confidence = float(detection[2])
        
            if confidence > args["confidence"]:
                idx = int(detection[1])

                left = detection[3] * cols
                top = detection[4] * rows
                right = detection[5] * cols
                bottom = detection[6] * rows

                label = "{}: {:.2f}%".format(CLASSES[idx], confidence * 100)
                cv2.rectangle(frame, (int(left), int(top)), (int(right), int(bottom)), COLORS[idx], 2)
                y = int(top) - 15 if int(top) - 15 > 15 else int(top) + 15
                cv2.putText(frame, label, (int(left), y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)


            if confidence > max_conf:
                max_conf = confidence
                max_class = CLASSES[idx]

        now = datetime.now()
        time_diff = now - start

        if (time_diff.total_seconds() > interval):  
            print("{},{}".format(max_class, now.strftime("%m/%d/%Y %H:%M:%S")))
            entry = [max_class, now.strftime("%m/%d/%Y %H:%M")]
            pass_writer.writerow(entry)
            start = datetime.now()


        cv2.imshow("Object Detection", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break

    fps.update()
    frame_cnt = frame_cnt + 1 

fps.stop()
print("[INFO] elapsed time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

cv2.destroyAllWindows()
vs.stop()
