let midiOuts;
//noise, muscle, focus, clear, meditation, dream, heart

let stateCcOn = [true, true, true, true, true, true, true, true, true];


let stateMidiCcNumber = 20;
let stateMidiChannels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let stateMidiValues = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
let stateSmoothingValues = [
  [2, 2], //noise
  [4, 4], //muscle
  [2, 1], //focus
  [2, 2], //clear
  [1, 1], //meditation
  [1, 1],  //dream
  [50, 8]  //heart
];

let stateNoteOn = [true, true, true, true, true, true, true, true, true];

//Init WebMIDI
WebMidi.enable(function (err) {
  if (err) {
    console.error("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled, outputs:", WebMidi.outputs);

    // Get the output port (your MIDI device)
    midiOuts = WebMidi.outputs;

    console.log("MIDI out", midiOuts);

    // Check if an output is available
    if (!midiOuts) {
      console.error("No MIDI output available.");
      return;
    }

    //set all to zero
    // for (let i= 0; i < stateMidiChannels.length; i++){
    //   sendStateCC(i, 0);
    // }

    dmxLight = new DmxLightModelLitake(1);

  }
});

document.querySelectorAll(".cc-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const stateIndex = parseInt(this.id.split("-")[1]);
    updateStateCcOn(stateIndex, this.checked);
  });
});

document.querySelectorAll(".note-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const stateIndex = parseInt(this.id.split("-")[1]);
    updateNoteState(stateIndex, this.checked);
  });
});

// Update buttons to call the correct function
function testMidiNoteButtonClicked(index) {
  console.log("State", index, "is send a test message for MIDI mapping");
  if (!window.midiOuts) return;
  for (let midiOut of midiOuts) {
    midiOut.playNote("C3", stateMidiChannels[index]);
  }
}

function testMidiCCButtonClicked(index) {
  console.log("State", index, "is send a test message for MIDI mapping");
  if (!window.midiOuts) return;
  for (let midiOut of midiOuts) {
    midiOut.sendControlChange(stateMidiCcNumber, Math.floor(Math.random() * 128), stateMidiChannels[index]);
  }
}


function convertMlResultsToMidiCC() {

  sendStateCC(0, state.noise);
  sendStateCC(1, state.muscle);
  sendStateCC(2, state.focus);
  sendStateCC(3, state.clear);
  sendStateCC(4, state.meditation);
  sendStateCC(5, state.dream);
}

let midiStateBoost = 1.0
function increaseMidiStateBoost(){
  midiStateBoost += 0.1;
  console.log("MIDI state boost is now", midiStateBoost);
}
function decreaseMidiStateBoost(){
  midiStateBoost -= 0.1;
  if (midiStateBoost < 1.0){ midiStateBoost = 1.0; }
  console.log("MIDI state boost is now", midiStateBoost);
}

function sendStateCC(stateID, stateValue) {
  //is channel open?
  let channelOpen = stateCcOn[stateID];

  //if open...
  if (channelOpen) {

    //apply boost
    stateValue = stateValue * midiStateBoost

    //create midi value by mapping down the state mVolts
    let newMidiValue = map(stateValue, 0.0, 1.0, 0, 127);
    newMidiValue = Math.min(127, Math.max(0, newMidiValue));
    newMidiValue = Math.round(newMidiValue);

    //don't send same value repeatedly
    if (newMidiValue != stateMidiValues[stateID]) {

      //get smoothing values
      let smoothingValues = stateSmoothingValues[stateID];
      let upInc = smoothingValues[0];
      let dnInc = smoothingValues[1];

      
      if (upInc == -1 && dnInc == -1) {

        //no smoothing
        stateMidiValues[stateID] = newMidiValue;

      } else {

        //smoothing
        if (newMidiValue > stateMidiValues[stateID] + upInc) {
          stateMidiValues[stateID] += upInc;
        } else if (newMidiValue < stateMidiValues[stateID] - dnInc) {
          stateMidiValues[stateID] -= dnInc;
        } else {
          stateMidiValues[stateID] = newMidiValue;
        }
      }


      //get state channel
      let stateMidiChannel = stateMidiChannels[stateID];

      //send to all midi outs
      for (let i = 0; i < midiOuts.length; i++) {
        let midiOut = midiOuts[i];

        midiOut.sendControlChange(
          stateMidiCcNumber,
          stateMidiValues[stateID],
          stateMidiChannel
        );
      }
    }
  }
}

//TOGGLE CC STREAMS
//managers if the state data stream is being sent out
//default is off, because ableton will map to all streaming cc'd when doing MIDI mapping

function updateStateCcOn(stateID, newState) {
  console.log("CC for state", stateID, "is now", newState);
  stateCcOn[stateID] = newState;
}

// TOGGLE NOTE STREAMS
// manages if the MIDI note for a given state is active
// default is off to avoid spamming note-ons unintentionally

function updateNoteState(stateID, newState) {
  console.log("Note for state", stateID, "is now", newState);
  stateNoteOn[stateID] = newState;
}

//Test MIDI button
function testMidiButtonClicked(buttonIndex) {
  //send random value between 0 and 1 to midi CC function
  //this will make sure that it's a different value each time
  console.log("State", buttonIndex, "is send a test message for MIDI mapping");

  //send to all midi outs
  for (let i = 0; i < midiOuts.length; i++) {
    let midiOut = midiOuts[i];

    midiOut.sendControlChange(
      stateMidiCcNumber,
      random(127),
      stateMidiChannels[buttonIndex]
    );
  }
}


//BPM quantized
let HEARTBEAT_MIDI_CHANNEL = 10;
let heartPulse = 1.0;
let midiBpmActive = false;
function activateMidiBpm(active) {
  midiBpmActive = active;
}

function updateMidiBpm(bpm) {
  if (bpm != undefined) {
    bpmInterval = 60000 / bpm;
    //console.log("BPM is now", bpm, "ms interval is now", bpmInterval);
  }
}

let bpmInterval = 1000; //starts at 60 bpm

function bpmRenderLoop() {

  // Your repeating logic/code here
  //console.log('Running at dynamic interval at ', bpmInterval);
  //console.log('midiBpmActive', midiBpmActive)
  // sketch.js file turns loop on if device is connected and off if device is not
  if (midiBpmActive) {

    playMidiHeartbeat();
  }

  // Schedule the next call based on the current interval
  setTimeout(bpmRenderLoop, bpmInterval);
}

// Kick off the first call
if (PPG_QUANTIZED){
  setTimeout(bpmRenderLoop, bpmInterval);
}

//Heart non-quantized
function playMidiHeartbeat(){
  //send midi note C3 out on channel 10
  for (let i = 0; i < midiOuts.length; i++) {
    let midiOut = midiOuts[i];
    midiOut.playNote("C3", HEARTBEAT_MIDI_CHANNEL);
    heartPulse = 1.0;

  }
}