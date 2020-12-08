<!-- RedCarpet Task: Loan Management System -->

-- API is built using Node.js and MongoDB

-- To Run Application through Docker, run following commands in project directory
    -- docker build -t <DockerId>/<project_foldername> .
    -- docker run <DockerId>/<project_foldername>

-- To Run Application through npm, run following commands in project directory
	-- npm install
	-- npm start

-- Admin Credential:
    Email: suraj.admin@gmail.com
    password: surajadmin

-- Agent Credential:
    Email: neeraj.agent@gmail.com
    password: neerajagent

-- Customer Credentials:
    1. Email: ramesh@gmail.com, password: ramesh
    2. Email: kumar@gmail.com, password: kumar
    3. Email: suresh@gmail.com, password: suresh
    4. Email: sanjay@gmail.com, password: sanjay

-- TestCases:

-- TestCase 1: Registration and Roles

	- route: http://localhost:5000/api/user/signup
	- method: POST
	- description: user registration

	- User needs to fill name, email, password,passwordCheck fields to Register 
	- Used bcryptjs dependency to salt and hash the password
	- hashed password is saved in Database

	- While designing Database, I have set SURAJ as ADMIN and NEERAJ as AGENT
	-  //setting the role for customer
        if (!role) role = "customer"; 
	-  Any user registered, role will be set to "customer"

	*REQUEST: Body(JSON TYPE)
		{
    		"name": "abhay",
    		"email": "abhay@gmail.com",
    		"password": "abhay",
    		"passwordCheck": "abhay"
		}
	*RESPONSE: 
		- {"msg":"Enter valid email address"}
		- {"msg":"password must be minimum 5 characters"}
		- {"msg": "Enter the same password twice for verification."}
		- On successsfull validation. User is saved in DB and response the user info.
		- {
		    "msg":"Registration Success",
		    "savedUser":{
	            "_id":"5fcf0d0c3b18882c18526fb8",
		    "name":"abhay",
	            "email":"abhay@gmail.com",
		    "password":"$2a$10$iK1wzoVniyDq9FA0nCf7Nenkxtx.75lkriKfEEIUibniYsGxkiGmq",
		    "role":"customer",
		    "createdAt":"2020-12-08T05:20:12.104Z",
		    "updatedAt":"2020-12-08T05:20:12.104Z",
		    "__v":0
		    }
		   }

-- TestCase 2: User Login and creating token

	- route: http://localhost:5000/api/user/login
	- method: POST
	- description: user Login

	- User needs to fill email, password fields to Login
	- Used jsonwebtoken to create token.
	- Email and password is validated
	- checking if entered email present in the Database, if not error is promoted
	- password is compared with the hashed password saved in Database using bcrypt.compare()
	- Token is generated for every login 

	*REQUEST: Body(JSON Type)
		{
    		"email":"abhay@gmail.com",
            "password":"abhay"
		}

	*RESPONSE:
	    - {"msg": "Invalid credentials."}
	    - On successful Login, gets Token and user info as response	
	    - {
    		"msg": "Login Success",
    		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmNmMGQwYzNiMTg4ODJjMTg1MjZmYjgiLCJpYXQiOjE2MDc0MDg4OTJ9.uGfZwexDoeBcZhY42dsPEhqGHsawGFvbFySVJ0c5NAw",
     		"user": {
        	"_id": "5fcf0d0c3b18882c18526fb8",
        	"name": "abhay",
        	"email": "abhay@gmail.com",
        	"role": "customer"
    		}
		}	

-- TestCase 3: Listing all customers [Only Admin and Agent can access]

	- route: http://localhost:5000/api/user/allcustomers
	- method: GET
	- description: PRIVATE route, Only Admin and Agent can access all customers 

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>
		
	*RESPONSE: 
		- {"msg": "Access denied..only Admin and Agents can access all customers"}
		- On Success gets all Customers

-- TestCase 4: Requesting loan by Agent behalf of users

	- route: http://localhost:5000/api/loan/request/[give customerId here]
	- method: POST
	- description: PRIVATE route, Only Agent can request Loan 
		
	- Login with Agent Credentials	
		Email: neeraj.agent@gmail.com
		password: neerajagent
	- copy and paste the TOKEN in to Header

	*REQUEST: 
		Header:- x-auth-token: <token>
		Body(JSON Type):-
			{
    			"loantype":"Homeloan",
    			"loanamount":2500000,
    			"tenure":48,
    			"interest":7.1
			}

	*RESPONSE: 
		- {"msg": "Access denied..only agent can request for loan"}
		- On Success calculates the monthly payment and send Loan details as response
		- {
    	    "message": "Loan applied successfully..Admin has to verify and approve",
    		"customerName": "rajesh",
    		"loantype": "Homeloan",
    		"loanamount": "Rs.2500000",
    		"tenure": "48 months",
    		"interest": "7.1%",
    		"monthlycharges": "Rs.59981.67",
   		    "status": "new",
   		    "loanId": "5fcf2d11488a141d4cf22f60",
    		"customerId": "5fcf06bb68447d2100a6f74f"
		   }

