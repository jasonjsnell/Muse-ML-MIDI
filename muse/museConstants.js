const EEG_WAVE_DELTA = 0;
const EEG_WAVE_THETA = 1;
const EEG_WAVE_ALPHA = 2;
const EEG_WAVE_BETA = 3;
const EEG_WAVE_GAMMA = 4;

const STATE_NONE       = 0;
const STATE_NOISE      = 1;
const STATE_MUSCLE     = 2;
const STATE_FOCUS      = 3;
const STATE_CLEAR      = 4;
const STATE_MEDIT = 5;
const STATE_DREAM      = 6;
const STATE_HEART      = 7;
const STATE_MOVE_X     = 8;
const STATE_MOVE_Y     = 9;
const STATE_MOVE_Z     = 10;

const STATE_MUSCLE_NOTE = "C4";
const STATE_FOCUS_BETA_NOTE = "C4";
const STATE_FOCUS_GAMMA_NOTE = "C5";
const STATE_MEDITATION_NOTE = "C3";
const STATE_DREAM_NOTE = "C3";

const stateNotes = {
    [STATE_MUSCLE]: STATE_MUSCLE_NOTE,
    [STATE_FOCUS]: STATE_FOCUS_BETA_NOTE,
    [STATE_MEDIT]: STATE_MEDITATION_NOTE,
    [STATE_DREAM]: STATE_DREAM_NOTE
};