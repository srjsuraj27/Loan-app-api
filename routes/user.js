const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require('config');
const auth = require('../middleware/auth');

//@route POST api/user/signup
//@desc Register new user
//@access Public
router.post('/user/signup', async (req,res) => {
    try{
        let { name, email, password, passwordCheck, role } = req.body;

        //chacking all fields
        if (!name || !email || !password || !passwordCheck)
            return res.status(400).json({ msg: "Enter all fields." });

        //email validation
        function validateEmail(emailAddress){
            let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (emailAddress.match(regexEmail)) {
                return true; 
            } else {
                return false; 
            }
        }
        let emailAddress = validateEmail(email);        

        if (!emailAddress)
            return res.status(400).json({ msg: "Enter valid email address" });

        //password validation
        if (password.length < 5)
            return res
              .status(400)
              .json({ msg: "password must be minimum 5 characters" });

        if (password !== passwordCheck)
            return res
                .status(400)
                .json({ msg: "Enter the same password twice for verification." });

        //setting the role        
        if (!role) role = "customer";

        //checking if user exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser)
            return res
                .status(400)
                .json({ msg: "Email already exists." });

        //hashing password        
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        
        //saving newuser into DB
        const newUser = new User({
            name,
            email,
            password: passwordHash,
            role
        });
        const savedUser = await newUser.save();
        res.json({msg:"Registration Success",savedUser});
        
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route POST api/user/login
//@desc login user
//@access Public
router.post('/user/login', async (req, res) => {
    try{
        const { email, password } = req.body;

        //checking all fields
        if (!email || !password)
            return res.status(400).json({ msg: "Enter all fields." });       

        //email validation
        function validateEmail(emailAddress){
            let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (emailAddress.match(regexEmail)) {
                return true; 
            } else {
                return false; 
            }
        }
        let emailAddress = validateEmail(email);        

        if (!emailAddress)
            return res.status(400).json({ msg: "Enter valid email address" });


        await User.findOne({ email: email }, async (err, user) => {
            if(err || !user)
                return res
                    .status(400)
                    .json({ msg: "Email does not exists" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

            const { _id, name, email, role } = user;
            const token = jwt.sign({ _id }, config.get('jwtSecret'));       
            return res.json({ msg: "Login Success", token, user: { _id, name, email, role } });

        });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/user/allusers
//@desc getting all users
//@access Public
router.get("/user/allusers", async (req, res) => {
    try{
        const allUsers = await User.find();
        if (!allUsers) return res.status(400).json({ msg: "No users found" });
        
        res.json(allUsers);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/user/dashboard/:id
//@desc user dashboard
//@access Private
router.get("/user/dashboard/:id", auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.params.id });
        
        if(user.role === "admin") return res.json("Welcome to Admin Dashboard");
        if(user.role === "agent") return res.json("Welcome to Agent Dashboard");
        if(user.role === "customer") return res.json("Welcome to Customer Dashboard");

    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

//@route GET api/user/delete
//@desc delete user
//@access Private
router.delete("/user/delete", auth, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user._id);
      if (!deletedUser) return res.status(400).json({ msg: "User does not exists to delete." });
      
      res.json(deletedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//@route GET api/user/allcustomers
//@desc view customers
//@access Private (only agents and admin can access)
router.get("/user/allcustomers", auth, async (req,res) => {
    try{
        const user = await User.findOne({ _id: req.user._id});

        if(user.role != "agent" && user.role != "admin")
            return res.status(400).json({ msg: "Access denied..only Admin and Agents can access all customers" });
        
        const allcustomers = await User.find({ role: "customer" });

        res.json(allcustomers);

    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;