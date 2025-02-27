const userActivityLog = require('../models/userActivityLogs');
const { getCookies } = require('./cookiesUtil');
const { verifyAuthToken, verifyHR } = require('./middlewares');
const { verifyToken } = require("../util/jwtTokens.js");

exports.handleAuthAndUserActivity = async (req, res, next) => {
  try {
    const cookies = getCookies(req);
    const jc_rt = cookies?.jc_rt;
    if (jc_rt) {
      let refreshTokenDecoded = verifyToken(jc_rt, process.env.REFRESH_TOKEN_SECRET);
          
      if (refreshTokenDecoded.err) {
        return res.status(401).json({ status: false, message: refreshTokenDecoded.err, });
      }
      
      const userId = refreshTokenDecoded?.decodedValue?.userId;
      if (userId) {
        await userActivityLog.create({
          userId: userId,
          path: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown'
        });
      }
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      return verifyHR(req, res, async () => {
        try {
          if (req.userId) {
            await userActivityLog.create({
              userId: req.userId,
              path: req.originalUrl,
              method: req.method,
              userAgent: req.headers['user-agent'] || 'Unknown',
              ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown'
            });
          }
        } catch (error) {
          console.log('Error logging user activity:', error);
        }
        next();
      });
    } 
    next();
  } catch(error) {
    console.error("Error logging user activity: ", error);
  }
};