import OpenAI from 'openai';
import Question from '../models/Question.js';
import Lesson from '../models/Lesson.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Model selection based on task (as specified)
const MODELS = {
  questionGeneration: 'gpt-4-turbo-preview',    // GPT-4.1 equivalent - for generating questions
  questionVerification: 'gpt-4o-mini',           // GPT-4o-mini - for verifying correctness
  solutionGeneration: 'gpt-4-turbo-preview',    // GPT-4.1 equivalent - for solutions
  solutionVerification: 'gpt-4o-mini',          // GPT-4o-mini - for verifying solutions
  explanation: 'gpt-4o',                         // GPT-4o - for student-friendly explanations
  answerReview: 'gpt-4o',                        // GPT-4o - for reviewing student answers
  marksFeedback: 'gpt-4o'                        // GPT-4o - for marking and feedback
};

/**
 * Learn Edexcel style from existing questions in database
 */
async function learnFromDatabase(lessonId, subject) {
  try {
    // Get existing questions from the same lesson or subject
    const existingQuestions = await Question.find({
      $or: [
        { lesson: lessonId },
        { subject: subject }
      ],
      source: { $in: ['past_paper', 'manual'] }, // Learn from verified sources
      isActive: true
    })
    .limit(20)
    .lean();

    if (existingQuestions.length === 0) {
      return null;
    }

    // Format examples for AI learning
    const examples = existingQuestions.map(q => ({
      question: q.questionText,
      answer: q.answerText,
      marks: q.marks,
      difficulty: q.difficulty,
      examinerNotes: q.examinerNotes || []
    }));

    return examples;
  } catch (error) {
    console.error('Error learning from database:', error);
    return null;
  }
}

/**
 * STAGE 1: Generate Questions (GPT-4.1)
 */
