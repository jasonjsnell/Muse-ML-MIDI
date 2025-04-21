//DMX
let dmxLight;
let visRed = 0;
let visGreen = 0;
let visBlue = 0;
let DMX_INC = 0.06;
let HEART_PULSE_INC = 0.025;

function sendDmxLight() {

  //pause DMX midi output

    heartPulse -= HEART_PULSE_INC
    
    if (heartPulse < 0.00001) { heartPulse = 0}
    
    let brightness = 1.0;
          
    //set var from biometric
    let _dmxRed = Math.max(state.muscle, state.focus);
  
    //smoothing
    if (_dmxRed > visRed+DMX_INC) {
      visRed += DMX_INC;
    } else if (_dmxRed < visRed-DMX_INC) {
      visRed -= DMX_INC;
    } else {
      visRed = _dmxRed;
    }
    //scale by heartPulse
    visRed = heartPulse * visRed;
  
    //same for green
    let _dmxGreen = heartPulse * (state.focus/6);
    if (_dmxGreen > visGreen+DMX_INC) {
      visGreen += DMX_INC;
    } else if (_dmxGreen < visGreen-DMX_INC) {
      visGreen -= DMX_INC;
    } else {
      visGreen = _dmxGreen;
    }
    visGreen = heartPulse * visGreen;
    
    //blue is set by meditation or clear, whichever is higher
    let _dmxBlue = Math.max(state.meditation, state.clear);

    //smoothing
    if (_dmxBlue > visBlue+DMX_INC) {
      visBlue += DMX_INC;
    } else if (_dmxBlue < visBlue-DMX_INC) {
      visBlue -= DMX_INC;
    } else {
      visBlue = _dmxBlue;
    }
    visBlue = heartPulse * visBlue;
 
    //send to DMX light
    dmxLight.set(brightness * 127, visRed * 127, visGreen * 127, visBlue * 127);
  }