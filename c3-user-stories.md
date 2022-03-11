Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a student, I want to be able to add a zip file with data on courses/building, so that I can query the data afterwards.

---

#### Definitions of Done(s)
**Scenario 1**: Adding valid zip file
Given: User is on the add dataset page/window
When:
- The user clicks on "ADD DATASET" and file explorer pops up where user selects a valid zip
  // or the user drags and drops a zip to the area indicated.
- In a text box below, user writes a valid name for the dataset in the text box.
- User clicks "ADD" button.

Then: Add dataset page/window closes and a message appears saying "DATASET (name) ADDED SUCCESSFULLY".

---

**Scenario 2**: Adding invalid zip file
Given: User is on the add dataset page/window
When:
- The user clicks on "ADD DATASET" and file explorer pops up where user selects an invalid zip
  // or the user drags and drops a invalid zip to the area indicated. (invalid ex. not a zip, no courses folder, etc)
- In a text box below, user writes a name for the dataset in the text box.
- User clicks "ADD" button.

Then: Add dataset page/window closes and a message appears saying "DATASET (name) NOT ADDED".
Another message below indicating the reason (ex. "The file given is not a zip file").

---

**Scenario 3**: Adding valid zip file with invalid name
Given: User is on the add dataset page/window 
When:
- The user clicks on "ADD DATASET" and file explorer pops up where user selects a valid zip
  // or the user drags and drops a zip file to the area indicated.
- In a text box below, user writes an invalid name (ex. with underscore or leaves empty) in the text box.
- User clicks "ADD" button.

Then: Add dataset page/window closes and a message appears saying "DATASET (name) NOT ADDED".
Another message below indicating the reason (ex. "The dataset name must not be blank nor contain underscores").

---

## User Story 2
As a new student attending UBC, I want to be able to search a building by short name and get the address of the building back, so that I can find the location for my classes.

---

#### Definitions of Done(s)
**Scenario 1**: Valid building name  
Given: The UBC buildings/rooms dataset is already added (and not removed)  
When: 
- Under "DATASET", the user selects the dataset for buildings.
- Under "FILTER", the user ticks off box for "short name" and types in the building's (entire or partial) short name into the text box beside it.
- User also ticks box for "address".  
- Then the user hits "SUBMIT".

Then: A table displaying the results opens right below the query box on the same page. 
It is populated with columns "BUILDINGS SHORT NAME" and "ADDRESS" and results below each column.
Results under "BUILDINGS SHORT NAME" match/contain the input from user.

---

**Scenario 2**: Invalid building name - asterisk in input  
Given: The UBC buildings/rooms dataset is already added (and not removed)  
When: 
- Under "DATASET", the user selects the dataset for buildings.
- Under "FILTER", the user ticks off box for "short name" and types an input with an asterisk into the text box beside it.
- User also ticks box for "address".
- Then the user hits "SUBMIT".

Then: A message pops up that says "ERROR: QUERY COULD NOT BE PERFORMED" and underneath is a message explaining why.

---

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.


## User Story 3
As a UBC CPSC student, I want to find CPSC courses with an average above 70, so that it can help me with deciding what courses to choose for course selection.


#### Definitions of Done(s)
Scenario 1: Valid - entire "CPSC"  
Given: The UBC courses dataset is already added (and not removed)  
When: The user selects the courses dataset that's listed under "DATASETS".
Then ticks off box for "DEPARTMENT" and inputs "CPSC" into the text box beside it.
Under "APPLY/COMPUTE" (?), the user also ticks off "AVERAGE" and inputs "average" into the text box beside it.
Then the user clicks on "SUBMIT".
Then: A new page pops up that displays a table with columns with "DEPARTMENT" and "AVERAGE OF average"

Scenario 2: Valid - partial "CPSC"  
Given: The UBC courses dataset is already added (and not removed)  
When: The user selects the courses dataset that's listed under "DATASETS". Then the     
Then: \<Some outcome state is expected (post-condition)\>

Scenario X: Invalid query - no dataset  
Given: The UBC courses dataset is not yet added or was removed?  
When: The user   
Then:

Scenario X: Invalid query - dataset not selected  
Given: The UBC courses dataset is already added (and not removed)  
When: A dataset is not selected by the user.
Under "FILTER", the user proceeds to tick off "department" and input "CPSC" into the text box beside it.
User also ticks off    
Then:
