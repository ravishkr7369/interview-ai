import Groq from "groq-sdk";
import { z } from "zod";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.coerce.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),

  title: z.string(),
});

export const generateInterviewData = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const prompt = `
	You are an expert technical interviewer and career coach.

	Analyze the candidate Resume, Self Description and Job Description and generate a structured interview preparation report.

	Resume:
	${resume}

	Self Description:
	${selfDescription}

	Job Description:
	${jobDescription}

		Instructions:
	- The resume text may contain formatting inconsistencies from PDF extraction.
	- Technologies like JavaScript, MongoDB, GitHub, or email addresses may appear incorrectly spaced.
	- Interpret the structure and identify sections like SUMMARY, EDUCATION, SKILLS, PROJECTS and EXPERIENCE.
	- Focus on extracting technologies, skills and project experience.
	- Give a realistic match score between 0 and 100.
	- Generate exactly 5 technical interview questions related to the job description.
	- Generate exactly 5 behavioral interview questions.
	- Each question must include a short sample answer.
	- Identify exactly 5 skill gaps.
	- Create a 7 day interview preparation plan.
	- Each day must contain exactly 3 tasks.

	Return ONLY JSON in this format:

	{
	"matchScore": number,
	"technicalQuestions":[
	{"question":"string","intention":"string","answer":"string"}
	],
	"behavioralQuestions":[
	{"question":"string","intention":"string","answer":"string"}
	],
	"skillGaps":[
	{"skill":"string","severity":"low | medium | high"}
	],
	"preparationPlan":[
	{"day":1,"focus":"string","tasks":["string","string","string"]}
	],
	"title":"string"
	}

	Rules:
	- Output must be valid JSON
	- Do not include explanations
	- Do not include markdown
	- Do not include any text outside JSON
	`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const clean = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = clean.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("AI did not return valid JSON");
  }

  const json = JSON.parse(match[0]);

  const validated = interviewReportSchema.safeParse(json);

  if (!validated.success) {
    console.log(validated.error.issues);
    throw new Error("AI returned invalid structure");
  }

  return validated.data;
};

export const generatePdfFromHtml = async (htmlContent) => {
const isProduction = process.env.NODE_ENV === "production";

const browser = isProduction
  ? await puppeteerCore.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  : await puppeteer.launch({
      headless: "new",
    });

  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "10mm",
      right: "10mm",
    },
  });

  await browser.close();

  return pdfBuffer;
};

export const generateResumePdf = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate a professional ATS-friendly resume using the following details.

  Candidate Resume Data:
  ${resume}

  Self Description:
  ${selfDescription}

  Job Description:
  ${jobDescription}

  Instructions:

  Return ONLY a valid JSON object with a single field:
  {
  "html": "complete HTML resume"
  }

  Resume Requirements:
  • Extract the candidate name from the resume text.
  • If name is not clearly available, infer it from email or LinkedIn.
• The candidate name must appear at the very top in large bold text.

  • The HTML should be a clean, professional resume layout suitable for PDF printing.
  • Use a single column layout.
  • Contact information must appear at the top.
  • Pure white background
• No watermark
• No background colors
• No borders around page
  • Use clear section headings such as:
	- Summary
	- Skills
	- Projects
	- Experience
	- Education
	- Certifications
  • Skills should be grouped logically.
  • Projects should include bullet points describing achievements.
  • The design should be simple, modern, and ATS-friendly.
  • Use minimal colors and professional typography.
  • The resume should ideally fit within 1 page when converted to PDF.
  • Do NOT include the job description section in the final resume.
  • Do NOT include explanations or text outside the JSON response.
  • Return only the JSON object.
  `;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;

  const jsonContent = JSON.parse(content);
  const validated = resumePdfSchema.safeParse(jsonContent);

  if (!validated.success) {
    console.log(validated.error.issues);
    throw new Error("AI returned invalid structure");
  }

  const pdfBuffer = await generatePdfFromHtml(validated.data.html);
  return pdfBuffer;
};
