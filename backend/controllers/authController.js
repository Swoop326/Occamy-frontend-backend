const Otp = require("../models/Otp");
const User = require("../models/User");
const generateToken = require("../services/jwt");
const sendSMS = require("../services/smsService");



/*
=====================================
✅ SEND OTP
=====================================
*/
exports.sendOtp = async (req, res) => {
    try {
        const data = req.body; // Access the parsed body data
        console.log('Received data:', data);

        let { mobile, distributorCode } = req.body;

        if (!mobile) {
            return res.status(400).json({
                message: "Mobile number is required"
            });
        }

        // ✅ Normalize mobile
        mobile = mobile.replace(/\D/g, "");

        // ✅ Normalize distributorCode
        if (distributorCode) {
            distributorCode = distributorCode.toUpperCase();
        }

        let user;

        // 🔥 Distributor login
        if (distributorCode) {

            user = await User.findOne({
                mobile,
                distributorCode
            });

        } 
        // 🔥 Admin login
        else {
            const data = req.body; // Access the parsed body data
            console.log('Received data:', data);

            user = await User.findOne({
                mobile,
                role: "admin"
            });

        }

        if (!user) {
            return res.status(404).json({
                message: "User not registered. Contact admin."
            });
        }

        if (!user.loginAllowed) {
            return res.status(403).json({
                message: "Login blocked. Contact admin."
            });
        }

        /*
=====================================
 JUDGE BYPASS LOGIN
=====================================
*/

        const judgeNumbers = ["9999999999", "8888888888"];

        if (judgeNumbers.includes(mobile)) {

        console.log("JUDGE LOGIN OTP: 111111");

        return res.json({
        message: "OTP sent successfully",
        demoOtp: "111111"
    });
}


        /*
        =====================================
        🔥 30 SECOND COOLDOWN
        =====================================
        */

        const existingOtp = await Otp.findOne({ mobile });

        if (existingOtp) {

            const secondsSinceLastOtp =
                (Date.now() - existingOtp.createdAt.getTime()) / 1000;

            if (secondsSinceLastOtp < 30) {

                return res.status(429).json({
                    message: `Please wait ${Math.ceil(30 - secondsSinceLastOtp)} seconds before requesting another OTP`
                });

            }

            // delete old OTP
            await Otp.deleteOne({ _id: existingOtp._id });
        }



        // ✅ Generate OTP
        const otpCode =
            Math.floor(100000 + Math.random() * 900000).toString();


        await Otp.create({
            mobile,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 min
        });



        /*
        =====================================
        ✅ SEND SMS
        =====================================
        */
        try {

            await sendSMS(
                mobile,
                `Your Occamy OTP is ${otpCode}`
            );

        } catch (smsError) {

            console.log("SMS FAILED:", smsError.message);

            // Don't block login if SMS fails
        }


        // ⭐ Debug fallback (remove before production)
        console.log("OTP:", otpCode);


        res.json({
            message: "OTP sent successfully"
        });

    } catch (err) {

        console.log("SEND OTP ERROR:", err.message);

        res.status(500).json({
            message: "Failed to send OTP",
            error: err.message
        });
    }
};





/*
=====================================
✅ VERIFY OTP
=====================================
*/
exports.verifyOtp = async (req, res) => {
    try {

        let { mobile, distributorCode, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                message: "Mobile and OTP required"
            });
        }

        mobile = mobile.replace(/\D/g, "");

        /*
=====================================
🔥 JUDGE BYPASS LOGIN
=====================================
*/

const judgeNumbers = ["9999999999", "8888888888"];

if (judgeNumbers.includes(mobile) && otp === "111111") {

    let user;

    // Distributor login
    if (distributorCode) {
        user = await User.findOne({
            mobile,
            distributorCode
        });
    } 
    // Admin login
    else {
        user = await User.findOne({
            mobile,
            role: "admin"
        });
    }

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (!user.loginAllowed) {
        return res.status(403).json({
            message: "Login blocked"
        });
    }

    const token = generateToken(user);

    return res.json({
        message: "Login successful ✅",
        token,
        role: user.role,
        userId: user._id,
        name: user.name
    });
}

        if (distributorCode) {
            distributorCode = distributorCode.toUpperCase();
        }

        const record = await Otp.findOne({ mobile, otp });

        if (!record || record.expiresAt < new Date()) {

            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        let user;

        // Distributor login
        if (distributorCode) {

            user = await User.findOne({
                mobile,
                distributorCode
            });

        } 
        else {

            user = await User.findOne({
                mobile,
                role: "admin"
            });

        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.loginAllowed) {
            return res.status(403).json({
                message: "Login blocked. Contact admin."
            });
        }


        // ✅ Delete used OTP
        await Otp.deleteOne({ _id: record._id });


        const token = generateToken(user);


        res.json({
            message: "Login successful ✅",
            token,
            role: user.role,
            userId: user._id,
            name: user.name
        });

    } catch (err) {

        console.log("VERIFY OTP ERROR:", err.message);

        res.status(500).json({
            message: "OTP verification failed",
            error: err.message
        });
    }
};
