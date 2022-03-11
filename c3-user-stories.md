Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a UBC CPSC student, I want to find CPSC courses with an average above 70, so that it can help me with deciding what courses to choose for course selection.


#### Definitions of Done(s)
Scenario 1: Valid  
Given: The UBC courses dataset is already added (and not removed)  
When:   
Then: \<Some outcome state is expected (post-condition)\>

Scenario 2: Invalid query - no dataset  
Given: The UBC courses dataset is not yet added or was removed?  
When: The user   
Then:  

Scenario 3: Invalid query - dataset not selected  
Given: The UBC courses dataset is already added (and not removed)  
When: A dataset is not selected by the user, but the user proceeds to tick off "department" and input "CPSC" into the text box beside it.  
Then:

## User Story 2
As a new student attending UBC, I want to be able to search a building by short name and get the address of the building back, so that I can find the location for my classes.


#### Definitions of Done(s)
Scenario 1: Correct input - building found  
Given: The UBC buildings/rooms dataset is already added (and not removed)  
When: Under "FILTER", the user ticks off boxes for "short name" and "address". 
The user then types in the building's (entire or partial) short name into the text box beside the tick boxes. 
Then the user hits "SUBMIT".  
Then: A table with columns "short name" (with value what the user input) and "address" (with value is address of the building) 

Scenario 2: Incorrect input - building not found  
Given: The UBC buildings/rooms dataset is already added and not removed  
When: \<The user do some series of action\>  
Then: \<Some outcome state is expected (post-condition)\>

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.

## User Story 3
As a student, I want to be able to add a zip file with data on courses/building, so that I can query the data afterwards.

#### Definitions of Done(s)
Scenario 1: Adding valid data
Given: 
When: 
Then:

Scenario 2: Adding invalid data
Given: 
When:
Then:
