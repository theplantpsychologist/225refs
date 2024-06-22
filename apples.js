console.log("more apples")

// Get reference to the file input element
const fileInput = document.getElementById('fileInput');

// Add event listener to listen for file selection
fileInput.addEventListener('change', function(event) {
    // Get the selected file from the input element
    const file = event.target.files[0];

    // Ensure a file was selected
    if (!file) {
        console.error('No file selected');
        return;
    }

    // Create a new FileReader instance
    const reader = new FileReader();

    // Define the function to run when the file is successfully loaded
    reader.onload = function(e) {
        // 'e.target.result' contains the file's data as a base64 encoded string
        const fileContents = e.target.result;
        
        // Do something with the file contents, e.g., log to console
        console.log(fileContents);
    };

    // Read the file as text (you can also read it as binary, etc.)
    reader.readAsText(file);
});


