import { createRequire } from "module";
import {
  generateInterviewData,
  generateResumePdf,
} from "../services/ai.service.js";
import Interview from "../models/interview.model.js";
import { ConsoleMessage } from "puppeteer";
const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");

/**
 * @description generate report on the basis of job description and resume or self-description
 */
export const generateInterviewReport = async (req, res) => {
  try {
    const resume = req.file;

    const { selfDescription="", jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

     if(!jobDescription){
          return res.status(400).json({
            success: false,
            message: "jobDescription is required",
          });
     }


     if (resume.mimetype !== "application/pdf") {
       return res.status(400).json({
         success: false,
         message: "Only PDF resumes are allowed",
       });
     } 
    const resumeData = await pdfParse(resume.buffer);

    let resumeText = resumeData.text;

    resumeText = resumeText
      .replace(/[^\x00-\x7F\n]/g, "") // remove weird pdf chars
      .replace(/\r/g, "")
      .replace(/\n{2,}/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/(\+?\d[\d-]{8,})/g, " $1 ") // isolate phone numbers
      .replace(/([A-Za-z])\|([A-Za-z])/g, "$1 $2")
      .trim();

    const interviewReportByAI = await generateInterviewData({
      resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewData = await Interview.create({
      resume: resumeText,
      selfDescription,
      jobDescription,
      user: req?.user?.id,
      ...interviewReportByAI,
    });

    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      data: interviewData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create interview report",
    });
  }
};

export const getInterviewReportById = async (req, res) => {
  const { interviewId } = req.params;

  const interviewReport = await Interview.findOne({
    _id: interviewId,
    user: req?.user?.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
};

export const getAllInterviewReports = async (req, res) => {
  const interviewReports = await Interview.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
};

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
export const generateResumeInPdf = async (req, res) => {
  const { interviewReportId } = req.params;
  const interviewReport = await Interview.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  // console.log(pdfBuffer)
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  return res.send(pdfBuffer);
};

export const deleteReport = async (req, res) => {
  try {
    const { interviewId } = req.params;


    if(!interviewId){
        return res.status(400).json({
          message:"interviewId required"
        })
    }

    const interviewReport = await Interview.findOne({
      _id: interviewId,
      user: req.user?.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    await Interview.deleteOne({
      _id: interviewId,
      user: req.user?.id,
    });

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting report",
    });
  }
};