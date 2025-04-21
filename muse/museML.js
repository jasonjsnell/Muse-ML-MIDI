let neuralNetwork;

//how many data points are in the JSON?
//hz bins
//cut off everything above 50 to avoid 50 hz wall outlet noise in EU
let INPUTS_TOTAL = 48;

//how many outputted classifications are in the JSON?
let brainwaveDataSets = [
  "JSON-data/c-clear-mind.json",
  "JSON-data/d-dream-theta.json",
  "JSON-data/e-eye-movement.json",
  "JSON-data/f-resting-focus.json",
  "JSON-data/b-blink.json",
  "JSON-data/j-jaw-clench.json",
  "JSON-data/l-loose-connection.json",
  "JSON-data/m-muscle-tension.json",
  "JSON-data/n-noise-disconnection.json",
  "JSON-data/o-overstimulation.json",
];

//how many times does the model get analyzed?
//this can be reduced to the number where the loss drops and stays low in the Training Performance chart (which is visible when debug is TRUE)
let EPOCHS = 105;

//classification (specific outputs with %)
//or regression (a percentage fade between specific points)
let MODEL_TYPE = "classification"; //or "regression"

function setupMuseML() {
  //setup NN
  let options = {
    inputs: INPUTS_TOTAL,
    outputs: brainwaveDataSets.length,
    task: MODEL_TYPE,
    debug: true,
  };
  neuralNetwork = ml5.neuralNetwork(options);

  //note: only run loadAndCombineJSONFiles or loadTrainingModel
  //running back at the same time can produce an error if there are differences between them

  //TO TRAIN MODEL
  //load in data that has already been recorded
  //do this if you want to add more data to the existing data
  // loadAndCombineJSONFiles(
  //   brainwaveDataSets,
  //   combinedJSONFilesLoaded
  // );

  //or

  //TO ANALYZE LIVE DATA FROM TRAINED MODEL
  //load this when testing live data against the ML model
  loadTrainingModel();
}

//LOAD JSON DATA OF MENTAL STATES
function combinedJSONFilesLoaded(combinedJSON) {
  // Use the combinedJSON variable for further processing
  console.log("Combined JSON data loaded:", combinedJSON.data);

  //loop through loaded JSON and add inputs and outputs
  for (const item of combinedJSON.data) {
    neuralNetwork.addData(item.xs, item.ys);
  }

  //when you want to create a train model...
  trainModel();
}

//TRAINS NN ON JSON DATA (TRAINING)
function trainModel() {
  console.log("start training model");

  //convert all data to be between 0.0 and 1.0
  neuralNetwork.normalizeData();

  //train the neural network
  neuralNetwork.train(
    {
      epochs: EPOCHS,
    },
    trainingComplete
  );
}

function trainingComplete() {
  console.log("training complete");

  //when happy with loss value
  //and num of epochs tests
  //and ready to download model
  neuralNetwork.save();
}

//MODEL TO CLASSIFY INCOMING EEG DATA (POST TRAINING)
function loadTrainingModel() {
  const modelInfo = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };

  neuralNetwork.load(modelInfo, trainingModelLoaded);
}

function trainingModelLoaded() {
  console.log("Training model is loaded");

  //start interval for how frequent the live EEG data is examined
  setInterval(classifyLiveEEG, 50);
}

function classifyLiveEEG() {
  //only classify if live data is coming from the headset
  if (eegSpectrum[0] > 0) {
    let hzBins = eegSpectrum.slice(0, 48);
    neuralNetwork.classify(hzBins, stateDetected);
  }
}

//minimum confidence
let minConf = 0.3;

