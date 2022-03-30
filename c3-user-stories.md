Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a student, I want to be able to add a zip file with valid id, so that I can query the data afterwards.

---

#### Definitions of Done(s)
**Scenario 1**: Adding valid zip file, id

Given: User is on the 'Dataset' tab  
When:
- User enters either a valid (at least one character with no underscore), unique id.
- User chooses kind "Rooms" or "Courses".
- User clicks "Choose File" to upload corresponding "Courses" or "Rooms" zip file.
- User clicks "Submit".

Then: If zip file is added successfully, a list of added ids will appear on the right panel.

---

**Scenario 2**: Adding invalid id

Given: User is on the "Dataset" tab  
When:
- User enters either an invalid (empty string or underscore) or duplicated id.
- User chooses kind "Rooms" or "Courses".
- User clicks "Choose File" to upload corresponding "Courses" or "Rooms" zip file.
- User clicks "Submit".

Then: An alert with "Invalid id." message pops up. List of added ids will not be updated.

---

**Scenario 3**: Adding invalid zip file

Given: User is on the "Dataset" tab  
When:
- User enters either a valid (at least one character with no underscore), unique id.
- User chooses kind "Rooms" or "Courses".
- User clicks "Choose File" to upload corresponding "Courses" or "Rooms" zip file which is has invalid contents.
- User clicks "Submit".

Then: An alert with corresponding error message pops up. List of added ids will not be updated.


## User Story 2
As a new student attending UBC, I want to be able to search a building by short name and get the address of the building back, so that I can find the location for my classes.

---

#### Definitions of Done(s)
**Scenario 1**: Valid building name & id  
Given: The UBC buildings/rooms dataset is already added (and not removed)  
When: 
- User clicks "Queries" tab.
- User enters a valid id which corresponding dataset is added.
- User enter a valid building shortname that appears in the corresponding dataset.
- User clicks "Search".

Then: A table displaying the results opens on the right on the same page. 
It is populated with columns "Shortname" and "Address" and results below each column.
Results under "Shortname" match/contain the input from user.

---

**Scenario 2**: Invalid building name - asterisk in the middle of input  
Given: The UBC buildings/rooms dataset is already added (and not removed)  
When: 
- User clicks "Queries" tab.
- User enters a valid id which corresponding dataset is added.
- User enters an invalid building shortname (eg: asterisk in the middle of input).
- User clicks "Search".

Then: An alert with "Values Invalid." message pops up. Table will not be updated.

---

**Scenario 3**: Invalid id - id not added
Given: The UBC buildings/rooms dataset of some id is already added (and not removed)  
When:
- User clicks "Queries" tab.
- User enters an invalid id which was not added.
- User enter a building shortname that appears in the corresponding dataset.
- User clicks "Search".

Then: An alert with "Dataset ID does not exist." message pops up. Table will not be updated.

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.
