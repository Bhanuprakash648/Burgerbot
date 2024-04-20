import authMid from './auth.mid.js';
const adminMid = (req, res, next) => {
  console.log("bhanu prakash")
  if (!req.user.isAdmin) res.status(400).send();

  return next();
};

export default [authMid, adminMid];