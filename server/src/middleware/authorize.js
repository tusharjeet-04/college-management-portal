import ApiError from '../utils/ApiError.js';

/* Restricts a route to one or more roles. Use after `auth`. */
export default function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (roles.length && !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}
