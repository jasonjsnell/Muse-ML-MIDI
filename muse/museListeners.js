//parsing methods
//https://github.com/urish/muse-js/blob/4e864578c55dd7e26d85b429863f47ccabac54a0/src/lib/muse-parse.ts

//streaming listeners   
function didReceiveEegLeftEar(data) {
    //processEEG(0, data);
}

function didReceiveEegLeftForehead(data) {
    //processEEG(1, data);
    processEEG(0, data);
}

function didReceiveEegRightEar(data) {
    //processEEG(2, data);
}

function didReceiveEegRightForehead(data) {
    //processEEG(3, data);
    processEEG(1, data);
}

function didReceivePpg(data) {
    processPPG(data); 
}

function didReceiveAccel(data) {

    const _samples = parseImuReading(data, 0.0000610352).samples;
  
    // Average the 3-axis values
    accel.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    accel.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    accel.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
  
    // Normalize based on observed realistic ranges
    const normX = normalize(accel.x, -1.0, +1.0); // You can tighten this later
    const normY = normalize(accel.y, -0.7, +0.7);
    const normZ = normalize(accel.z, 0.4, 1.2);   // Gravity vector
  
    // Send to MIDI CC
    sendStateCC(STATE_MOVE_X, normX);
    sendStateCC(STATE_MOVE_Y, normY);
    sendStateCC(STATE_MOVE_Z, normZ);
  }
  

function didReceiveGyro(data) {

    //parse the samples with multiplier
    let _samples = parseImuReading(data, 0.0074768).samples;

    //average out the samples
    gyro.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    gyro.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    gyro.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
    //console.log("Gyro:", gyro);
}

function didReceiveBattery(data) {
    batteryLevel = data.getUint16(2) / 512;
    console.log("Battery level:", batteryLevel, "%");
}


function normalize(val, min, max) {
    return Math.min(Math.max((val - min) / (max - min), 0), 1);
  }