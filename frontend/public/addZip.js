import * as fs from "fs-extra";
// const fs = require("fs-extra");

let httpRequest;
document.getElementById("submitZipButton").addEventListener('click', function() {
	let id = document.getElementById("zipID").value;
	let type = document.getElementById("datasetType").value;
	let filePath = document.getElementById("myFile").value;
	// let fs = require('./bundle');
	let fileBuffer;
	try {
		fileBuffer =  fs.readFileSync(filePath);
	} catch (err) {
		throw new Error(err);
	}
	 // = document.getElementById("myFile").value;
	// makeRequest('filter2.php', userName);
	makeRequest("http://localhost:4321/dataset/", id, type, fileBuffer);
});

function makeRequest(url, id, type, file) {
	// To make an HTTP request to the server with JavaScript, you need an instance of an object.
	httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	// After making a request, you will receive a response back. At this stage,
	// you need to tell the XMLHttp request object which JavaScript function will
	// handle the response, by setting the onreadystatechange property of the object
	// and naming it after the function to call when the request changes state.
	httpRequest.onreadystatechange = alertContents2;

	// after declaring what happens when you receive the response, you need to actually
	// make the request, by calling the open() and send() methods of the HTTP request object.
	// The second parameter is the URL you're sending the request to.

	// Our JavaScript will request an HTML document, test.html, which contains the text "I'm a test."
	httpRequest.open('PUT', url + id + "/" + type);

	// for form data sent as a query string
	httpRequest.setRequestHeader('Content-Type', "application/json");

	// The parameter to the send() method can be any data you want to send to the server
	// if POST-ing the request. Form data should be sent in a format that the server can parse.\
	let data = JSON.stringify(
		{
			id: id,
			type: type,
			file: file
		});
	httpRequest.send(data);
}

function alertContents2() {
	try {
		// the function needs to check the request's state.
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			// check the HTTP response status codes of the HTTP response
			if (httpRequest.status === 200) {
				// the data the server sent
				// httpRequest.responseText – returns the server response as a string of text
				// httpRequest.responseXML – returns the response as an XMLDocument object you can traverse with JavaScript DOM functions
				// alert(httpRequest.responseText);
				displayResult(this);
				// alert(response.computedString);
			} else {
				alert('There was a problem with the request.');
			}
		}
	}
	catch( e ) {
		alert('Caught Exception: ' + e.description);
	}
}

function displayResult(xml) {
	let text = xml.responseText;
	let textJSON = JSON.parse(text);
	let values = Object.values(textJSON["result"][0]);
	let table="<table><tr><th>Shortname</th><th>Address</th></tr>";
	table += "<tr><td>" +
		values[0] +
		"</td><td>" +
		values[1] +
		"</td></tr></table>";
	document.getElementById("filterTable").innerHTML = table;
}
