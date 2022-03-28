let httpRequest;
document.getElementById("buildingCodeFilterButton").addEventListener('click', function() {
	let code = document.getElementById("buildingCodeFilter").value;
	let id = document.getElementById("roomsID").value;
	// makeRequest('filter2.php', userName);
	makeRequest("http://localhost:4321/query", code, id);
});

function makeRequest(url, code, id) {
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
	httpRequest.onreadystatechange = alertContents;

	// after declaring what happens when you receive the response, you need to actually
	// make the request, by calling the open() and send() methods of the HTTP request object.
	// The second parameter is the URL you're sending the request to.

	// Our JavaScript will request an HTML document, test.html, which contains the text "I'm a test."
	httpRequest.open('POST', url);

	// for form data sent as a query string
	httpRequest.setRequestHeader('Content-Type', "application/json");

	const shortname = id + "_shortname";
	const address = id + "_address";
	// The parameter to the send() method can be any data you want to send to the server
	// if POST-ing the request. Form data should be sent in a format that the server can parse.\
	let data = JSON.stringify(
		{
			"WHERE": {
				"IS": {
					[shortname]: code
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					shortname,
					address
				]
			},
			"TRANSFORMATIONS": {
				"GROUP": [
					shortname,
					address
				],
				"APPLY": []
			}
		});
	httpRequest.send(data);
}

function alertContents() {
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
