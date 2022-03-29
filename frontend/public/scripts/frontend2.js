// document.getElementById("click-me-button").addEventListener("click", handleClickMe);

// document.getElementById("zipfile").addEventListener("change", changeLayout);

function changeLayout(){
	let coursesList = ["courses", "courses2"];
	let roomsList = ["rooms", "rooms2"];
	let id = this.value;
	if (coursesList.includes(id)) {
		showCoursesFilter();
		// document.getElementById("coursesColumns").addEventListener("change",
		// 	function() { updateOrderCourses("courses[]", "coursesOrder"); });
		updateOrderCourses("courses[]", "coursesOrder");
		showCoursesOrder();
	} else {
		showRoomsFilter();
		document.getElementById("roomsColumns").addEventListener("change",
			function() { updateOrderCourses("rooms[]", "roomsOrder"); });
		showRoomsOrder();
	}
}

function showCoursesFilter() {
	const result = document.querySelector('.result');
	result.textContent = "You choose courses";
	document.getElementById("coursesColumns").style.display = "block";
	document.getElementById("roomsColumns").style.display = "none";
}

function showRoomsFilter() {
	const result = document.querySelector('.result');
	result.textContent = "You choose rooms";
	document.getElementById("coursesColumns").style.display = "none";
	document.getElementById("roomsColumns").style.display = "block";
}

function updateOrderCourses(type, order) {
	// Select all checkboxes with the name 'courses' using querySelectorAll.
	let checkboxes = document.querySelectorAll("input[type=checkbox][name=" + CSS.escape(type) + "]");
	let checkedBoxValueArray = [];
	let checkedBoxTextArray = [];

	// Use Array.forEach to add an event listener to each checkbox.
	checkboxes.forEach(function(checkbox) {
		checkbox.addEventListener('change', function() {
			checkedBoxValueArray =
				Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
					.filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
					.map(i => i.value);// Use Array.map to extract only the checkbox values from the array of objects.

			checkedBoxTextArray = [];
			checkedBoxValueArray.forEach(function(value) {
				let labels = document.querySelectorAll("label[for=" + CSS.escape(value) + "]");
				checkedBoxTextArray.push(labels[0].innerText);
			});

			populateOrder(checkedBoxValueArray, checkedBoxTextArray, order);
		});
	});
}

function populateOrder(checkedBoxValueArray, checkedBoxTextArray, order) {
	let select = document.getElementById(order);
	select.innerHTML = '';

	let selectOne = document.createElement('option');
	selectOne.value = "";
	selectOne.innerText = "Select One ...";
	select.appendChild(selectOne);

	for (let i = 1; i < checkedBoxValueArray.length; i++){
		let opt = document.createElement('option');
		opt.value = checkedBoxValueArray[i];
		opt.innerText = checkedBoxTextArray[i];
		select.appendChild(opt);
	}
}

function showCoursesOrder() {
	document.getElementById("coursesOrder").style.display = "block";
	document.getElementById("roomsOrder").style.display = "none";
	document.getElementById("sequence").style.display = "block";
}

function showRoomsOrder() {
	document.getElementById("coursesOrder").style.display = "none";
	document.getElementById("roomsOrder").style.display = "block";
	document.getElementById("sequence").style.display = "block";
}
