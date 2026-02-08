const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
},{
    timestamps:true // ⭐ required for cooldown
});


// ⭐ AUTO DELETE EXPIRED OTP
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("Otp", otpSchema);
