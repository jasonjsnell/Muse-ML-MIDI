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
    });
});