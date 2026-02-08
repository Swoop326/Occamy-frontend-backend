const AssignedVisit = require("../models/AssignedVisit");
const User = require("../models/User");


// ✅ DISTRIBUTOR STATS
exports.getDistributorStats = async (req,res)=>{
    try{

        const distributorId = req.user.id;

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);

        const todaysVisits = await AssignedVisit.countDocuments({
            distributorId,
            visitDate:{
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        const completed = await AssignedVisit.countDocuments({
            distributorId,
            status:"completed",
            visitDate:{
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        const pending = todaysVisits - completed;

        res.json({
            todaysVisits,
            completed,
            pending
        });

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};



// ✅ DISTRIBUTOR PROFILE
exports.getDistributorProfile = async (req,res)=>{
    try{

        const distributorId = req.user.id;

        const distributor = await User.findById(distributorId)
        .select("name distributorCode mobile state district");

        if(!distributor){
            return res.status(404).json({
                message:"Distributor not found"
            });
        }

        res.json(distributor);

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};



// ✅ TODAY'S ASSIGNED VISITS
exports.getAssignedVisits = async (req,res)=>{
    try{

        const distributorId = req.user.id;

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);

        const visits = await AssignedVisit.find({
            distributorId,
            status:"pending",
            visitDate:{
                $gte: todayStart,
                $lte: todayEnd
            }
        }).sort({visitDateDate:1});

        res.json(visits);

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};



// ✅ OVERDUE VISITS
exports.getOverdueVisits = async (req,res)=>{
    try{

        const distributorId = req.user.id;

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const overdue = await AssignedVisit.find({
            distributorId,
            status:"pending",
            visitDate:{ $lt: todayStart }
        }).sort({visitDate:1});

        res.json(overdue);

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};

exports.getUpcomingVisits = async (req,res)=>{
    try{

        const distributorId = req.user.id;

        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);

        const upcoming = await AssignedVisit.find({
            distributorId,
            status:"pending",
            visitDate:{ $gt: todayEnd }
        }).sort({visitDate:1});

        res.json(upcoming);

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};

const FieldVisit = require("../models/FieldVisit");

exports.getVisitHistory = async (req, res) => {
    try {

        const distributorId = req.user.id;

        const history = await FieldVisit.find({
            distributorId
        })
        .sort({ createdAt: -1 }) // newest first
        .select("-__v"); // cleaner response

        res.json(history);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};

exports.getMapVisits = async (req, res) => {
    try {

        const distributorId = req.user.id;

        const visits = await AssignedVisit.find({
            distributorId,
            status: "pending"
        }).select("village visitDate location");

        res.json(visits);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

