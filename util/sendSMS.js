const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGE_SERVICE_SID;

const client = require('twilio')(accountSid, authToken);

exports.sendSMS = async (phoneNumber, message) => {
    return client.messages.create({
        body: message,
        messagingServiceSid: messagingServiceSid,
        to: phoneNumber,
    });
}
