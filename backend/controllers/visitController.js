const AssignedVisit = require("../models/AssignedVisit");

exports.createVisit = async (req, res) => {
    try {
        console.log("CONTENT TYPE:", req.headers['content-type']);

        const data = req.body; // Access the parsed body data
        console.log('Received data:', data);
        console.log(req.body);
        console.log(req.file);

        const distributorId = req.user.id; // from auth middleware

        const {
            type,
            name,
            village,
            attendees,
            category,
            businessPotential,
            notes,
            photoUrl,
            lat,
            lng
        } = req.body;

        if (!type) {
            return res.status(400).json({
                message: "Visit type is required"
            });
        }

        const visit = await Visit.create({
            distributorId,
            type,
            name,
            village,
            attendees,
            category,
            businessPotential,
            notes,
            photoUrl,
            location: {
                lat,
                lng
            }
        });

        res.status(201).json({
            message: "Visit logged successfully ✅",
            visit
        });

    } catch (err) {

        console.log("CREATE VISIT ERROR:", err.message);

        res.status(500).json({
            error: err.message
        });
    }
};

exports.completeVisit = async (req,res)=>{
    try{

        const distributorId = req.user.id;
        const visitId = req.params.id;

        const visit = await AssignedVisit.findOneAndUpdate(
            {
                _id: visitId,
                distributorId
            },
            {
                status:"completed",
                completedAt: new Date()
            },
            {new:true}
        );

        if(!visit){
            return res.status(404).json({
                message:"Visit not found"
            });
        }

        res.json({
            message:"Visit marked completed ✅"
        });

    }catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};