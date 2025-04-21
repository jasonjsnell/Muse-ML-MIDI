document.addEventListener("DOMContentLoaded", () => {
  // Restore checkboxes and trigger updates
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    const saved = localStorage.getItem(checkbox.id);
    const isChecked = saved === "true";
    checkbox.checked = isChecked;

    // Trigger MIDI state change on load
    const idParts = checkbox.id.split("-");
    const type = idParts[0];
    const stateIndex = parseInt(idParts[1]);

    if (type === "cc") {
      updateStateCcOn(stateIndex, isChecked);
    } else if (type === "note") {
      updateNoteState(stateIndex, isChecked);
    }

    // Also attach the listeners for live changes
    checkbox.addEventListener("change", () => {
      localStorage.setItem(checkbox.id, checkbox.checked);

      if (type === "cc") {
        updateStateCcOn(stateIndex, checkbox.checked);
      } else if (type === "note") {
        updateNoteState(stateIndex, checkbox.checked);
      }
    });
  });
});
