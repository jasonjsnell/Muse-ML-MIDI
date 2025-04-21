//utils for json files

// Function to fetch a JSON file and parse its content
const fetchAndParseJSON = async (filePath) => {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error fetching ${filePath}: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        return jsonData.data || []; // Return the "data" array or an empty array
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Function to load and combine multiple JSON files
//add callback function to this

function loadAndCombineJSONFiles(jsonFilePaths, callback) {

    // Array to hold all the fetch promises
    const jsonFetchPromises = jsonFilePaths.map(filePath => fetchAndParseJSON(filePath));

    // Wait for all promises to resolve using Promise.all
    Promise.all(jsonFetchPromises)
        .then(dataArrays => {

            // Combine the arrays from all "data" objects into a single array
            const combinedDataArray = [].concat(...dataArrays);

            // Create the final combined JSON object
            const _combinedJSON = { data: combinedDataArray };

            //call the callback function with the combinedJSON
            callback(_combinedJSON);

        })
        .catch(error => console.error('Error loading or combining JSON files:', error));

}
