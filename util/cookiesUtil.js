const cookie = require('cookie');

const options = {
  secure: true,
  sameSite: 'None',
  httpOnly: true,
  path: '/'
};

exports.setCookies = (res, cookies) => {
  const { accessToken, refreshToken, sessionToken } = cookies;
  res.setHeader('Set-Cookie', [
    cookie.serialize('jc_at', accessToken, { ...options, maxAge: process.env.ACCESS_TOKEN_EXPIRY }),
    cookie.serialize('jc_rt', refreshToken, { ...options, maxAge: process.env.REFRESH_TOKEN_EXPIRY }),
    cookie.serialize('s_id', sessionToken, { ...options, maxAge: process.env.SESSION_TOKEN_EXPIRY }),
  ]);
}

exports.getCookies = (req) => {
  if (!req.headers.cookie) {
    return {};
  }
  return cookie.parse(req.headers.cookie);
}

exports.unsetCookies = (res, cookieNames) => {
  for (let cookieName of cookieNames) {
    res.clearCookie(cookieName, options);
  };
}