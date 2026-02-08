const FieldVisit = require("../models/FieldVisit");
const AssignedVisit = require("../models/AssignedVisit");

exports.createFieldVisit = async (req,res)=>{
    try{

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const distributorId = req.user.id;

        let {
            assignedVisitId,
            visitType,
            name,
            village,
            attendees,
            category,
            businessPotential,
            notes,
            latitude,
            longitude,
            saleType,
            productSKU,
            packSize,
            quantity,
            buyerType,
            buyerName,
            repeatOrder
        } = req.body;

        /*
        ===================================
        ✅ CLEAN ASSIGNED VISIT ID
        ===================================
        */

        if(!assignedVisitId || assignedVisitId === "undefined"){
            assignedVisitId = null;
        }

        /*
        ===================================
        ✅ NORMALIZE STRINGS
        ===================================
        */

        visitType = visitType?.toLowerCase();
        category = category?.toLowerCase();

        /*
        ===================================
        ✅ SAFE LOCATION
        ===================================
        */

        const lat = Number(latitude);
        const lng = Number(longitude);

        if(isNaN(lat) || isNaN(lng)){
            return res.status(400).json({
                message:"Invalid location coordinates"
            });
        }

        /*
        ===================================
        ✅ HANDLE MULTIPLE IMAGES
        ===================================
        */

        let photoUrls = [];

        if(req.files && req.files.length > 0){
            photoUrls = req.files.map(file => file.path);
        }

        /*
        ===================================
        ✅ CREATE FIELD VISIT
        ===================================
        */

        const visit = await FieldVisit.create({

            distributorId,
            assignedVisitId,

            visitType,
            name,
            village,
            attendees,
            category,
            businessPotential,
            notes,

            photoUrls,

            location:{
                latitude:lat,
                longitude:lng
            },

            saleType,
            productSKU,
            packSize,
            quantity: quantity ? Number(quantity) : undefined,
            buyerType,
            buyerName,
            repeatOrder
        });

        /*
        ===================================
        🔥 AUTO COMPLETE ASSIGNED VISIT
        ===================================
        */

        if(assignedVisitId){

            const assigned = await AssignedVisit.findById(assignedVisitId);

            if(assigned && assigned.status !== "completed"){

                assigned.status = "completed";
                assigned.completedAt = new Date();

                await assigned.save();
            }
        }

        res.status(201).json({
            message:"Field visit submitted ✅",
            visit
        });

    }catch(err){

        console.log("FIELD VISIT ERROR:",err.message);

        res.status(500).json({
            error:err.message
        });
    }
};
