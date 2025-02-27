const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const xapiDatasets = db.define("xapi_datasets", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true,
    },
    data: {
        type: sequelize.JSON,
        allowNull: true,
    }
});

module.exports = xapiDatasets;
