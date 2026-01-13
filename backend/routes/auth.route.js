const express = require('express');
const router = express.Router();
const validate = require('./../middlewares/validate');
const { userValidation, authValidation } = require('./../validations');
const { authController } = require('./../controllers');
const { auth } = require('./../middlewares/auth');
router.post(
  '/auth/register',
  validate(userValidation.createUserSchema),
  authController.register
);

router.post(
  '/auth/login',
  validate(authValidation.loginSchema),
  authController.login
);

router.post(
  '/auth/refresh',
  validate(authValidation.refreshTokenSchema),
  authController.refreshTokens
);

router.post(
  '/auth/logout',
  auth,
  authController.logout
);

module.exports = router;