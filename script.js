// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/m9JsFfBs_/";
var last = "";
let model, webcam, labelContainer, maxPredictions;

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
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) { // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
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

    const classPrediction =
      prediction[i].className + ": " + (prediction[i].probability.toFixed(1) * 100 + "%");
    if (prediction[i].probability.toFixed(1) * 100 >= 80) {
      document.getElementById("progress").value = prediction[i].probability.toFixed(1) * 100;
      document.getElementById("progress").innerText = prediction[i].probability.toFixed(1) * 100 + "%";
      labelContainer.childNodes[i].innerHTML = classPrediction;
      if (last != prediction[i].className) {
        last = prediction[i].className;
        var msg = new SpeechSynthesisUtterance();
        msg.text = "Be careful! There is a " + prediction[i].className + " in front of you";
        window.speechSynthesis.speak(msg);
      }
    } else {
      labelContainer.childNodes[i].innerHTML = "";
    }
  }
  document.getElementById("progress").value = most;
}