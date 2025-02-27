const ApiError = require('./errors')

function apiErrorHandler(err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.code).json({ status: false, message: err.message });
    } else {
        if (err.type == "entity.parse.failed") {
            return res.status(422).json({ status: false, message: "Unable to parse the parameters. Please pass the parameters in valid format." });
        } else {
            console.log(err);
            return res.status(500).json({ status: false, message: "Internal server error" });
        }
    }
}

module.exports = apiErrorHandler;