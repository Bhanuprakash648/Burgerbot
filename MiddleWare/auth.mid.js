import pkg from 'jsonwebtoken';

export default (req, res, next) => {
  const token = req.headers.access_token;
  const verify= pkg
  if (!token) return res.status(404).send();

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    res.status(404).send();
  }

  return next();
};