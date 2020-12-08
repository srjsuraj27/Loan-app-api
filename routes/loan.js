const express = require("express");
const router = express.Router();
const Loan = require("../models/loan");
const User = require("../models/user");
const auth = require('../middleware/auth');

//@route POST api/loan/request/:id(userId)
//@desc requesting loan by agent behalf of users
//@access private 
router.post('/loan/request/:id', auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role != "agent")
            return res.status(400).json({ msg: "Access denied..only agent can request for loan" });

        const customer = await User.findOne({ _id: req.params.id });
        if(customer.role != "customer")
            return res.status(400).json({ msg: "you are not eligible to take loan" });
    
            //setting monthly charges
            rateOfInterest = req.body.interest/100;
            ri = rateOfInterest/12;
            i = Math.pow(1+ri, req.body.tenure);
    
            num = (req.body.loanamount * ri * i);
            den = i - 1;
            pmt = num/den; 
            // monthlycharges = Math.trunc(pmt);
            monthlycharges = pmt.toFixed(2);

            req.body.monthlycharges = monthlycharges;

            //setting status
            req.body.status =  "new";

            // setting user    
            req.body.user =  customer._id;
            
            //saving newloan into DB
            const newloan = new Loan(req.body);
            const savedLoan = await newloan.save();

            res.json({
                message: "Loan applied successfully..Admin has to verify and approve",
                customerName: customer.name,
                loantype: savedLoan.loantype,
                loanamount: "Rs." + savedLoan.loanamount,
                tenure: savedLoan.tenure + " " + "months",
                interest: savedLoan.interest + "%",
                monthlycharges: "Rs." + savedLoan.monthlycharges,
                status: savedLoan.status,
                loanId: savedLoan._id,
                customerId: customer._id
            });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route PUT api/loan/edit/:id(loanId)
//@desc editing loan by agent behalf of users
//@access private 
router.put('/loan/edit/:id', auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role != "agent")
            return res.status(400).json({ msg: "Access denied..only agent can edit loan." });

        const loan = await Loan.findOne({ _id: req.params.id });

        if(loan.status == "approved")
            return res.status(400).json({ msg: "cannot edit approved loan." });

        req.body.user =  loan.user;
        if(!req.body.loantype) req.body.loantype =  loan.loantype;
        if(!req.body.loanamount) req.body.loanamount =  loan.loanamount;
        if(!req.body.tenure) req.body.tenure =  loan.tenure;
        if(!req.body.interest) req.body.interest =  loan.interest;
        req.body.status =  loan.status;

        const customer = await User.findOne({ _id: loan.user });

        const editLoan = await Loan.findByIdAndUpdate(req.params.id)

        await Loan.findByIdAndUpdate(req.params.id)
            .then(loan => {
                loan.user = req.body.user;
                loan.loantype = req.body.loantype;
                loan.loanamount = req.body.loanamount;
                loan.tenure = req.body.tenure;
                loan.interest = req.body.interest;
    
                //setting monthly charges
                rateOfInterest = loan.interest/100;
                ri = rateOfInterest/12;
                i = Math.pow(1+ri, loan.tenure);
        
                num = (loan.loanamount * ri * i);
                den = i - 1;
                pmt = num/den;
                monthlycharges = pmt.toFixed(2);
    
                loan.monthlycharges = monthlycharges;
    
                //setting status
                loan.status =  req.body.status;

                loan.save()
                    .then(() => res.json({
                        message: "Loan edited and applied successfully..Admin has to verify and approve",
                        customerName: customer.name,
                        loantype: loan.loantype,
                        loanamount: "Rs." + loan.loanamount,
                        tenure: loan.tenure + " " + "months",
                        interest: loan.interest + "%",
                        monthlycharges: "Rs." + loan.monthlycharges,
                        status: loan.status,
                        loanId: loan._id,
                        customerId: customer._id,
                    }))
                    .catch(err => res.status(400).json('Error: ' + err));
            })
            .catch(err => res.status(400).json('Error: ' + err));
    }catch(err){
        res.status(500).json({ error: err.message });
    }    
         
});

//@route PUT api/loan/approve/:id(loanId)
//@desc approving loan only by admin
//@access private 
router.put('/loan/approve/:id', auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role != "admin")
            return res.status(400).json({ msg: "Access denied..only admin can approve loan." });

        const loanCheck = await Loan.findOne({ _id: req.params.id });

        if(loanCheck.status == "approved")
            return res.status(400).json({ msg: "loan already approved." });

        // getting Customer name
        const getUserName = await User.findOne({ _id: loanCheck.user });
        
        await Loan.findByIdAndUpdate(req.params.id)
        .then(loan => {
            loan.user = loanCheck.user;
            loan.loantype = loanCheck.loantype;
            loan.loanamount = loanCheck.loanamount;
            loan.tenure = loanCheck.tenure;
            loan.interest = loanCheck.interest;
            loan.monthlycharges = loanCheck.monthlycharges;
            loan.status = "approved"

            // setting start date and end date of loan
            const currentDate = new Date();

            function formatDate(date){
                let currentDayOfMonth = date.getDate();
                let currentMonth = date.getMonth();
                let currentYear = date.getFullYear();
    
                return currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
            }
            
            //loan start date
            const startDate = formatDate(currentDate);
    
            // function to add months to the current date
            function addMonths(date, months) {
                let newDate = new Date(date);
                var day = newDate.getDate();
                newDate.setMonth(newDate.getMonth() + months);
                if (newDate.getDate() != day)
                    newDate.setDate(0);
                return newDate;
            }
            const _endDate = addMonths(currentDate, loan.tenure);
            
            //loan End date
            const endDate = formatDate(_endDate);

            loan.startdate = startDate; //start date
            loan.enddate = endDate; // end date

            loan.save()
                .then(() => res.json({
                    message: "Loan Approved",
                    customerName: getUserName.name,
                    loantype: loan.loantype,
                    loanamount: "Rs." + loan.loanamount,
                    tenure: loan.tenure + " "+ "months",
                    interest: loan.interest + "%",
                    monthlycharges: "Rs." + loan.monthlycharges,
                    status: loan.status,
                    startdate: loan.startdate,
                    enddate: loan.enddate
                }))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(500).json({ error: err.message })); 

        }catch(err){
            res.status(500).json({ error: err.message });
    }
});

