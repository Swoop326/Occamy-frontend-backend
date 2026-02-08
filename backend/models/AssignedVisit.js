const mongoose = require("mongoose");

const assignedVisitSchema = new mongoose.Schema({

    distributorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    distributorCode:{
        type:String,
        required:true,
        index:true
    },

    village:{
        type:String,
        required:true
    },

    notes:String,

    visitDate:{
        type:Date,
        required:true,
        index:true
    },

    status:{
        type:String,
        enum:["pending","completed"],
        default:"pending",
        index:true
    },

    /*
    🔥 GEOJSON FORMAT
    */
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number], // [lng, lat]
        }
    },

    completedAt: Date

},{timestamps:true});


// ⭐ THIS IS HUGE
assignedVisitSchema.index({ location:"2dsphere" });

module.exports = mongoose.model("AssignedVisit", assignedVisitSchema);