-- TestCase 5: Getting all Loans 

	- route: http://localhost:5000/api/loan/viewloans
	- method: GET
	- description: PRIVATE route, Only Admin and Agent view all Loans

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all loans." }
		- On Success gets all Loans

-- TestCase 6: Editing loan by Agent only before Loan approved by Admin

	- route: http://localhost:5000/api/loan/edit/[give LoanId here]
	- method: PUT
	- description: PRIVATE route, Only Agent can edit Loan before getting approved by admin

	- Login with Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>
		Body(JSON Type):-
			{
    			"loantype":"Homeloan",
    			"loanamount":2500000,
    			"tenure":48,
    			"interest":6.95
			}

	*RESPONSE:
		- { msg: "Access denied..only agent can edit loan." }
		- { msg: "cannot edit approved loan." }
		- On Success saves changes in Database and send response
		- {
    		"message": "Loan edited and applied successfully..Admin has to verify and approve",
    		"customerName": "rajesh",
    		"loantype": "Homeloan",
    		"loanamount": "Rs.2500000",
    		"tenure": "48 months",
    		"interest": "6.95%",
     		"monthlycharges": "Rs.59807.64",
    		"status": "new",
    		"loanId": "5fcf2d11488a141d4cf22f60",
   	 	    "customerId": "5fcf06bb68447d2100a6f74f"
		  }

-- TestCase 7: Approving loan only by admin

	- route: http://localhost:5000/api/loan/approve/[give loanID here]
	- method: PUT
	- description: PRIVATE route, Only Admin can approve loans

	- Login with Admin Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>
		Body:- Not required

	*RESPONSE:
		- { msg: "Access denied..only admin can approve loan." }
		- { msg: "loan already approved." }
		- On Success generates Start Date and End Date of the Loan duration and saves Loan info in Database.
		- {
    		"message": "Loan Approved",
            "customerName": "rajesh",
   		    "loantype": "Homeloan",
    	  	"loanamount": "Rs.2500000",
    		"tenure": "48 months",
    		"interest": "6.95%",
   		    "monthlycharges": "Rs.59807.64",
    		"status": "approved",
    	  	"startdate": "8-12-2020",
    		"enddate": "8-12-2024"
		  } 

-- TestCase 8: Rejecting loan only by admin

	- route: http://localhost:5000/api/loan/reject/[give loanID here]
	- method: PUT
	- description: PRIVATE route, Only Admin can reject loans

	- Login with Admin Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>
		Body:- Not required

	*RESPONSE:
		- { msg: "Access denied..only admin can reject loan." }
		- { msg: "Cannot reject approved loan" }
		- On Success rejects loan, save changes in database and sends response
		- {
    		"message": "Loan Rejected",
    		"customerName": "dravid",
    		"loantype": "Homeloan",
    		"loanamount": "Rs.2500000",
    		"tenure": "48 months",
    		"interest": "7.1%",
    		"status": "rejected"
		  }


-- TestCase 9: Customer getting all his loans

	- route: http://localhost:5000/api/loan/customerloans
	- method: GET
	- description: PRIVATE route, Customer can get only his Loans 

	- Login with Customer Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "You have not taken any Loan." }
		- On Success, customer gets his loans

-- TestCase 10: Getting all approved loans

	- route: http://localhost:5000/api/loan/allapproved
	- method: GET
	- description: PRIVATE route, only Admin or Agent can get all approve loans 

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all approved loans." }
		- { msg: "No approved loans found" }
		- On Success, gets all approved loans

-- TestCase 11: Getting all New loans

	- route: http://localhost:5000/api/loan/allnew
	- method: GET
	- description: PRIVATE route, only Admin or Agent can get all New loans

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all New loans." }
		- { msg: "No new loans found" }
		- On Success, gets all New loans

-- TestCase 12: Getting all Rejected loans

	- route: http://localhost:5000/api/loan/allrejected
	- method: GET
	- description: PRIVATE route, only Admin or Agent can get all Rejected loans

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all Rejected loans." }
		- { msg: "No rejected loans found" }
		- On Success, gets all Rejected loans

-- TestCase 13: Getting loans sorted by the date of creation

	- route: http://localhost:5000/api/loan/createdat
	- method: GET
	- description: PRIVATE route, only Admin or Agent can get all loans by the date of Creation

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all loans." }
		- { msg: "No loans found" }
		- On Success, gets all loans by the date of creation.

-- TestCase 14: Getting loans sorted by the date of updation

	- route: http://localhost:5000/api/loan/updatedat
	- method: GET
	- description: PRIVATE route, only Admin or Agent can get all loans by the date of updation

	- Login with Admin or Agent Credentials
	- After login copy the TOKEN and paste it in Header

	*REQUEST:
		Header:- x-auth-token: <token>

	*RESPONSE:
		- { msg: "Access denied..only admin and agent can view all loans." }
		- { msg: "No loans found" }
		- On Success, gets all loans by the date of updation








