import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Authorize by role (Admin, Cashier, Supplier, Customer)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Authorize by userType (employee, supplier, customer)
export const authorizeUserType = (...types) => {
  return (req, res, next) => {
    if (!req.user || !types.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Access denied. Wrong portal.' });
    }
    next();
  };
};

// Authorize employee subroles (Admin, Cashier)
export const authorizeEmployee = (...roles) => {
  return (req, res, next) => {
    if (!req.user || req.user.userType !== 'employee' || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Employee role required.' });
    }
    next();
  };
};
