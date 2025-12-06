import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Model selection based on task
const MODELS = {
  questionGeneration: 'gpt-4-1106-preview', // GPT-4.1 equivalent
  questionVerification: 'gpt-4o-mini',
  solutionGeneration: 'gpt-4-1106-preview',
  solutionVerification: 'gpt-4o-mini',
  explanation: 'gpt-4o',
  answerReview: 'gpt-4o',
  marksFeedback: 'gpt-4o'
};

/**
 * Extract questions from PDF text
 */
export async function extractQuestionsFromPDF(pdfText, metadata = {}) {
  const prompt = `You are an expert Cambridge/Pearson EDEXCEL examiner AI.

You will be given the raw extracted text of a **Questions PDF only**.  

Your task is to extract ALL exam questions in clean structured order.

FORMAT AND BEHAVIOR RULES:
- Many exams contain subparts (1a, 1b, 1c). Keep them grouped under a single question number.
- Include **all diagrams**, describing them in text if OCR cannot extract them.
- Return ALL math in pure LaTeX inside markdown (use $...$ for inline, $$...$$ for block).
- Do NOT invent answers.
- Do NOT try to assign marks yet (marks come from the markscheme PDF, processed separately).
- Do NOT skip table/graph content. Convert them into LaTeX/table text representations.

OUTPUT JSON FORMAT (STRICT):
[
  {
    "questionNumber": "1",
    "subparts": [
      { "label": "a", "questionText": "..." },
      { "label": "b", "questionText": "..." }
    ],
    "fullQuestionText": "Combined readable version of the whole question."
  }
]

REQUIREMENTS:
- fullQuestionText should be a friendly combined text so teachers can search easily.
- questionText may include images, written as: "images": ["image1.png", "image2.png"]
- Ensure perfect LaTeX formatting for all math.
- Preserve original numbering, spacing, sub-questions, and structure.
- Ignore headers, footers, page numbers, and noise.
- Only return real questions.

PDF TEXT:
${pdfText}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.questions || parsed };
  } catch (error) {
    console.error('Error extracting questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract markscheme from PDF text
 */
export async function extractMarkschemeFromPDF(pdfText, metadata = {}) {
  const prompt = `You are an expert Cambridge/Pearson examiner AI.

You will be given OCR text from a **Markscheme PDF only**.

Your task:
- Extract answers AND mark allocations
- Map them to the corresponding question number and sub-question letter (1a, 1b, 2c, …)
- Output clean LaTeX-formatted answers
- Include examiner notes if present ("accept", "reject", "BOD", etc.)

OUTPUT STRICT JSON FORMAT:
{
  "answers": [
    {
      "questionNumber": "1",
      "subparts": [
        {
          "label": "a",
          "answerText": "LaTeX answer here",
          "marks": 2,
          "notes": ["allow equivalent simplified forms", "follow through marks applicable"]
        },
        {
          "label": "b",
          "answerText": "LaTeX answer here",
          "marks": 3,
          "notes": []
        }
      ]
    }
  ]
}

RULES:
- Marks MUST be integers.
- notes must be short bullet points, no rambling.
- Combine multi-line markscheme fragments into one clean explanation.
- If images or graphs appear, describe them textually.
- Do not fabricate answers.
- Stick to actual content.
- Use $...$ for inline LaTeX and $$...$$ for block LaTeX.

MARKSCHEME TEXT:
${pdfText}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.answers || parsed };
  } catch (error) {
    console.error('Error extracting markscheme:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Merge questions with markscheme
 */
export async function mergeQuestionsAndMarkscheme(questionsJson, markschemeJson) {
  const prompt = `You are an intelligent exam-question merging system.

You will be given:
1. JSON A: extracted QUESTIONS
2. JSON B: extracted MARKSCHEME

Your job:
- Match each questionNumber + subpart label across both files.
- Pair questionText with: answerText, marks, notes
- Ensure ordering and structure remain exactly the same as in the original paper.

OUTPUT STRICT JSON FORMAT:
{
  "merged": [
    {
      "questionNumber": "1",
      "subparts": [
        {
          "label": "a",
          "questionText": "...",
          "answerText": "...",
          "marks": 2,
          "notes": []
        }
      ],
      "fullQuestionText": "Combined readable version of the entire question"
    }
  ]
}

Make sure:
- All LaTeX remains intact (use $...$ for inline, $$...$$ for block)
- No questions or subparts are lost
- Missing answers are marked with: "answerText": null, "marks": null
- No hallucinations

QUESTIONS JSON:
${JSON.stringify(questionsJson, null, 2)}

MARKSCHEME JSON:
${JSON.stringify(markschemeJson, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.merged || parsed };
  } catch (error) {
    console.error('Error merging questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convert merged questions to database-ready format
 */
export async function convertToDBFormat(mergedJson, metadata) {
  const prompt = `You are preparing final database-ready exam questions.

Convert the merged Q+MS JSON into this structure:

{
  "questions": [
    {
      "questionText": "Markdown + LaTeX question",
      "answerText": "Markdown + LaTeX answer",
      "marks": integer,
      "difficulty": "easy | medium | hard",
      "source": "past_paper",
      "tags": ["topic1", "topic2"],
      "originalQuestionNumber": "1a"
    }
  ]
}

RULES:
- Flatten subparts into separate questions: 1a → one question, 1b → one question
- difficulty: estimate based on marks (<2 easy, 2-4 medium, >4 hard)
- include mark allocation automatically
- full LaTeX preserved (use $...$ for inline, $$...$$ for block)
- DO NOT modify mathematical content
- tags should be relevant mathematical concepts

Context:
- Subject: ${metadata.subject || 'Mathematics'}
- Paper Year: ${metadata.paperYear || 'Unknown'}
- Exam Board: ${metadata.examBoard || 'Cambridge'}

MERGED JSON:
${JSON.stringify(mergedJson, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.questions || parsed };
  } catch (error) {
    console.error('Error converting to DB format:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate new questions with AI
 */
export async function generateQuestions(options) {
  const { subject, lesson, difficulty, numberOfQuestions, context = '' } = options;

  const prompt = `You are an expert mathematics question creator for ${subject}.

Create ${numberOfQuestions} original practice questions for the topic: "${lesson}".
Difficulty level: ${difficulty}

REQUIREMENTS:
1. Each question must be original and educational
2. Include step-by-step solutions
3. Use proper LaTeX formatting for all math ($...$ inline, $$...$$ block)
4. Questions should test understanding, not just memorization
5. Vary the question types (calculation, proof, application, word problems)

${context ? `Additional context: ${context}` : ''}

OUTPUT JSON FORMAT:
{
  "questions": [
    {
      "questionText": "The full question with LaTeX math",
      "answerText": "Complete answer with LaTeX",
      "explanation": "Student-friendly explanation",
      "steps": [
        { "stepNumber": 1, "content": "First step explanation" },
        { "stepNumber": 2, "content": "Second step explanation" }
      ],
      "difficulty": "${difficulty}",
      "marks": estimated_marks,
      "tags": ["relevant", "topic", "tags"]
    }
  ]
}

Generate exactly ${numberOfQuestions} questions.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Verify questions with second model
    const verified = await verifyGeneratedQuestions(parsed.questions || parsed);
    
    return { success: true, data: verified };
  } catch (error) {
    console.error('Error generating questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify generated questions for correctness
 */
async function verifyGeneratedQuestions(questions) {
  const prompt = `You are a mathematics question verifier.

Review these generated questions and their answers for:
1. Mathematical correctness
2. Clear problem statement
3. Accurate solution
4. Appropriate difficulty rating

For each question, verify or correct the answer and provide a confidence score.

QUESTIONS:
${JSON.stringify(questions, null, 2)}

OUTPUT JSON FORMAT:
{
  "verifiedQuestions": [
    {
      ...original_question_fields,
      "verified": true,
      "corrections": null or "description of any corrections made",
      "confidence": 0.95
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionVerification,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.verifiedQuestions || questions;
  } catch (error) {
    console.error('Error verifying questions:', error);
    return questions; // Return original if verification fails
  }
}

/**
 * Check student answer against correct answer
 */
export async function checkStudentAnswer(question, studentAnswer, answerType = 'text') {
  let answerDescription = '';
  
  if (answerType === 'text') {
    answerDescription = `Student's written answer:\n${studentAnswer}`;
  } else if (answerType === 'canvas' || answerType === 'image') {
    answerDescription = `Student submitted a ${answerType}. Image analysis result:\n${studentAnswer}`;
  } else if (answerType === 'pdf') {
    answerDescription = `Student submitted a PDF. Extracted text:\n${studentAnswer}`;
  }

  const prompt = `You are an expert mathematics tutor reviewing a student's answer.

QUESTION:
${question.questionText}

CORRECT ANSWER:
${question.answerText}

MARKS AVAILABLE: ${question.marks || 'Not specified'}

${answerDescription}

TASK:
1. Determine if the student's answer is correct (allow for equivalent forms)
2. Award partial marks if applicable
3. Provide a detailed explanation
4. Show the correct step-by-step working
5. Give constructive feedback

Use fuzzy mathematical equivalence - accept answers that are mathematically equivalent even if formatted differently.

OUTPUT JSON FORMAT:
{
  "isCorrect": true/false,
  "score": 0-100,
  "marksAwarded": number,
  "maxMarks": number,
  "explanation": "Detailed explanation of why the answer is correct/incorrect",
  "steps": [
    { "stepNumber": 1, "content": "Step description", "isCorrect": true/false }
  ],
  "feedback": "Constructive feedback for the student",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "commonMistake": "If incorrect, describe the common mistake pattern"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.answerReview,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Error checking answer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate explanation for a question
 */
export async function generateExplanation(question) {
  const prompt = `You are a friendly mathematics tutor.

Create a student-friendly explanation for this question and its answer.

QUESTION:
${question.questionText}

ANSWER:
${question.answerText}

REQUIREMENTS:
1. Explain in simple, clear language
2. Break down into easy-to-follow steps
3. Use proper LaTeX for all math ($...$ inline, $$...$$ block)
4. Anticipate common misunderstandings
5. Include helpful tips

OUTPUT JSON FORMAT:
{
  "explanation": "Full student-friendly explanation with LaTeX",
  "steps": [
    { "stepNumber": 1, "content": "Step with explanation" }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "commonMistakes": ["Common mistake to avoid"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.explanation,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Error generating explanation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Analyze image/canvas answer using vision
 */
export async function analyzeImageAnswer(imageUrl, question) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing a student's handwritten mathematical answer.

QUESTION:
${question.questionText}

EXPECTED ANSWER:
${question.answerText}

Extract and interpret the student's work from the image. Look for:
1. Mathematical expressions and equations
2. Working/steps shown
3. Final answer
4. Any diagrams or graphs

OUTPUT JSON FORMAT:
{
  "extractedText": "The mathematical content you can see",
  "finalAnswer": "The student's final answer",
  "workingShown": ["Step 1", "Step 2"],
  "hasErrors": true/false,
  "errorDescription": "Description of any visible errors",
  "confidence": 0.0-1.0
}`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1024
    });

    const content = response.choices[0].message.content;
    // Try to parse as JSON, otherwise return as text
    try {
      return { success: true, data: JSON.parse(content) };
    } catch {
      return { success: true, data: { extractedText: content, confidence: 0.7 } };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get recommended questions based on weak topics
 */
export async function getRecommendedQuestions(weakTopics, studentHistory) {
  const prompt = `You are an intelligent tutoring system.

Based on the student's weak topics and attempt history, recommend a study strategy.

WEAK TOPICS:
${JSON.stringify(weakTopics, null, 2)}

RECENT PERFORMANCE:
${JSON.stringify(studentHistory, null, 2)}

Provide recommendations for:
1. Which topics to focus on first
2. Suggested difficulty progression
3. Types of questions to practice
4. Estimated study time

OUTPUT JSON FORMAT:
{
  "priorityTopics": [
    { "topic": "Topic name", "priority": 1, "reason": "Why this topic" }
  ],
  "difficultyProgression": ["easy", "medium", "hard"],
  "questionTypes": ["calculation", "word problems"],
  "estimatedStudyHours": 5,
  "encouragement": "Motivational message for student"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.explanation,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return { success: false, error: error.message };
  }
}

export default {
  extractQuestionsFromPDF,
  extractMarkschemeFromPDF,
  mergeQuestionsAndMarkscheme,
  convertToDBFormat,
  generateQuestions,
  checkStudentAnswer,
  generateExplanation,
  analyzeImageAnswer,
  getRecommendedQuestions
};

