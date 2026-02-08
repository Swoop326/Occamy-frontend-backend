const User = require("../models/User");
const sendDistributorSMS = require("../services/smsService");
const AssignedVisit = require("../models/AssignedVisit");
const Notification = require("../models/Notification");
const WorkSession = require("../models/WorkSession");
const axios = require("axios");
const geocoder = require("../config/geocoder");
const { geocodeVillage }  = require("../services/geocodeService");

// Generate Distributor Code
const generateDistributorCode = async () => {

    let isUnique = false;
    let distributorCode;

    while (!isUnique) {

        const random = Math.floor(1000 + Math.random() * 9000);
        distributorCode = `DIST${random}`;

        const existing = await User.findOne({ distributorCode });

        if (!existing) {
            isUnique = true;
        }
    }

    return distributorCode;
};

exports.createDistributor = async (req, res) => {
    try {
        const data = req.body; // Access the parsed body data
        console.log('Received data:', data);


        const { name, mobile, state, district, aadhaar } = req.body;

        if (!name || !mobile || !aadhaar) {
            return res.status(400).json({
                message: "Name, mobile and Aadhaar are required"
            });
        }

        // Normalize mobile
        const cleanMobile = mobile.replace(/\D/g, "");

        // Prevent duplicate mobile
        const mobileExists = await User.findOne({ mobile: cleanMobile });

        if (mobileExists) {
            return res.status(400).json({
                message: "Mobile already registered"
            });
        }

        const distributorCode = await generateDistributorCode();

        const distributor = await User.create({
            name,
            mobile: cleanMobile,
            aadhaar,
            role: "distributor",
            distributorCode,
            state,
            district,
            loginAllowed: true
        });

        /*
        ==========================
        SEND AUTO SMS
        ==========================
        */
        try {

            await sendDistributorSMS(
                cleanMobile,
                `Welcome to Occamy 🎉

Your Distributor ID is ${distributorCode}

Use this ID with OTP to login.`
            );

        } catch (smsErr) {

            console.log("Distributor SMS failed:", smsErr.message);

            // NEVER fail creation because of SMS
        }

        res.status(201).json({
            message: "Distributor created successfully ✅",
            distributor
        });

    } catch (err) {

        // Handle duplicate Aadhaar error nicely
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Aadhaar already registered"
            });
        }

        res.status(500).json({
            error: err.message
        });
    }
};

exports.removeDistributor = async (req,res)=>{
   try{
        const data = req.body; // Access the parsed body data
        console.log('Received data:', data);


      const { distributorCode } = req.body;

      if(!distributorCode){
         return res.status(400).json({
            message:"Distributor ID required"
         });
      }

      const distributor = await User.findOneAndUpdate(
         { distributorCode, role:"distributor" },
         { loginAllowed:false },
         { new:true }
      );

      if(!distributor){
         return res.status(404).json({
            message:"Distributor not found"
         });
      }

      res.json({
         message:"Distributor removed successfully"
      });

   }catch(err){
      res.status(500).json({error:err.message});
   }
};

exports.getAllDistributors = async (req, res) => {
    try {

        const distributors = await User.find({
            role: "distributor"
        })
        .select("name distributorCode state district loginAllowed")
        .lean();


        // ⭐ Only check active sessions
        const activeSessions = await WorkSession.find({
            isActive: true
        }).select("distributorId");


        const activeIds = new Set(
            activeSessions.map(s => s.distributorId.toString())
        );


        const result = distributors.map(d => ({
            ...d,
            active: activeIds.has(d._id.toString())
        }));


        res.json(result);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.getDashboardStats = async (req,res)=>{
    try{

        const totalDistributors = await User.countDocuments({
            role:"distributor",
            loginAllowed:true
        });

        res.json({
            totalDistributors
        });

    }catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.assignVisit = async (req,res)=>{
    try{

        console.log("Received data:", req.body);

        let {
            distributorCode,
            village,
            notes,
            visitDate
        } = req.body;


        /*
        ==============================
        ✅ BASIC VALIDATION
        ==============================
        */

        if(!distributorCode || !village || !visitDate){
            return res.status(400).json({
                message:"Distributor, village and visit date required"
            });
        }


        /*
        ==============================
        ✅ NORMALIZE ADDRESS
        ==============================
        */

        village = village.trim().replace(/\s*,\s*/g, ",");

        // Automatically append India if missing
        const fullAddress = village.toLowerCase().includes("india")
            ? village
            : `${village}, India`;

        console.log("Geocoding:", fullAddress);



        /*
        ==============================
        ✅ DATE VALIDATION
        ==============================
        */

        const visitTime = new Date(visitDate);

        if(isNaN(visitTime.getTime())){
            return res.status(400).json({
                message:"Invalid date format"
            });
        }

        // prevent past visits (1 min buffer)
        const now = new Date(Date.now() - 60000);

        if(visitTime < now){
            return res.status(400).json({
                message:"Cannot assign visits in the past"
            });
        }



        /*
        ==============================
        ✅ FIND DISTRIBUTOR FIRST
        (Never waste geocode calls)
        ==============================
        */

        const distributor = await User.findOne({
            distributorCode,
            role:"distributor",
            loginAllowed:true
        });

        if(!distributor){
            return res.status(404).json({
                message:"Distributor not found"
            });
        }



        /*
        ==============================
        🌍 OPEN STREET MAP GEOCODING
        ==============================
        */

        const geo = await geocodeVillage(fullAddress);

        console.log("GEO RESULT:", geo);

        if(!geo){
            return res.status(400).json({
                message:"Invalid village/location"
            });
        }



        /*
        ==============================
        ✅ CREATE VISIT (GEOJSON)
        ==============================
        */

        const visit = await AssignedVisit.create({

            distributorId: distributor._id,
            distributorCode,

            village: geo.displayName, // canonical address
            notes,
            visitDate: visitTime,

            location:{
                type:"Point",
                coordinates:[geo.longitude, geo.latitude] // ALWAYS lng,lat
            }
        });



        /*
        ==============================
        ✅ CREATE NOTIFICATION
        ==============================
        */

        const formattedDate = visitTime.toLocaleDateString("en-IN", {
            day:"numeric",
            month:"short",
            year:"numeric"
        });

        const formattedTime = visitTime.toLocaleTimeString("en-IN",{
            hour:"2-digit",
            minute:"2-digit"
        });

        await Notification.create({
            userId: distributor._id,
            title:"New Visit Assigned 📍",
            message:`Visit at ${geo.displayName} on ${formattedDate} at ${formattedTime}`,
            type:"visit_assigned",
            meta:{
                village: geo.displayName,
                visitDate,
                distributorCode
            }
        });



        /*
        ==============================
        ✅ SEND RESPONSE LAST
        ==============================
        */

        res.status(201).json({
            message:"Visit assigned successfully ✅",
            visit
        });

    }catch(err){

        console.log("ASSIGN VISIT ERROR:", err);

        res.status(500).json({
            error:err.message
        });
    }
};



exports.searchDistributors = async (req, res) => {
    try {

        const { query } = req.query;

        // If nothing typed → return empty
        if (!query) {
            return res.json([]);
        }

        const distributors = await User.find({
            role: "distributor",
            $or: [
                { distributorCode: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        })
        .select("name distributorCode")
        .limit(10);

        res.json(distributors);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.getActiveDistributorCount = async (req,res)=>{
    try{

        const WorkSession = require("../models/WorkSession");

        const active = await WorkSession.countDocuments({
            endTime:null
        });

        res.json({
            activeDistributors: active
        });

    }catch(err){
        res.status(500).json({error:err.message});
    }
};