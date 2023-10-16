const express = require('express');
const xml2js = require('xml2js');
const axios = require('axios');
const { parse } = require('path');

const app = express();

// Configure Express to parse the request body as XML
app.use(express.text({ type: 'text/xml' }));

// POST endpoint to receive the XML file
app.post('/upload', async(req, res) => {
  
var url = req.query.url;
console.log("Check URL: " + url);

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }
  

  try {
    // Fetch the XML file from the provided URL
    const response = await axios.get(url, {
      responseType: 'text'
    });

    const xmlData = response.data;

    // Parse the XML data
    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return res.status(400).send('Invalid XML data');
      }

      // Extract the necessary data from the parsed result
      const dataArray = extractData(result);

      // Send a response back to the client
      //Angus Comment
      res.status(200).send(JSON.stringify(dataArray));
    });
  } catch (error) {
    console.error('Error fetching XML file:', error);
    res.status(400).send('Failed to fetch XML file');
  }
});

// Helper function to extract data from the parsed XML result
function extractData(parsedXml) {

    console.log("ParseXML project-no: " + JSON.stringify(parsedXml['data-set']['record'][0]['project-no'][0])); //report status
    console.log("ParseXML: " + JSON.stringify(parsedXml['data-set']['record'][0]['status'][0]['div'][0])); //report status
    console.log("ParseXML: " + JSON.stringify(parsedXml['data-set']['record'][0]['status'][0]['a'][0]['$']['href']));  //report link

    let tempArray = [];
    for(var x = 0; x < parsedXml['data-set']['record'].length ; x++)
    {
        let tempObject = {"project_no" : "" , "report_status" : "", "report_link": ""};
        tempObject.project_no = parsedXml['data-set']['record'][x]['project-no'][0];
        tempObject.report_status = parsedXml['data-set']['record'][x]['status'][0]['div'][0];

        if(parsedXml['data-set']['record'][x]['status'][0]['div'][0] == "Completed")
        {
            tempObject.report_link = parsedXml['data-set']['record'][x]['status'][0]['a'][0]['$']['href'];
        }
        else tempObject.report_link = "No Report";

        tempArray.push(tempObject);
    }

    console.log(tempArray[0]);
    console.log(tempArray[1]);
    return tempArray;
}


// Start the server
const port = 3026;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});