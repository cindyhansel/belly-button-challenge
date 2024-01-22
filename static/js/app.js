// Cindy Hansel
// U of Minnesota Data Analytics and Visualization Bootcamp
// 1/20/2024

// The bonus gauge chart is incorporated within this script and not a separate js file
// The html was altered to comment out the call for the bonus file

//Pull in the json url and log it
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"

//// Set global variables that will be set and referenced from various functions
// This is a variable to avoid hard-coding within the script code
let numberOfSamplesDisplayed = 10;
// The wash frequency of the initial or chosen participant
let currentWashFrequency = "";
// The full samples array, containing all of the samples
let currentSamplesArray = [];
// The top ten (or less if there are not ten total) samples array
let topSamples = [];

// Upon retrieving the json data, the rest of the script is coded as an inline function
d3.json(url).then((bbData) => {
    console.log(bbData);

    // Fill out the dropdown with the names array 
    for (i=0; i<bbData.names.length; i++){ 
        d3.select("#selDataset").append("option").text(bbData.names[i]);
    };

    // Determine the first element id - this will be used for building the dashboard for the first time
    let initID = bbData.names[0];
    console.log(`Initial ID: ${initID}`);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //     This section contains all of the called functions: 
    //
    //          fillDemographics()
    //          findTopSamples()
    //          drawBar()
    //          drawGauge()
    //          drawBubbles()
    //  
    //      The last function will call the above:
    //
    //          buildDashboard()
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // Fill in demographic info
    function fillDemographics(currentID) {
        // After the initial setup, the displayed metadata needs to be cleared so we don't append to the previous one
        d3.select("#sample-metadata").html("");
        console.log(bbData.metadata.filter(item => item.id == currentID)[0]);
        // Filter with the id to find the associated demographics
        let currentDemographics = Object.entries(bbData.metadata.filter(item => item.id == currentID)[0]);
        // Set global variable to use in the gauge chart
        currentWashFrequency = currentDemographics[6][1];
        console.log(`Wash frequency: ${currentWashFrequency}`);
        currentDemographics.forEach(([key, value]) => d3.select("#sample-metadata").append("h5").html(`<b>${key}:</b> ${value}`));
    };

    // Filter, sort. and slice to create the appropriate array for the bar graph
    function findTopSamples(currentID) {
        // Select the chosen samples array
        let currentSamples = bbData.samples.filter(item => item.id == currentID)[0];
        // Set global variable for bubble plot
        currentSamplesArray = currentSamples;

        // In order to sort by sample values, the three entities need to be combined into an array
        // of arrays
        //
        // Pull out arrays of sample values, otu IDs and otu labels
        let sampleValues = currentSamples.sample_values;
        let otuIDs = currentSamples.otu_ids;
        let otuLabels = currentSamples.otu_labels;
        // Combine the arrays into individual otuIDs per current sample
        let combinedSampleArray = [];
        for (i=0; i<sampleValues.length; i++) {
            let combinedSampleObject = {
                "otuID":otuIDs[i], 
                "sampleValue":sampleValues[i],
                "otuLabel":otuLabels[i]};
            combinedSampleArray.push(combinedSampleObject);
        };
        // Sort the array
        let sortedSampleArray = combinedSampleArray.sort((a, b) => b.sampleValue - a.sampleValue);
        //slice the array based on the global variable set at the top of the code
        let slicedSampleArray = sortedSampleArray.slice(0,numberOfSamplesDisplayed);
        // Reverse the array for plotting in Plotly
        slicedSampleArray.reverse();

        // Rebuild the array for further use
        topSamples = {
            'ids': slicedSampleArray.map(item => item['otuID']),
            'samples': slicedSampleArray.map(item => item['sampleValue']),
            'labels': slicedSampleArray.map(item => item['otuLabel'])
          };
            
        console.log(topSamples);
    };

    // Draw the bar graph
    function drawBar(currentSamples) {
        // Set up the correct labeling for the OTU IDS
        let displayIDs = currentSamples.ids.map(ids => `OTU ${ids}  `);
    
        let traceBar = {
            type:"bar",
            y:displayIDs,
            x:currentSamples.samples,
            text:currentSamples.labels,
            marker:{
                color: "rgba(30,110,200,0.8)"
                // other color options:
                //color: currentSamples.ids
                //color: ['rgba(200,130,50,0.1)', 'rgba(200,130,50,0.2)', 'rgba(220,90,0,0.3)', 'rgba(220,90,0,0.4)', 'rgba(220,90,40,0.5)', 'rgba(220,90,40,0.6)', 'rgba(220,75,40,0.7)', 'rgba(220,75,50,0.8)', 'rgba(220,75,50,0.9)', 'rgba(220,75,50,1)']
              },
            orientation:'h'
          
        };

        // Use the length of the samples array to create the correct title for the bar graph
        // as some have less than ten OTU IDs
        let barLayout = {
            title: (`<b>Top ${currentSamples.samples.length} of ${currentSamplesArray.sample_values.length} OTU Ids Reported</b>`)
        };

        let barData = [traceBar];

        Plotly.newPlot("bar",barData,barLayout);
    };

    // Draw the gauge plot
    function drawGauge(washFrequency) {
        let gaugeData = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: washFrequency,
              title: { text:"<b>Belly Button Washing Frequency</b>" + '<br>' + "Scrubs per Week" },
              type: "indicator",
              mode: "gauge+number",
              gauge: {
                axis: { range: [null, 9], tickwidth: 3, tickcolor: "rgba(30,110,210,0.8)" },
                bar: { color: "rgba(30,110,210,0.8)" },
                steps: [
                  { range: [0,1], color: "rgba(220,90,40,0.6" },
                  { range: [1,2], color: "mediumgray" },
                  { range: [2,3], color: "rgba(220,75,40,0.7)" },
                  { range: [3,4], color: "mediumgray" },
                  { range: [4,5], color: "rgba(220,75,50,0.8" },
                  { range: [5,6], color: "mediumgray" },
                  { range: [6,7], color: "rgba(220,75,50,0.9)" },
                  { range: [7,8], color: "mediumgray" },
                  { range: [8,9], color: "rgba(220,75,50,1)" }
                ],
                threshold: {
                  line: { color: "rgba(30,110,210,0.8)", width: 4 },
                  thickness: 2,
                  value: washFrequency
                    }
                }
            }
          ];
          
        let gaugeLayout = { 
            width: 400, 
            height: 500, 
            margin: { t: 0, b: 0 }
            };

          Plotly.newPlot('gauge', gaugeData, gaugeLayout);
    }

    // Draw the bubble chart
    function drawBubbles(currentSamples) {
        // Bubbles are drawn at 75% as some tend to be quite large
        let samples = [];
        currentSamples.sample_values.forEach(item => {
            samples.push(item * 0.75);
        });

        let traceBubble = {
            x:currentSamples.otu_ids,
            y:currentSamples.sample_values,
            text:currentSamples.otu_labels,
            mode:'markers',
            marker: {
                line: {
                    color: "rgba(30,110,210,0.8)",
                    width: 1
                  },
                color:currentSamples.otu_ids,
                size:samples
            }
        };

        let bubbleData = [traceBubble];

        let bubbleLayout = {
            title:"<b>All OTU Ids Reported in Subject</b>" + '<br>' + "Weighted by Sample Value of Each OTU" + '<br>' + "Colored by Each OTU Id",
            xaxis:{title:'OTU ID'},
            showlegend:false
        };

        Plotly.newPlot('bubble', bubbleData, bubbleLayout);
    };
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      This function will call the other functions that are required to 
    //      build out the dashboard. It will be called using the initial ID 
    //      as well as the chosen dropdown ID
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    // Using the Id, build the metadata table, find the top OTUs and create the charts
    function buildDashboard(currentID) {
        // Fill out metadata table
        fillDemographics(currentID); 
        // Sort and slice chosen sample
        findTopSamples(currentID);
        // Draw the bar graph passing the global variable holding the list of top OTU Ids
        drawBar(topSamples);
        // Draw the gauge plot passing the global variable for current wash frequency
        drawGauge(currentWashFrequency);
        // Draw the bubble graph using the global variable, using all OTU Ids in current samples
        drawBubbles(currentSamplesArray);
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //      The following calls the primary function, buildDashboard(), upon initialization
    //      as well as after a dropdown option has been selected
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //// Build the dashboard for the first time with the initial ID (first in the names array)
    buildDashboard(initID);
  
    //// Collect the new ID when an ID dropdown option is selected
    d3.selectAll("#selDataset").on("change", function() {
        let dropdownMenu = d3.select("#selDataset");
        let newID = dropdownMenu.property("value");
        // log the new ID 
        console.log(`New ID: ${newID}`);
        // rebuild the dashboard
        buildDashboard(newID);
    });
    
});