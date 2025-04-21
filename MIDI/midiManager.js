let midiOuts;

//states: noise, muscle, focus, clear, meditation, dream, heart, movement

let stateCcOn = new Array(16).fill(false);
let stateNoteOn = new Array(16).fill(false);

//biometric CC streams are transmitted on MIDI CC 20, each on their own channel
let stateMidiCcNumber = 20;
let stateMidiChannels = [-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
let stateMidiValues = new Array(16).fill(-1);
let stateSmoothingValues = [
  [], //no state
  [2, 2],  //noise
  [4, 4],  //muscle
  [2, 1],  //focus
  [2, 2],  //clear
  [1, 1],  //meditation
  [1, 1],  //dream
  [50, 8], //heart
  [2, 2],  //move x
  [2, 2],  //move y
  [2, 2],  //move z
];



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

    console.log("Available MIDI outputs:");
    midiOuts.forEach((out, i) => {
      console.log(`${i}: ${out.name} (id: ${out.id})`);
    });

    // -- DMX OPTIONS -- 
    //send out to a DMX configuration 
    //requires MIDI to DMX converter like a Decabox
    //https://response-box.com/gear/product/decabox-protocol-converter-basic-firmware/
    const startAddress = 1
    const dmxActive = false
    dmxLight = new DmxLightModelLitake(startAddress, dmxActive); 
    
    //alternately, you can use an Enttec box and have an incoming MIDI cc map to the Enttec VST plugin
    //https://www.enttec.com/product/dmx-usb-interfaces/dmx-usb-pro-professional-1u-usb-to-dmx512-converter/
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


function convertMlResultsToMidiCC() {

  sendStateCC(STATE_NOISE, state.noise);
  sendStateCC(STATE_MUSCLE, state.muscle);
  sendStateCC(STATE_FOCUS, state.focus);
  sendStateCC(STATE_CLEAR, state.clear);
  sendStateCC(STATE_MEDITATION, state.meditation);
  sendStateCC(STATE_DREAM, state.dream);
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
function testMidiCCButtonClicked(buttonIndex) {
  //send random value between 0 and 1 to midi CC function
  //this will make sure that it's a different value each time
  console.log("State", buttonIndex, "is sending a test message for MIDI mapping");

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
// Update buttons to call the correct function
function testMidiNoteButtonClicked(buttonIndex) {
  const channel = stateMidiChannels[buttonIndex];
  const note = "C4";

  console.log("State", buttonIndex, "is sending a test note:", note, "on channel", channel);

  for (let i = 0; i < midiOuts.length; i++) {
    let midiOut = midiOuts[i];

    // Send Note On
    midiOut.playNote(note, channel);

    // Send Note Off after 250ms
    setTimeout(() => {
      midiOut.stopNote(note, channel);
    }, 250);
  }
}



//BPM quantized
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
function playMidiHeartbeat() {

  // Only send if heartbeat note is enabled
  if (!stateNoteOn[STATE_HEART]) return;

  const channel = stateMidiChannels[STATE_HEART]; // get configured channel
  const note = "C4"; // or "C3" if you meant that

  for (let i = 0; i < midiOuts.length; i++) {
    let midiOut = midiOuts[i];
    midiOut.playNote(note, channel);
  }

  heartPulse = 1.0;

  for (let i = 0; i < midiOuts.length; i++) {
    let midiOut = midiOuts[i];
    midiOut.playNote(note, channel);
    setTimeout(() => midiOut.stopNote(note, channel), 250);
  }
}
