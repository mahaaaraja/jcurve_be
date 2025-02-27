const userRoutes = require("./user");
const adminRoutes = require("./admin");
const hrRoutes = require("./hr");
// const jobsRoutes = require("./jobs");
const authRoutes = require("./auth");
const studentRoutes = require("./student");
const paymentRoutes = require('./payment');
const smeRoutes = require("./sme");
// const metricRoutes = require('./metrics');

function inroutes(app) {
  app.use("/api/v1", userRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/hr", hrRoutes);
  app.use("/api/v1/sme", smeRoutes);
  // app.use("/api/v1", jobsRoutes);
  app.use("/api/v1", authRoutes);
  app.use("/api/v1", studentRoutes);
  app.use("/api/v1/payment", paymentRoutes);
  // app.use("/api/v1/metric", metricRoutes);
}

module.exports = inroutes;