//@route PUT api/loan/reject/:id(loanId)
//@desc rejecting loan only by admin
//@access private 
router.put('/loan/reject/:id', auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role != "admin")
            return res.status(400).json({ msg: "Access denied..only admin can reject loan." });

        const loanCheck = await Loan.findOne({ _id: req.params.id });

        if(loanCheck.status == "approved")
            return res.status(400).json({ msg: "Cannot reject approved loan" });

        // getting Customer name
        const getUserName = await User.findOne({ _id: loanCheck.user });
        
        await Loan.findByIdAndUpdate(req.params.id)
        .then(loan => {
            loan.user = loanCheck.user;
            loan.loantype = loanCheck.loantype;
            loan.loanamount = loanCheck.loanamount;
            loan.tenure = loanCheck.tenure;
            loan.interest = loanCheck.interest;
            loan.status = "rejected"

            loan.save()
                .then(() => res.json({
                    message: "Loan Rejected",
                    customerName: getUserName.name,
                    loantype: loan.loantype,
                    loanamount: "Rs." + loan.loanamount,
                    tenure: loan.tenure + " "+ "months",
                    interest: loan.interest + "%",
                    status: loan.status
                }))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(500).json({ error: err.message })); 

        }catch(err){
            res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/customerloans
//@desc getting all customer loans
//@access private
router.get('/loan/customerloans', auth, async (req,res) => {
    try{
        const customerloans = await Loan.find({ user: req.user._id });
        if (customerloans.length == 0) return res.status(400).json({ msg: "You have not taken any Loan." });
    
        res.json(customerloans);
    }catch(err){
        res.status(500).json({ error: err.message });
    };
});

//@route GET api/loan/viewloans
//@desc getting all loans
//@access Private (only admin and agent can view)
router.get("/loan/viewloans", auth, async (req, res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role == "customer")
            return res.status(400).json({ msg: "Access denied..only admin and agent can view all loans." });    

        const allLoans = await Loan.find();
        if (!allLoans) return res.status(400).json({ msg: "No loans found" });
        
        res.json(allLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/allapproved
//@desc getting all approved loans
//@access private
router.get('/loan/allapproved', auth, async (req,res) => {
    try{
    const user = await User.findOne({ _id: req.user._id});

    if(user.role == "customer")
        return res.status(400).json({ msg: "Access denied..only admin and agent can view all approved loans." });

    const allApprovedLoans = await Loan.find({ status: "approved" });
    if (allApprovedLoans.length == 0) return res.status(400).json({ msg: "No approved loans found" });
        
    res.json(allApprovedLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/allnew
//@desc getting all loans new
//@access private
router.get('/loan/allnew', auth, async (req,res) => {
    try{
    const user = await User.findOne({ _id: req.user._id});

    if(user.role == "customer")
        return res.status(400).json({ msg: "Access denied..only admin and agent can view all loans." });

    const allLoans = await Loan.find({ status: "new" });
    if (allLoans.length == 0) return res.status(400).json({ msg: "No new loans found" });
        
    res.json(allLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/allrejected
//@desc getting all rejected loans
//@access private
router.get('/loan/allrejected', auth, async (req,res) => {
    try{
    const user = await User.findOne({ _id: req.user._id});

    if(user.role == "customer")
        return res.status(400).json({ msg: "Access denied..only admin and agent can view all loans." });

    const allLoans = await Loan.find({ status: "rejected" });
    if (allLoans.length == 0) return res.status(400).json({ msg: "No rejected loans found" });
        
    res.json(allLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/createdat
//@desc getting all loans sorted by date of creation
//@access private
router.get('/loan/createdat', auth, async (req,res) => {
    try{
    const user = await User.findOne({ _id: req.user._id});

    if(user.role == "customer")
        return res.status(400).json({ msg: "Access denied..only admin and agent can view all loans." });

    const allLoans = await Loan.find().sort({ createdAt: -1 });
    if (allLoans.length == 0) return res.status(400).json({ msg: "No loans found" });
        
    res.json(allLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/loan/updatedat
//@desc getting all loans sorted by date of updation
//@access private
router.get('/loan/updatedat', auth, async (req,res) => {
    try{
    const user = await User.findOne({ _id: req.user._id});

    if(user.role == "customer")
        return res.status(400).json({ msg: "Access denied..only admin and agent can view all loans." });

    const allLoans = await Loan.find().sort({ updatedAt: -1 });
    if (allLoans.length == 0) return res.status(400).json({ msg: "No approved loans found" });
        
    res.json(allLoans);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;