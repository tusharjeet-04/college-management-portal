import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/* Runs express-validator chains and throws a 400 with details on failure. */
export default function validate(validations) {
  return async (req, _res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw ApiError.badRequest('Validation failed', details);
  };
}
