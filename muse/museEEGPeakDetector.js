class EEGPeakDetector {
    
    constructor(targetState = STATE_NONE, threshold = 0.8, spacingBetweenTriggers = 10, note = "C4") {
        
        this.targetState = targetState;
        this.threshold = threshold;
        this.spacingBetweenTriggers = spacingBetweenTriggers;
        this.note = note;

        this.timeSinceLastTrigger = 0;
        this.noteOn = false;

    }

    detectPeak(history) {

        if (history.length < 10) return;
    
        const currentValue = history[history.length - 1];
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min;
    
        if (range === 0) return;
    
        const currPct = (currentValue - min) / range;
        if (!isFinite(currPct)) return;
    
        // Time since last trigger increases every call
        this.timeSinceLastTrigger++;
    
        if (currPct > this.threshold) {

            if (!this.noteOn && this.timeSinceLastTrigger > this.spacingBetweenTriggers) {
                
                this.noteOn = true;
                this.timeSinceLastTrigger = 0;
    
                // 🔥 Fire noteOn
                brainwaveNoteOn(this.targetState, this.note, currPct);
            } else {
                // Holding or still within cooldown
                return;
            }
        } else {
            if (this.noteOn) {
              
                this.noteOn = false;
    
                // 📴 Fire noteOff
                brainwaveNoteOff(this.targetState, this.note);
            }
        }
    }
    
    
}
