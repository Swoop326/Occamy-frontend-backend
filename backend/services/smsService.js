const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
);

const sendSMS = async (mobile, messageBody) => {

    try {

        const message = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE,
            to: `+91${mobile}`
        });

        console.log("SMS SID:", message.sid);

    } catch (error) {

        console.log("TWILIO ERROR:", error.message);
        throw error;
    }
};

module.exports = sendSMS;
