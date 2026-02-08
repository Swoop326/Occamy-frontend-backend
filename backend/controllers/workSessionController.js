const WorkSession = require("../models/WorkSession");


// ✅ START FIELD WORK
exports.startWork = async(req,res)=>{
    try{

        const distributorId = req.user.id;

        const existing = await WorkSession.findOne({
            distributorId,
            isActive:true
        });

        if(existing){
            return res.status(400).json({
                message:"Work already started"
            });
        }

        await WorkSession.create({
            distributorId,
            startTime:new Date(),
            isActive:true     // ⭐ FORCE SAVE
        });

        res.json({
            message:"Field work started ✅"
        });

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};



// ✅ END FIELD WORK
exports.endWork = async(req,res)=>{
    try{

        const distributorId = req.user.id;

        const session = await WorkSession.findOneAndUpdate(
            {
                distributorId,
                isActive:true
            },
            {
                isActive:false,
                endTime:new Date()
            },
            {new:true}
        );

        if(!session){
            return res.status(400).json({
                message:"No active session found"
            });
        }

        res.json({
            message:"Field work ended ✅"
        });

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};



// ✅ CHECK STATUS (Toggle UI)
exports.getWorkStatus = async (req, res) => {
    try {

        const distributorId = req.user.id;

        const activeSession = await WorkSession.exists({
            distributorId,
            isActive: true
        });

        res.json({
            active: !!activeSession
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};