const Razorpay = require('razorpay');
const razorPayKeyId = process.env.RAZOR_PAY_KEY_ID;
const razorPayKeySecret = process.env.RAZOR_PAY_KEY_SECRET;
const hostUrl = process.env.WEB_HOST_URL;

exports.createPaymentLink = async (amount, description, userName, userEmail, userPhoneNumber, paymentFor) => {
    try {
        const instance = new Razorpay({ key_id: razorPayKeyId, key_secret: razorPayKeySecret });

        const response = await instance.paymentLink.create({
            amount: amount, // in paise
            currency: "INR",
            // accept_partial: false,
            // first_min_partial_amount: amount,
            description: description,
            customer: {
                name: userName,
                email: userEmail,
                contact: userPhoneNumber // with country code +919848012345
            },
            notify: { // sends payment link in email & sms to user
                sms: false,
                email: false
            },
            // expire_by: 146736479267, // Timestamp, in Unix, at which the Payment Link will expire
            reminder_enable: false,
            notes: {
                paymentFor: paymentFor
            },
            callback_url: hostUrl + "app/buy-assessment",
            callback_method: "get"
        });

        return response;
    } catch (error) {
        console.log(error);
        return error;
    }
};
