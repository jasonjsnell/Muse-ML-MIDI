//tab navigation
document.querySelectorAll('.tab-button').forEach(button => {

    button.addEventListener('click', () => {

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

        // Show the selected tab
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.remove('hidden');

        // Highlight active button
        button.classList.add('active');

        resizeLayout();
    });
});

//resizing
function resizeLayout() {
  const totalRows = document.querySelectorAll('.midi-row').length;
  const headerHeight = document.querySelector('.midi-row.header')?.offsetHeight || 0;
  const bannerHeight = document.querySelector('.banner')?.offsetHeight || 0;
  const padding = 40; // any extra margin/padding you want to subtract
  const availableHeight = window.innerHeight - headerHeight - bannerHeight - padding;
  const rowHeight = Math.floor(availableHeight / totalRows);

  document.querySelectorAll('.midi-row').forEach(row => {
      row.style.height = `${rowHeight}px`;
  });
}


window.addEventListener('resize', resizeLayout);
window.addEventListener('load', resizeLayout);


//save user selections
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
  