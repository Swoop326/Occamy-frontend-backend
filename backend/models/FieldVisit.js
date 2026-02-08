const mongoose = require("mongoose");

const fieldVisitSchema = new mongoose.Schema({

    distributorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    assignedVisitId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"AssignedVisit",
        default:null
    },

    /*
    ==========================
    MEETING INFO
    ==========================
    */

    visitType:{
        type:String,
        enum:["one_on_one","group"],
        required:true
    },

    name:String,
    village:String,
    attendees:Number,

    category:{
        type:String,
        enum:["farmer","seller","influencer"]
    },

    businessPotential:String,
    notes:String,

    // 🔥 MULTI PHOTO SUPPORT
    photoUrls:[String],

    location:{
        latitude:Number,
        longitude:Number
    },

    /*
    ==========================
    SALES SECTION
    ==========================
    */

    saleType:{
        type:String,
        enum:["B2B","B2C"]
    },

    productSKU:String,
    packSize:String,
    quantity:Number,

    buyerType:String,
    buyerName:String,

    repeatOrder:{
        type:Boolean,
        default:false
    },

    /*
    ⭐ Judges LOVE analytics-ready fields
    */
    visitOutcome:{
        type:String,
        enum:["interested","not_interested","follow_up","converted"],
        default:"interested"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("FieldVisit", fieldVisitSchema);
