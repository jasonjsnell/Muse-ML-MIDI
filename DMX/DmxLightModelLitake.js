class DmxLightModelLitake {

    // Constructor with default parameter values
    constructor(startingAddress, active) {

        this.active = active;

        console.log("DmxLightModelLitake", startingAddress);

        // Default values for instance variables
        this.STROBE = 0; // No strobe, zero speed
        this.MODE = 0; // Manual control
        this.SHADE = 0; // Color selection, color shade

        // Brightness of colors, 225 full bright
        this.chBrightness = startingAddress - 1;

        // R, G, B channels
        this.chRed = startingAddress;
        this.chGreen = startingAddress + 1;
        this.chBlue = startingAddress + 2;

        // Strobe, 0-7 = off, 8-255 = speed
        this.chStrobe = startingAddress + 3;

        // 0 = manual control
        this.chMode = startingAddress + 4;

        // Color selection, color shade
        this.chColorShade = startingAddress + 5;

        // Initialize fixed settings
        this._routeToMidi(this.chStrobe, this.STROBE);
        this._routeToMidi(this.chMode, this.MODE);
        this._routeToMidi(this.chColorShade, this.SHADE);
    }

    setActive(active) {
        this.active = active;
    }

    set(brightness, r, g, b) {

        if (r != NaN && g != NaN && b != NaN) {

            let _r = this._midiRange(parseInt(r));
            let _g = this._midiRange(parseInt(g));
            let _b = this._midiRange(parseInt(b));

            this._routeToMidi(this.chBrightness, brightness);
            this._routeToMidi(this.chRed, _r);
            this._routeToMidi(this.chGreen, _g);
            this._routeToMidi(this.chBlue, _b);

        }
    }

    _midiRange(value) {
        if (value < 0) {
            value = 0;
        } else if (value > 127) {
            value = 127;
        }
        return value;
    }

    //0x8E = channel 15
    _routeToMidi(note, value) {

        if (this.active) {

            value = parseInt(value);
            if (value < 0) {
                value = 0;
            } else if (value > 127) {
                value = 127;
            }

            for (let i = 0; i < midiOuts.length; i++) {
                let midiOut = midiOuts[i];
                midiOut.send([0x9E, note, value]);
            }
        }
    }
}
