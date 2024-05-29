// Teachable Machine Constant Link
const URL = "https://teachablemachine.withgoogle.com/models/m9JsFfBs_/";
var last = "";
let model, webcam, labelContainer, maxPredictions, labelContainers;
let lastSpeechTime = 0;
const speechDelay = 10000;
let cameraRunning = false;

// Load the image model and setup the webcam
async function init() {
  cameraRunning = true;
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Webcam Setup
  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  labelContainers = document.getElementById("dev-stats");
  for (let i = 0; i < maxPredictions; i++) {

    labelContainer.appendChild(document.createElement("div"));
    labelContainers.appendChild(document.createElement("div"));

  }
}

// Stop the camera from running
async function stopping() {
  await webcam.stop();
  cameraRunning = false;
}

async function loop() {
  webcam.update();
  await predict();
  await in_depth_stats();
  window.requestAnimationFrame(loop);
}

// For in-depth stats text
async function in_depth_stats() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    console.log(prediction[i].className);
    labelContainers.childNodes[i].innerHTML = classPrediction;
  }
}

// This function will run whatever the webcam sees through Teachable Machine
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  most = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability.toFixed(1) * 100 >= most) {
      most = prediction[i].probability.toFixed(1) * 100
    }

    const classPrediction = prediction[i].className + ": " + (prediction[i].probability.toFixed(1) * 100 + "%");
    if (prediction[i].probability.toFixed(1) * 100 >= 90) {
      labelContainer.childNodes[i].innerHTML = classPrediction;
      document.getElementById("progress").value = most;

      // Specific Messages depending on name of class
      const currentTime = new Date().getTime();
      if (last != prediction[i].className && (currentTime - lastSpeechTime > speechDelay)) {

        if (prediction[i].className == "None") {
          last = prediction[i].className;
        }

        else if (prediction[i].className == "Car In Front Of Camera") {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a car or bus in front of the camera";
          window.speechSynthesis.speak(msg);
          lastSpeechTime = currentTime;
        }

        else if (prediction[i].className == "High Voltage") {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a high voltage sign in front of the camera";
          window.speechSynthesis.speak(msg);
          lastSpeechTime = currentTime;
        }

        else {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a " + prediction[i].className + " in front of the camera";
          window.speechSynthesis.speak(msg);
          lastSpeechTime = currentTime;
        }
      }
      // Shows speech timer and how much time is left
      var speech_timer = document.getElementById("speech_timer");
      speech_timer.innerHTML = "Time since last detection (ms): " + (currentTime - lastSpeechTime);

    } else {
      labelContainer.childNodes[i].innerHTML = "";
    }
  }

}

// VOICE RECOGNITION AND VOICE COMMANDS SECTION
var textarea = document.getElementById("textarea");
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

// Turn on camera w/ speech
function turnOn() {
  init();
  recognition.stop();
  var msg = new SpeechSynthesisUtterance();
  msg.text = "Starting Camera";
  window.speechSynthesis.speak(msg);
  cameraRunning = true;
}

// Turn off camera w/ speech
function turnOff() {
  stopping();
  recognition.stop();
  var msg = new SpeechSynthesisUtterance();
  msg.text = "Stopping Camera";
  window.speechSynthesis.speak(msg);
  cameraRunning = false;
}

// Constantly running speech recognition
function speech() {
  recognition.start();
  textarea.innerHTML = 'Listening...';

  recognition.onresult = function(e) {
    var transcript = '';
    for (var i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    textarea.innerHTML = transcript;
    if ((transcript.includes("turn on") || transcript.includes("Turn on") || transcript.includes("start")) && cameraRunning == false) {
      turnOn();
    } else if ((transcript.includes("turn off") || transcript.includes("Turn off")) && cameraRunning == true) {
      turnOff();
    }

    recognition.onend = function() {
      speech();
    }
  }
}
speech();