function stateDetected(error, results) {
  if (error) {
    console.log("stateDetected error:", error);
    return;
  } else {
    //populate global vars
    //noise values
    let _noise = 0;
    let _loose = 0;
    let _muscle = 0;
    let _jaw = 0;
    let _blink = 0;

    //both noise and focus
    let _eye = 0;

    //brain states
    let _clear = 0;
    let _focus = 0;
    let _dream = 0;

    //loop through results
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      let label = result.label;
      let confidence = result.confidence.toFixed(4);

      //populate vars if they have signifant value

      switch (label) {
        case "n":
          _noise = confidence;
          break;
        case "l":
          _loose = confidence;
          break;
        case "m":
          _muscle = confidence;
          break;
        case "b":
          _blink = confidence;
          break;
        case "e":
          _eye = confidence;
          break;
        case "j":
          _jaw = confidence;
          break;
        case "f":
          _focus = confidence;
          break;
        case "c":
          _clear = confidence;
          break;
        case "d":
          _dream = confidence;
          break;
        default:
        //console.log(`Unknown ${label}.`);
      }
    }

    //concat some values

    //noise
    if (_noise < _loose) {
      _noise = _loose;
    }
    state.noise = _noise;

    //muscle tension
    if (_muscle < _jaw) {
      _muscle = _jaw;
    }
    if (_muscle < _blink) {
      _muscle = _blink;
    }

    state.muscle = _muscle;

    if (_focus < _eye) {
      _focus = _eye;
    }

    state.focus = _focus;
    state.clear = _clear;
    state.dream = _dream;

    //calculate alpha if there is low noise, low muscle, and low focus

    
    //init as 0
    state.meditation = 0.0;
    
    if (state.noise < 0.1 && state.muscle < 0.1 && state.focus < 0.5) {
      
      //if state is somewhat in clear or dream...
      //if (state.clear > 0.5 || state.dream > 0.5) {
        
        //calc alpha
        //sum all
        let eegSum = eeg.delta + eeg.theta + eeg.alpha + eeg.beta + eeg.gamma;
        state.meditation = eeg.alpha / eegSum;

        if (state.meditation < 0.0) {
          state.meditation = 0.0;
        } else if (state.meditation > 1.0) {
          state.meditation = 1.0
        } 
      //}
    }

    //send results to MIDI
    convertMlResultsToMidiCC(results);
  }

  //print results
  /*if (error) {
        console.log("stateDetected error:", error);
        return;
    } else {
        let topResult = results[0];
        let label = topResult.label;
        let confidence = topResult.confidence.toFixed(4);

        //check for noise states first
        //noise, loose, muscle tension, jaw clench, blink
        if (label == "n" && confidence > minConf) {
            console.log("X X X X noise:", confidence);
        } else if (label == "l" && confidence > minConf) {
            console.log("X X X X loose:", confidence);
        } else if (label == "m" || label == "b") {
            if (confidence > minConf) {
                console.log("X X X X muscle tension:", confidence);
            }
        } else if (label == "j" && confidence > minConf) {
            console.log("X X X X jaw clench:", confidence);
        } else if (label == "e") {
            console.log("X X X X eye movement:", confidence);
        } else {
            //if the headset is one and the noise states are not detected
            //these are the mental states
            // console.log(" ")

            if (
                eeg.alpha > eeg.delta &&
                eeg.alpha > eeg.theta &&
                eeg.alpha > eeg.beta &&
                eeg.alpha > eeg.gamma
            ) {
                console.log("/ / / / alpha:", eeg.alpha);
            } else if (label == "f" && confidence > minConf) {
                console.log("+ + + + resting focus:", confidence)
            } else if (label == "c" && confidence > minConf) {
                console.log("* * * * clear:", confidence)
            } else if (label == "t") {
                console.log("~ ~ ~ ~ theta:", confidence);
            } else if (label == "o" && confidence > minConf) {
                console.log("/ / / / overstimulation:", confidence)
            } else {
                let printStr = ""
                for (const result of results) {
                    printStr += result.label + " ";
                }
                console.log(printStr)
            }
        }
    }*/
}

//KEY COMMANDS
//used to trigger a snapshot for the JSON data
function keyPressed() {
  if (key == "S") {
    neuralNetwork.saveData();
  } else {
    let hzBins = eegSpectrum.slice(0, 48);

    let target = [key];
    console.log("Store EEG for", key);

    neuralNetwork.addData(hzBins, target);
  }
}
