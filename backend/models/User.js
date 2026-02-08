const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true,
        unique:true
    },

    role:{
        type:String,
        enum:["admin","distributor"],
        required:true
    },

    distributorCode:{
        type:String,
        unique:true,
        sparse:true,
        required:function(){
            return this.role === "distributor";
        }
    },

    state:String,
    district:String,

    loginAllowed:{
        type:Boolean,
        default:true
    }, 
    aadhaar:{
        type:String,
        required:true,
        match:/^[0-9]{12}$/
    }

},{
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);
