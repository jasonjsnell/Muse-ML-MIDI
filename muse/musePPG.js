let PPG_QUANTIZED = true;
let PPG_SAMPLES_MAX = 80;
let ppgBuffer = new MuseDataBuffer(PPG_SAMPLES_MAX);
let heartbeatTimestamps = []
let BEAT_DETECTION_THRESHOLD = 0.6 //0.996 //0.9982 //0.998
let BPM_SAMPLES_MAX = 10;


function processPPG(data) {

    //process data buffer into samples and save
    let ppgSamples = decodeUnsigned24BitData(new Uint8Array(data.buffer).subarray(2));

    //add decoded samples to the buffer
    ppg.buffer = ppgBuffer.update(ppgSamples);
    ppg.buffer = movingAverageSmooth(ppg.buffer, 10);

    //calc the high and low value of the buffer
    ppg.max = Math.max(...ppg.buffer);
    ppg.min = Math.min(...ppg.buffer);

    //grab most recent value in ppg array
    ppg.amplitude = ppg.buffer[ppg.buffer.length - 1];

    //what percentage is it of the max?
    let ppgPercent = (ppg.amplitude-ppg.min) / (ppg.max-ppg.min);
    sendStateCC(6, ppgPercent);
    //console.log("ppgPercent: " + (ppgPercent * 100).toFixed(0));
    //if recent value is near the max value, it's a heartbeat
    if (ppgPercent > BEAT_DETECTION_THRESHOLD) { //threshold for a beat detection

        
        //if previously false...
        if (ppg.heartbeat == false) {

          //console.log("BEAT DETECTED ^^^^^^^^^^^^^^^^^^^^^^ ");
          if (!PPG_QUANTIZED) {
            //manual beat
            playMidiHeartbeat();
            console.log("manual beat");
          } 
          //else calc bpm
            
            //record the timestamp of this heartbeat
            heartbeatTimestamps.push(new Date().getTime());

            //keep timestamps array from growing too long
            if (heartbeatTimestamps.length > BPM_SAMPLES_MAX) { 
                let diff = heartbeatTimestamps.length - BPM_SAMPLES_MAX;
                heartbeatTimestamps.splice(0, diff); 
            }

            let durationsBetweenBeats = []

            //if there are enough samples...
            if (heartbeatTimestamps.length > 1) {

                //loop through each timestamp
                for (var i = heartbeatTimestamps.length-1; i > 1; i--) {

                    //get this and the next timestamp
                    let currTimestamp = heartbeatTimestamps[i];
                    let prevTimestamp = heartbeatTimestamps[i - 1];
                
                    //calculate time between beats and save it
                    let durationBetweenBeats = currTimestamp - prevTimestamp;
                    durationsBetweenBeats.push(durationBetweenBeats);
                }

                //calc durations between the beats
                let durationsTotal = 0;
                for (var i = 0; i < durationsBetweenBeats.length; i++) {

                    //add up the durations
                    durationsTotal += durationsBetweenBeats[i];
                }
                //calc average in milliseconds
                let durationAverage = durationsTotal / durationsBetweenBeats.length;
                
                //bpm = 60000 / ms duration of quarter note
                ppg.bpm = Math.round(60000 / durationAverage);

                //keep bpm above 50
                if (ppg.bpm < 50) {
                    ppg.bpm = 50;
                }
        
            }
        }

        //when heart beat is occurring
        ppg.heartbeat = true;

    } else {
        //else off
        ppg.heartbeat = false;
    }
      
}

function movingAverageSmooth(arr, windowSize) {
    if(windowSize <= 1) {
      return arr.slice();
    }
    
    const result = [];
    for(let i = 0; i < arr.length; i++) {
      let sum = 0;
      let count = 0;
      for(let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
        const index = i + j;
        if(index >= 0 && index < arr.length) {
          sum += arr[index];
          count++;
        }
      }
      result[i] = sum / count;
    }
    return result;
  }