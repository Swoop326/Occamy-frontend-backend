const FieldVisit = require("../models/FieldVisit");
const User = require("../models/User");
const WorkSession = require("../models/WorkSession");

exports.getDashboardStats = async (req,res)=>{
    try{

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);


        /*
        ========================
        TOTAL DISTRIBUTORS
        ========================
        */

        const totalDistributors = await User.countDocuments({
            role:"distributor",
            loginAllowed:true
        });


        /*
        ========================
        ACTIVE DISTRIBUTORS 🔥🔥🔥
        ========================
        */

        const activeDistributors = await WorkSession.countDocuments({
            isActive:true
        });


        /*
        ========================
        MEETINGS TODAY ⭐⭐⭐⭐⭐
        ========================
        */

        const meetingsToday = await FieldVisit.countDocuments({
            createdAt:{
                $gte: todayStart,
                $lte: todayEnd
            }
        });


        /*
        ========================
        B2B + B2C SALES
        ========================
        */

        const sales = await FieldVisit.aggregate([
            {
                $match:{
                    saleType:{ $in:["B2B","B2C"] },
                    createdAt:{
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                }
            },
            {
                $group:{
                    _id:"$saleType",
                    totalQuantity:{ $sum:"$quantity" }
                }
            }
        ]);

        let b2bSales = 0;
        let b2cSales = 0;

        sales.forEach(s=>{
            if(s._id === "B2B") b2bSales = s.totalQuantity;
            if(s._id === "B2C") b2cSales = s.totalQuantity;
        });


        /*
        ========================
        RESPONSE
        ========================
        */

        res.json({
            totalDistributors,
            activeDistributors,
            meetingsToday,
            b2bSales,
            b2cSales
        });

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};