// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/m9JsFfBs_/";
var last = "";
let model, webcam, labelContainer, maxPredictions, labelContainers;
let lastSpeechTime = 0; // Variable to store the last speech utterance time
const speechDelay = 5000; // 3 seconds delay

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  labelContainers = document.getElementById("dev-stats");
  for (let i = 0; i < maxPredictions; i++) { // and class labels

    labelContainer.appendChild(document.createElement("div"));
    labelContainers.appendChild(document.createElement("div"));

  }
}

// Stop the camera from running
async function stopping() {
  await webcam.stop();
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  await predict2();
  window.requestAnimationFrame(loop);
}
async function predict2() {
  // predict can take in an image, video or canvas html element
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
  // predict can take in an image, video or canvas html element
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
        } else if (prediction[i].className == "Car or Bus") {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a car or bus in front of the camera";
          window.speechSynthesis.speak(msg);
          lastSpeechTime = currentTime; // Update the last speech time
        } else {
          last = prediction[i].className;
          var msg = new SpeechSynthesisUtterance();
          msg.text = "Be careful! There is a " + prediction[i].className + " in front of you";
          window.speechSynthesis.speak(msg);
          lastSpeechTime = currentTime; // Update the last speech time
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
recognition.continuous = true; // Set continuous property to true
recognition.interimResults = true; // Optional: Show interim results

function speech() {
  recognition.start(); // Start recognition immediately
  textarea.innerHTML = 'Listening...';

  recognition.onresult = function(e) {
    console.log(e);
    var transcript = '';
    for (var i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    textarea.innerHTML = transcript;
    if (transcript.includes("run") || transcript.includes("start") || transcript.includes("Run") || transcript.includes("Start")) {
      // Call function that runs
      init();
      var msg = new SpeechSynthesisUtterance();
      msg.text = "Camera On";
      window.speechSynthesis.speak(msg);
    } else if (transcript.includes("stop") || transcript.includes("Stop")) {
      // Call function that stops
      stopping();
      var msg = new SpeechSynthesisUtterance();
      msg.text = "Camera Off";
      window.speechSynthesis.speak(msg);
    }

    recognition.onend = function() {
      speech(); // Restart recognition when it ends
    }
  }
}
speech();
