const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({

    name:String,

    mobile:String,

    convertedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Farmer", farmerSchema);
