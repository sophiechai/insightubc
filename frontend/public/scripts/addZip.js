// import readToBuffer from "./importExport";
// let readToBuffer = require("./importExport");

let httpRequest;
let arrayBuffer;
document.getElementById("submitZipButton").addEventListener('click', function() {
	let id = document.getElementById("zipID").value;
	let type = document.getElementById("datasetType").value;
	let fileObject = document.getElementById("myFile").files[0];

	let reader = new FileReader();
	reader.onload = function(e) {
		arrayBuffer = reader.result;
		makeRequest("http://localhost:4321/dataset/", id, type, arrayBuffer);
	}
	reader.readAsArrayBuffer(fileObject);


});

function makeRequest(url, id, type, arrayBuffer) {
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
	httpRequest.setRequestHeader('Content-Type', "application/x-zip-compressed");

	// // The parameter to the send() method can be any data you want to send to the server
	// // if POST-ing the request. Form data should be sent in a format that the server can parse.\

	httpRequest.send(arrayBuffer);
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
				displayResult(this);
			} else if (httpRequest.status === 400){
				let text = this.responseText;
				let textJSON = JSON.parse(text);
				let values = textJSON["error"];
				alert("Err: " + values);
			} else {
				alert('Err: There was a problem with the request.');
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
	let values = textJSON["result"];
	let p = "<ul>";
	for (let value of values) {
		p += "<li>" + value + "</li>"
	}
	p += "</ul>";
	document.getElementById("addedZipFilesList").innerHTML = p;
}
