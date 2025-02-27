
const sequelize = require('../util/dbConnection');

const fs = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');

// Set up OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Function to extract text from PDF
async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error reading or parsing the PDF file:', error);
    return null;
  }
};

// Optimized function to evaluate the resume in a single GPT-4 call
async function evaluateResume(resumeText, skillsArray) {
  if (!resumeText) {
    console.error('No resume text to evaluate');
    return null;
  }

  const prompt_old = `You are analyzing a candidate's resume against a knowledge base of required skills. I’ll provide the knowledge base in CSV format with five columns:

  - **categoryName**: Main category of the skill.
  - **subCategoryName**: Specific area within the skill category.
  - **skillName**: Name of the specific skill.
  - **skillLevel**: Required proficiency level (0 to 10).
  - **skillId**: ID of the specific skill

  **Job Requirements**:
  Provide a list of specific skills needed for the job in the format "skillId, skillName, skillLevel". This list will define the skills required for the job role.

  **CSV Data**:
  ${skillsArray}

  **Step 1**: Convert each row of the CSV data into the following format: skillId, skillName, skillLevel

  **Step 2**: Use this formatted knowledge base to analyze the candidate's resume.

  **Candidate Resume**: ${resumeText}

  **Task**:
  1. **matchedSkills**: Cross-reference each skill from the **Job Requirements** with the resume to check if the candidate possesses it. If the skill is found in the resume, include it in **matchedSkills** with an assigned **numerical proficiency level (1-10)** based on their experience, projects, and certifications. Use these guidelines for proficiency levels:
    - **Advanced (9-10)**: Candidates with 5+ years of experience, leadership roles, advanced certifications, or involvement in complex projects.
    - **Intermediate (6-8)**: Candidates with 2-5 years of experience, regular use, or basic to intermediate certifications.
    - **Beginner (1-5)**: Candidates with less than 2 years of experience, minimal usage, or recent exposure.

  2. **otherSkills**: This section should include only skills found in the resume that are NOT part of the **Job Requirements**. These skills should be considered valuable but are not mandatory for the role.

  3. Ensure that **matchedSkills** account for all skills listed in the **Job Requirements**. This means:
    - Any skill from the **Job Requirements** should be in **matchedSkills** if it appears in the resume.
    - **otherSkills** should include only extra skills that are not listed in the **Job Requirements** but are found in the resume.

  **Additional Information Extraction**:
  Additionally, extract the following structured information from the resume:

    **Candidate Summary**:
    - Name
    - Email
    - Location
    - Education (list each entry with institution, degree, start date, end date, marks, location). Ensure start and end dates are in \`YYYY-MM-DD\` format.
    - Experience (list each job entry with title, company, location, start date, end date, responsibilities). Ensure start and end dates are in \`YYYY-MM-DD\` format.
    - Projects (list each project with name, technologies used, and description)
    - Accomplishments
    - Links (LinkedIn, GitHub, portfolio)

    **Evaluation Summary**:
    - Strengths
    - Areas for Improvement
    - Fit for Role
    - Achievements
    - Certificates

  **Output JSON Format**:
  {
    "matchedSkills": [
      {"skillName": "<skillName>", "skillId": "<skillId>", "proficiencyLevel": <Level_Rating>}
    ],
    "otherSkills": [
      {"skillName": "<skillName>", "proficiencyLevel": <Level_Rating>}
    ],
    "candidate_summary": {
      "name": "",
      "email": "",
      "location": "",
      "education": [
        {
          "institution": "",
          "degree": "",
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "marks": "",
          "location": ""
        }
      ],
      "experience": [
        {
          "title": "",
          "company": "",
          "location": "",
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "responsibilities": ""
        }
      ],
      "projects": [
        {
          "name": "",
          "technologies_used": [],
          "description": ""
        }
      ],
      "accomplishments": [],
      "links": {
        "linkedin": "",
        "github": "",
        "portfolio": ""
      }
    },
    "evaluation_summary": {
      "strengths": [],
      "areas_for_improvement": [],
      "fit_for_role": ""
    },
    "achievements": [],
    "certificates": []
  }
  
  Ensure the output JSON strictly follows the structure above. If values are not found, set them to null.
  `;

  const prompt = `
You are an AI data analysis assistant tasked with processing and analyzing resume data by comparing it against job-specific skills dataset.

**OBJECTIVE:**
Systematically analyze resume data and match skills against predefined job-specific skills dataset.

**SKILL MATCHING PROCESS:**
  1. Skill Matching Criteria:
    - Match skills from resume EXACTLY or CLOSELY to job-specific skills
    - Each matched skill MUST have a corresponding skillId from the job-specific skills dataset
    - Unmatched skills go into 'otherSkills' without a skillId

  2. Proficiency Level Assignment:
    - (9-10): 5+ years experience, leadership roles, advanced certifications
    - (6-8): 2-5 years experience, regular usage, intermediate certifications
    - (1-5): < 2 years experience, minimal usage, recent exposure

  3. Skill Matching Algorithm:
    - Perform case-insensitive matching
    - Consider synonyms and slight skill variations
    - Prioritize exact matches first
    - Use contextual understanding to determine skill relevance

  4. Date Formatting:
    - Convert ALL dates to YYYY-MM-DD format
    - If only year provided, use YYYY-01-01 as start/end date
    - If current working company or working till date pass end date as "Present"
    - If dates are not found, set them to null

**SKILLS DATASET STRUCTURE:**
  - categoryName: Skill category
  - subCategoryName: Skill subcategory
  - skillName: Specific skill name
  - skillLevel: Required proficiency (0-10 INTEGER)
  - skillId: Unique skill identifier

**EXTRACTION GUIDELINES:**
Extract ALL information precisely, using the specified JSON structure. If information is missing, set to null.

**Important Extraction Fields:**
A. Matched Skills
B. Other Skills
C. Candidate Summary
  - Personal Details
  - Education
  - Work Experience
  - Projects
  - Accomplishments
  - Professional Links
D. Evaluation Summary
  - Strengths
  - Improvement Areas
  - Role Fit
E. Professional Achievements
F. Certifications

**PROCESSING INSTRUCTIONS:**
1. Read resume thoroughly
2. Compare each skill against job-specific skills dataset
3. Assign proficiency levels based on experience
4. Populate JSON structure comprehensively
5. Ensure no critical information is overlooked
6. phoneNumber should be without country code

**Output JSON Format**:
{
  "matchedSkills": [
    {"skillName": "<skillName>", "skillId": "<skillId>", "proficiencyLevel": <Level_Rating>}
  ],
  "otherSkills": [
    {"skillName": "<skillName>", "proficiencyLevel": <Level_Rating>}
  ],
  "candidate_summary": {
    "name": "",
    "email": "",
    "phoneNumber": "",
    "location": {
      "address": "",
      "city": "",
      "state": "",
      "country": "",
      "postalCode": ""
    },
    "education": [
      {
        "institution": "",
        "degree": "",
        "start": "YYYY-MM-DD",
        "end": "YYYY-MM-DD",
        "marks": "",
        "location": ""
      }
    ],
    "experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "start": "YYYY-MM-DD",
        "end": "YYYY-MM-DD",
        "responsibilities": ""
      }
    ],
    "projects": [
      {
        "name": "",
        "technologies_used": [],
        "description": ""
      }
    ],
    "accomplishments": [],
    "links": {
      "linkedin": "",
      "github": "",
      "portfolio": ""
    }
  },
  "evaluation_summary": {
    "strengths": [],
    "areas_for_improvement": [],
    "fit_for_role": ""
  },
  "achievements": [],
  "certificates": []
}

**FINAL OUTPUT:**
- Provide ONLY the JSON output
- Validate JSON structure
- Ensure all nested objects and arrays are correctly formatted
- Ensure the output JSON strictly follows the structure above. If values are not found, set them to null.
  
**Job-Specific Skills Data:**
${JSON.stringify(skillsArray)}

**Candidate Resume:**
${resumeText}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.1,
    });

    const result = response.choices[0].message.content.trim();
    return result;
    // Attempt to parse JSON, handle unexpected non-JSON output
    // try {
    //   return JSON.parse(result);
    // } catch (jsonError) {
    //   console.error("The response is not in valid JSON format. Response received:", result);
    //   return null;
    // }
  } catch (error) {
    console.error('Error evaluating the resume:', error);
    return null;
  }
}

// Main function to process the resume
exports.processResume = async (resumeFilePath, jobId = null, isPdf = true) => {
  try {
    const resumeText = isPdf ? await extractTextFromPdf(resumeFilePath) : 'DOCX extraction not implemented';
    if (jobId) {
      skillsQuery = `SELECT 
      c.categoryName, sc.subCategoryName, s.skillName, 7 as skillLevel, s.skillId
    FROM job_skills js
    JOIN skills s ON s.skillId = js.skillId
    JOIN sub_category_skills scs ON scs.skillId = js.skillId
    JOIN sub_categories sc ON sc.subCategoryId = scs.subCategoryId
    JOIN category_sub_categories csc ON csc.subCategoryId = scs.subCategoryId
    JOIN categories c ON c.categoryId = csc.categoryId
    WHERE js.jobId = ${jobId}`;
    } else {
      skillsQuery = `SELECT 
      c.categoryName, sc.subCategoryName, s.skillName, 7 as skillLevel, s.skillId
    FROM skills s
    JOIN sub_category_skills scs ON scs.skillId = s.skillId
    JOIN sub_categories sc ON sc.subCategoryId = scs.subCategoryId
    JOIN category_sub_categories csc ON csc.subCategoryId = scs.subCategoryId
    JOIN categories c ON c.categoryId = csc.categoryId`;
    }

    const skillsArray = await sequelize.query(skillsQuery, { type: sequelize.QueryTypes.SELECT });

    // converting array to raw csv format
    // const headers = Object.keys(skillsArray[0]);
    // const csvRows = skillsArray.map(row =>
    //   headers.map(header => JSON.stringify(row[header] || "")).join(",")
    // );
    // const skillsRawCsv = [headers.join(","), ...csvRows].join("\n");

    if (resumeText.trim() == "") {
      console.error('Failed to extract resume text.');
      return null;
    }

    const evaluationResult = await evaluateResume(resumeText, skillsArray);
    if (evaluationResult) {
      return evaluationResult;
    } else {
      console.log('Failed to evaluate the resume.');
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
