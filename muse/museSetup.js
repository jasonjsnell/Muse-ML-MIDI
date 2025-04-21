//is it a Muse 1 (usePPG = false) or Muse 2 (usePPG = true)
let usePPG = true;
let connectButton;

function setupMuse() {
  //this handles the bluetooth connection between the Muse and the computer
  bluetoothConnection = new webBLE();

  //create the connect button 
  //connectButton = createButton('Connect');
  const connectButton = document.getElementById("connect-button");
  connectButton.addEventListener("click", connectButtonClicked);
  //connectButton.mousePressed(connectButtonClicked);
}

//user clicks connect button
function connectButtonClicked() {
  connectToMuse();
}

//when muse connects, this function fires
function museConnected(error, characteristics) {

  if (error) {
    console.log(error); //error connecting
  } else {

    // hide the connect button (HTML element)
    document.getElementById("connect-button").style.display = "none";

    //prepare muse to stream data
    let museIsReady = initMuseStreaming(characteristics);

    //if muse is ready for streaming
    if (museIsReady) {
      startMuse();
      isConnected = true; //set the connection status
    }

    //add disconnection script
    bluetoothConnection.onDisconnected(onDisconnected);
  }
}

//if muse disconnects
function museDisconnected() {
  console.log('Muse Disconnected');

  //set the connection status
  isConnected = false;

  //show the connect button
  document.getElementById("connect-button").style.display = "inline-block";
}