#neural-server.py
import librosa
import numpy as np
import os
from keras.models import load_model
from flask import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

GENRES = {'metal': 0, 'disco': 1, 'classical': 2, 'hiphop': 3, 'jazz': 4,
          'country': 5, 'pop': 6, 'blues': 7, 'reggae': 8, 'rock': 9}
NUM_GENRES = len(GENRES)
MODEL_FILE = './model.h5'
SAMPLE_SIZE = 660000


@app.route('/', methods=['GET'])
@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename="index.html"):
    return app.send_static_file(filename)

@app.route('/', methods=['POST'])
def classify():
    """
    Main function of the program
    load the music, load the model and test it
    :return: nothing
    """
    f = request.files['file']
    f.save("brano.mp3")

    # Load model
    model = load_model(MODEL_FILE)

    # Load song
    signal, _ = librosa.load("brano.mp3")

    # Process song
    nb_samples = int(len(signal)/SAMPLE_SIZE)
    spectrograms = []
    for i in range(nb_samples):
        part = signal[i * SAMPLE_SIZE: (i+1) * SAMPLE_SIZE]
        splits, _ = split_song(part, 0)
        spectr_part = generate_spectrograms(splits)

        spectrograms.extend(spectr_part)

    spectrograms = np.array(spectrograms)

    # Run into model
    results = model.predict_classes(x=spectrograms)
    resultsMtrx = model.predict(x=spectrograms, batch_size=len(spectrograms))

    m = resultsMtrx.tolist();
    rez = [[m[j][i] for j in range(len(m))] for i in range(len(m[0]))]
    mtrx = json.dumps(rez)

    # Interpret results
    genre = np.zeros(NUM_GENRES)
    keys = list(GENRES.keys())
    values = list(GENRES.values())
    for instance in results:
        genre[instance] += 1

    filename, file_extension = os.path.splitext(f.filename)
    key = ["nome", "list",]
    val = [filename, rez,]
    for i in range(NUM_GENRES):
        key.append("{0}".format(keys[values.index(i)]))
        val.append(genre[i] * 100 / sum([x for x in genre]))

    # Create a dictionary from lists
    dictOfGen = dict(zip(key, val))
    return dictOfGen

def split_song(signal, genre, window_size=0.1, overlap_percent=0.5):
    """
    Split the signal in multiple overlapping windows
    :param signal: the time series of the sound
    :param genre: the genre of the sound
    :param window_size: the size of the window (percentage of the song,
        if song is 30s long, window_size of 0.1 will create windows of size 3s)
    :param overlap_percent: the percentage of overlap between windows (if window is 3s long, 50% of the
        next window will overlap with it)
    :return: the song splitted, and the corresponding genre
    """
    x = []
    y = []
    # Shape like (x,), so we get x
    signal_length = signal.shape[0]
    # Size of a window
    size_part = int(signal_length * window_size)
    # Size of the offset
    offset = int(size_part * overlap_percent)
    # Limit of range
    limit = signal_length - size_part + offset
    # Split the signal
    for i in range(0, limit, offset):
        # Add the part of the signal to the array
        x.append(signal[i:i+size_part])
        y.append(genre)

    return np.array(x), np.array(y)

def generate_spectrograms(signals, conv_1d=True):
    """
    Generate the mel spectrogram of each signal of the given array
    :param signals: the list of time series
    :param conv_1d: set to false if 2d convolutions will be used, it will add a new axis
    :return: the list of mel spectrograms
    """
    rep = []
    for instance in signals:
        # Create spectrograms and add a new axis (nb of channels = 1 for use in CNN as image)
        # Librosa create spectrogram like (time, frequency)
        # We convert it to (time, frequency, channel)
        # But if we use 1D convolutional layer, no need to add axis
        if conv_1d:
            rep.append(librosa.feature.melspectrogram(instance))
        else:
            rep.append(np.expand_dims(librosa.feature.melspectrogram(instance), axis=2))
    return np.array(rep)

if __name__ == "__main__":
    app.run()
