const axios = require("axios");

const geocodeVillage = async(address)=>{
    try{

        const res = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params:{
                    q: address,
                    format:"json",
                    limit:1
                },
                headers:{
                    "User-Agent":"occamy-app"
                }
            }
        );

        if(!res.data.length) return null;

        const place = res.data[0];

        return {
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
            displayName: place.display_name
        };

    }catch(err){
        console.log("GEOCODE ERROR:", err.message);
        return null;
    }
};

module.exports = { geocodeVillage }; // ⭐ DO THIS