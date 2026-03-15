import {Router} from 'express'
import
 {
   deleteReport,
  generateInterviewReport,
  generateResumeInPdf,
  getAllInterviewReports,
  getInterviewReportById,
} from "../controllers/interview.controller.js";
import { authMiddleware } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';


const router =Router();


//✅
router.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  generateInterviewReport,
);


//✅
  router.post(
    "/resume/pdf/:interviewReportId",
    authMiddleware,
    generateResumeInPdf,
  );

  
//✅
router.get(
      "/report/:interviewId",
      authMiddleware, 
      getInterviewReportById);


//✅
router.delete
  ("/report/:interviewId", 
    authMiddleware, 
    deleteReport);



//✅
router.get(
      "/",
      authMiddleware,
      getAllInterviewReports);




export default router;