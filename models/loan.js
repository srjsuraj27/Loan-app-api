var mongoose = require("mongoose");
var { ObjectId } = mongoose.Schema;

var loanSchema = new mongoose.Schema(
{
    user: {
        type: ObjectId,
        ref: "User"
    },
    loantype: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    loanamount: {
        type: Number,
        required: true 
    },
    tenure: { 
        type: Number,
        required: true 
    },
    interest: { 
        type: Number,
        required: true 
    },
    monthlycharges: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    status: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    startdate: {
        type: String,
        trim: true 
    },
    enddate: {
        type: String,
        trim: true 
    }
},
{ timestamps: true }
);

module.exports = Loan = mongoose.model("loan", loanSchema);