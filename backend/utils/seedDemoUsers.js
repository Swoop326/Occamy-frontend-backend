const User = require("../models/User");

const seedDemoUsers = async () => {

    try{

        const adminExists = await User.findOne({
            phone:"9999999999"
        });

        if(!adminExists){

            await User.create({
                name:"Demo Admin",
                phone:"9999999999",
                aadhaar:"111122223333",
                role:"admin",
                loginAllowed:true
            });

            console.log("✅ Demo Admin Created");
        }



        const distributorExists = await User.findOne({
            phone:"8888888888"
        });

        if(!distributorExists){

            await User.create({
                name:"Demo Distributor",
                phone:"8888888888",
                aadhaar:"444455556666",
                role:"distributor",
                distributorCode:"DIST1001",
                state:"Maharashtra",
                district:"Pune",
                loginAllowed:true
            });

            console.log("✅ Demo Distributor Created");
        }

    }catch(err){
        console.log("Seeder error:", err.message);
    }

};

module.exports = seedDemoUsers;