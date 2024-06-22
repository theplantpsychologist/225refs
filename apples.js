const fs = require('fs');

// Function to read the file and feed it into readCp()
function readFileAndFeedToReadCp(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        
        testcp = readCpFile(data); // Call the readCp() function with the file content as an argument
        displayCp(testcp, 10, 10, 590, 590)
    });
}

// Usage: Provide the path to the text file as an argument
readFileAndFeedToReadCp('test.cp');

