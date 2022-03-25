let httpRequest;
document.getElementById("ajaxButton").addEventListener('click', makeRequest);

function makeRequest() {
	httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	httpRequest.onreadystatechange = alertContents;
	httpRequest.open('GET', 'test.html');
	httpRequest.send();
}

function alertContents() {
	try {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				alert(httpRequest.responseText);
			} else {
				alert('There was a problem with the request.');
			}
		}
	}
	catch( e ) {
		alert('Caught Exception: ' + e.description);
	}
}
