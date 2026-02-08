const mongoose = require("mongoose");

const workSessionSchema = new mongoose.Schema({

    distributorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    startTime:{
        type:Date
    },

    endTime:{
        type:Date
    },

    isActive:{                 // ⭐ MUST EXIST
        type:Boolean,
        default:true
    },

    distanceTravelled:{
        type:Number,
        default:0
    }

},{timestamps:true});


// ⭐ ADD THIS (VERY IMPORTANT FOR PERFORMANCE)
workSessionSchema.index({ distributorId:1, isActive:1 });

module.exports = mongoose.model("WorkSession", workSessionSchema);