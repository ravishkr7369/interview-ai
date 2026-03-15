import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();


/**
 @route POST /api/auth/register
 @desc Register a new user and return token in cookie
 @access Public
 */
router.post('/register',register);


/**
 @route POST /api/auth/login
 @desc Login user with email and password and return token in cookie
 @access Public
 */
router.post('/login',login);



/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
router.get('/logout',logout);



/** 
 * @route GET /api/auth/profile
 * @description get user profile
 * @access private
 */
router.get('/profile',authMiddleware,getProfile);

export default router;