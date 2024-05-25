// Teachable Machine Constant Link
const URL = "https://teachablemachine.withgoogle.com/models/m9JsFfBs_/";
var last = "";
let model, webcam, labelContainer, maxPredictions, labelContainers;
let lastSpeechTime = 0; 
const speechDelay = 5000; 
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

// run the webcam image through the image model
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  most = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability.toFixed(1) * 100 >= most) {
      most = prediction[i].probability.toFixed(1) * 100
    }

    const classPrediction = prediction[i].className + ": " + (prediction[i].probability.toFixed(1) * 100 + "%");
    document.getElementById("dev-stats").append;
    if (prediction[i].probability.toFixed(1) * 100 >= 90) {
      document.getElementById("progress").value = prediction[i].probability.toFixed(1) * 100;
      document.getElementById("progress").innerText = prediction[i].probability.toFixed(1) * 100 + "%";
      labelContainer.childNodes[i].innerHTML = classPrediction;

      // Specific Messages depending on name of class
      const currentTime = new Date().getTime();
      if (last != prediction[i].className && (currentTime - lastSpeechTime > speechDelay)) {

        if (prediction[i].className == "None") {
          last = prediction[i].className;
        } 
          
        else if (prediction[i].className == "Car or Bus") {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a car or bus in front of the camera";
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
      speech_timer.innerHTML = currentTime - lastSpeechTime;
      
    } else {
      labelContainer.childNodes[i].innerHTML = "";
    }
  }
  document.getElementById("progress").value = most;
}

// VOICE RECOGNITION AND VOICE COMMANDS SECTION

var speak = document.getElementById("speak");
var textarea = document.getElementById("textarea");
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true; 

// Turn on camera w/ speech
function turnOn() {
  init();
  var msg = new SpeechSynthesisUtterance();
  msg.text = "Starting Camera";
  window.speechSynthesis.speak(msg);
  cameraRunning = true;
  recognition.stop();
}

// Turn off camera w/ speech
function turnOff() {
  stopping();
  var msg = new SpeechSynthesisUtterance();
  msg.text = "Stopping Camera";
  window.speechSynthesis.speak(msg);
  cameraRunning = false;
  recognition.stop();
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
    if ((transcript.includes("turn on") || transcript.includes("Turn on")) && cameraRunning == false) {
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