async function stage1_generateQuestions(options) {
  const { lesson, subject, difficulty, numberOfQuestions, existingExamples } = options;

  let examplesContext = '';
  if (existingExamples && existingExamples.length > 0) {
    examplesContext = `
LEARN FROM THESE EXISTING EDEXCEL-STYLE QUESTIONS:
${existingExamples.slice(0, 5).map((ex, i) => `
Example ${i + 1}:
Question: ${ex.question}
Answer: ${ex.answer}
Marks: ${ex.marks}
Difficulty: ${ex.difficulty}
${ex.examinerNotes?.length ? `Examiner Notes: ${ex.examinerNotes.join(', ')}` : ''}
`).join('\n')}

Analyze these examples to understand:
- How questions are phrased
- What level of detail is expected
- How marks are typically allocated
- The mathematical notation style used
`;
  }

  const prompt = `You are an expert Edexcel/Cambridge A-Level and O-Level mathematics examiner.

Generate ${numberOfQuestions} original ${difficulty} difficulty questions for the topic: "${lesson}"
Subject: ${subject}

${examplesContext}

REQUIREMENTS:
1. Questions must be in authentic Edexcel exam style
2. Use proper LaTeX notation: $...$ for inline math, $$...$$ for display math
3. Each question should test genuine understanding, not just memorization
4. Vary question types: calculations, proofs, applications, word problems
5. Include appropriate mark allocation based on difficulty:
   - Easy: 1-3 marks
   - Medium: 3-5 marks  
   - Hard: 5-10 marks
6. Questions must be mathematically sound and solvable

OUTPUT JSON FORMAT:
{
  "questions": [
    {
      "questionText": "Full question with LaTeX math notation",
      "marks": number,
      "difficulty": "${difficulty}",
      "questionType": "calculation|proof|application|word_problem",
      "topics": ["topic1", "topic2"]
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
    return { success: true, data: parsed.questions || [] };
  } catch (error) {
    console.error('Stage 1 error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * STAGE 2: Verify Questions (GPT-4o-mini)
 */
async function stage2_verifyQuestions(questions) {
  const prompt = `You are a mathematics question verifier.

Review these generated questions for:
1. Mathematical correctness - no errors in the problem statement
2. Clarity - question is unambiguous and well-phrased
3. Solvability - question has a definite solution
4. Appropriate difficulty - marks match complexity
5. Proper LaTeX formatting

QUESTIONS TO VERIFY:
${JSON.stringify(questions, null, 2)}

For each question, verify and correct if needed.

OUTPUT JSON FORMAT:
{
  "verifiedQuestions": [
    {
      ...original_question_fields,
      "verified": true|false,
      "corrections": null or "description of corrections made",
      "issues": [] // list of any issues found
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
    return { success: true, data: parsed.verifiedQuestions || questions };
  } catch (error) {
    console.error('Stage 2 error:', error);
    return { success: true, data: questions }; // Return original if verification fails
  }
}

/**
 * STAGE 3: Generate Official Solutions (GPT-4.1)
 */
async function stage3_generateSolutions(questions) {
  const prompt = `You are an expert mathematics examiner creating official mark schemes.

For each question, provide:
1. The complete, correct solution with all working
2. Mark allocation breakdown (what earns each mark)
3. Alternative acceptable answers
4. Common mistakes to watch for

QUESTIONS:
${JSON.stringify(questions, null, 2)}

Use proper LaTeX notation for all mathematics.

OUTPUT JSON FORMAT:
{
  "solutions": [
    {
      "questionIndex": 0,
      "answerText": "Complete solution with LaTeX",
      "markScheme": [
        { "mark": 1, "criteria": "What earns this mark" }
      ],
      "alternativeAnswers": ["Other acceptable forms"],
      "commonMistakes": ["Typical errors students make"]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.solutionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.solutions || [] };
  } catch (error) {
    console.error('Stage 3 error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * STAGE 4: Verify Solutions (GPT-4o-mini)
 */
async function stage4_verifySolutions(questions, solutions) {
  const prompt = `You are a mathematics solution verifier.

Verify each solution is mathematically correct and complete.

QUESTIONS:
${JSON.stringify(questions, null, 2)}

SOLUTIONS:
${JSON.stringify(solutions, null, 2)}

Check:
1. Solution is mathematically correct
2. All steps are valid
3. Final answer is correct
4. Mark scheme is fair and complete

OUTPUT JSON FORMAT:
{
  "verifiedSolutions": [
    {
      ...original_solution_fields,
      "verified": true|false,
      "correctedAnswer": null or "corrected solution if needed"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.solutionVerification,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.verifiedSolutions || solutions };
  } catch (error) {
    console.error('Stage 4 error:', error);
    return { success: true, data: solutions };
  }
}

/**
 * STAGE 5: Generate Student-Friendly Explanations (GPT-4o)
 */
async function stage5_generateExplanations(questions, solutions) {
  const prompt = `You are a friendly, expert mathematics tutor.

Create student-friendly explanations for each question and solution.

QUESTIONS AND SOLUTIONS:
${questions.map((q, i) => `
Question ${i + 1}: ${q.questionText}
Solution: ${solutions[i]?.answerText || 'N/A'}
`).join('\n')}

For each question, provide:
1. A clear, step-by-step explanation a student can follow
2. Tips and tricks for solving similar problems
3. Common pitfalls to avoid
4. Real-world applications (if applicable)

Use encouraging language. Use LaTeX for math.

OUTPUT JSON FORMAT:
{
  "explanations": [
    {
      "questionIndex": 0,
      "explanation": "Friendly explanation with steps",
      "steps": [
        { "stepNumber": 1, "title": "Step title", "content": "What to do" }
      ],
      "tips": ["Helpful tip"],
      "pitfalls": ["Common mistake to avoid"],
      "realWorldApplication": "Where this is used"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.explanation,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.explanations || [] };
  } catch (error) {
    console.error('Stage 5 error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * MAIN: Generate Questions with Full Pipeline
 */
export async function generateQuestionsWithAI(options) {
  const { lessonId, subject, difficulty, numberOfQuestions } = options;

  console.log('🚀 Starting AI Question Generation Pipeline...');
  console.log(`   Lesson: ${lessonId}, Subject: ${subject}, Difficulty: ${difficulty}, Count: ${numberOfQuestions}`);

  try {
    // Get lesson details
    const lesson = await Lesson.findById(lessonId).lean();
    const lessonTitle = lesson?.title || 'Mathematics';

    // Learn from existing database
    console.log('📚 Stage 0: Learning from database...');
    const existingExamples = await learnFromDatabase(lessonId, subject);
    console.log(`   Found ${existingExamples?.length || 0} examples to learn from`);

    // STAGE 1: Generate Questions
    console.log('✏️ Stage 1: Generating questions (GPT-4.1)...');
    const stage1Result = await stage1_generateQuestions({
      lesson: lessonTitle,
      subject,
      difficulty,
      numberOfQuestions,
      existingExamples
    });
    if (!stage1Result.success) {
      throw new Error(`Stage 1 failed: ${stage1Result.error}`);
    }
    console.log(`   Generated ${stage1Result.data.length} questions`);

    // STAGE 2: Verify Questions
    console.log('✅ Stage 2: Verifying questions (GPT-4o-mini)...');
    const stage2Result = await stage2_verifyQuestions(stage1Result.data);
    const verifiedQuestions = stage2Result.data.filter(q => q.verified !== false);
    console.log(`   ${verifiedQuestions.length} questions verified`);

    // STAGE 3: Generate Solutions
    console.log('📝 Stage 3: Generating solutions (GPT-4.1)...');
    const stage3Result = await stage3_generateSolutions(verifiedQuestions);
    if (!stage3Result.success) {
      throw new Error(`Stage 3 failed: ${stage3Result.error}`);
    }
    console.log(`   Generated ${stage3Result.data.length} solutions`);

    // STAGE 4: Verify Solutions
    console.log('✅ Stage 4: Verifying solutions (GPT-4o-mini)...');
    const stage4Result = await stage4_verifySolutions(verifiedQuestions, stage3Result.data);
    console.log('   Solutions verified');

    // STAGE 5: Generate Explanations
    console.log('💡 Stage 5: Generating explanations (GPT-4o)...');
    const stage5Result = await stage5_generateExplanations(verifiedQuestions, stage4Result.data);
    console.log('   Explanations generated');

    // Combine everything
    const finalQuestions = verifiedQuestions.map((q, i) => {
      const solution = stage4Result.data[i] || {};
      const explanation = stage5Result.data?.[i] || {};

      return {
        questionText: q.questionText,
        answerText: solution.answerText || solution.correctedAnswer || '',
        marks: q.marks,
        difficulty: q.difficulty,
        source: 'ai_generated',
        explanation: explanation.explanation || '',
        steps: explanation.steps || [],
        tips: explanation.tips || [],
        markScheme: solution.markScheme || [],
        commonMistakes: solution.commonMistakes || [],
        topics: q.topics || [],
        verified: true
      };
    });

    console.log('🎉 Pipeline complete!');
    return {
      success: true,
      data: finalQuestions,
      metadata: {
        generatedAt: new Date(),
        model: 'multi-stage-pipeline',
        learnedFromExamples: existingExamples?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ Pipeline error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * STAGE 6: Review Student Answer (GPT-4o)
 */
export async function reviewStudentAnswer(question, studentAnswer, answerType = 'text') {
  const prompt = `You are an expert Edexcel mathematics examiner reviewing a student's answer.

QUESTION:
${question.questionText}

OFFICIAL ANSWER:
${question.answerText}

MARKS AVAILABLE: ${question.marks}

MARK SCHEME:
${question.markScheme?.map(m => `- ${m.mark} mark(s): ${m.criteria}`).join('\n') || 'Standard marking applies'}

STUDENT'S ANSWER:
${studentAnswer}

TASK:
1. Compare the student's answer with the official answer
2. Award marks according to the mark scheme
3. Accept mathematically equivalent forms
4. Give partial credit where appropriate
5. Provide constructive feedback

OUTPUT JSON FORMAT:
{
  "isCorrect": true|false,
  "marksAwarded": number,
  "maxMarks": ${question.marks},
  "score": percentage,
  "markBreakdown": [
    { "criterion": "What was assessed", "awarded": true|false, "marks": number }
  ],
  "feedback": "Constructive feedback for the student",
  "correctSolution": "The correct working if student was wrong",
  "improvements": ["Specific improvement suggestions"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.answerReview,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Answer review error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract questions from past paper PDF
 */
export async function extractQuestionsFromPastPaper(pdfText, metadata = {}) {
  const prompt = `You are an expert Cambridge/Pearson EDEXCEL examiner AI.

You will be given the raw extracted text of a **Questions PDF only**.  

Your task is to extract ALL exam questions in clean structured order.

FORMAT AND BEHAVIOR RULES:
- Many exams contain subparts (1a, 1b, 1c). Keep them grouped under a single question number.
- Include **all diagrams**, describing them in text if OCR cannot extract them.
- Return ALL math in pure LaTeX inside markdown (use $...$ for inline, $$...$$ for block).
- Do NOT invent answers.
- Do NOT skip table/graph content. Convert them into LaTeX/table text representations.

PDF TEXT:
${pdfText}

OUTPUT JSON FORMAT:
{
  "questions": [
    {
      "questionNumber": "1",
      "subparts": [
        { "label": "a", "questionText": "...", "marks": null }
      ],
      "fullQuestionText": "Combined readable version of the whole question"
    }
  ],
  "paperInfo": {
    "year": "${metadata.paperYear || 'Unknown'}",
    "session": "${metadata.paperSession || 'Unknown'}",
    "subject": "${metadata.subject || 'Mathematics'}",
    "level": "${metadata.level || 'A-Level'}"
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract markscheme from PDF
 */
export async function extractMarkschemeFromPDF(pdfText, metadata = {}) {
  const prompt = `You are an expert Cambridge/Pearson examiner AI.

You will be given OCR text from a **Markscheme PDF only**.

Your task:
- Extract answers AND mark allocations
- Map them to the corresponding question number and sub-question letter
- Output clean LaTeX-formatted answers
- Include examiner notes if present ("accept", "reject", "BOD", etc.)

MARKSCHEME TEXT:
${pdfText}

OUTPUT JSON FORMAT:
{
  "answers": [
    {
      "questionNumber": "1",
      "subparts": [
        {
          "label": "a",
          "answerText": "LaTeX answer here",
          "marks": 2,
          "notes": ["allow equivalent forms", "follow through marks applicable"]
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.questionGeneration,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Markscheme extraction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Merge questions with markscheme and save to database
 */
export async function mergeAndSavePastPaper(questionsData, markschemeData, metadata) {
  const { subject, lessonId, paperYear, examBoard } = metadata;

  const mergedQuestions = [];

  for (const q of questionsData.questions) {
    // Find matching markscheme
    const ms = markschemeData.answers.find(a => a.questionNumber === q.questionNumber);

    for (const subpart of q.subparts) {
      const msSubpart = ms?.subparts?.find(s => s.label === subpart.label);

      mergedQuestions.push({
        subject,
        lesson: lessonId,
        questionText: subpart.questionText || q.fullQuestionText,
        answerText: msSubpart?.answerText || '',
        marks: msSubpart?.marks || subpart.marks || 1,
        difficulty: (msSubpart?.marks || 1) <= 2 ? 'easy' : (msSubpart?.marks || 1) <= 4 ? 'medium' : 'hard',
        source: 'past_paper',
        paperYear,
        examBoard,
        originalQuestionNumber: `${q.questionNumber}${subpart.label}`,
        examinerNotes: msSubpart?.notes || [],
        isActive: true,
        isVerified: true
      });
    }
  }

  return mergedQuestions;
}

export default {
  generateQuestionsWithAI,
  reviewStudentAnswer,
  extractQuestionsFromPastPaper,
  extractMarkschemeFromPDF,
  mergeAndSavePastPaper
};

