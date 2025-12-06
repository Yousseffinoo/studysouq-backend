import OpenAI from 'openai';
import Question from '../models/Question.js';
import Lesson from '../models/Lesson.js';

// Initialize OpenAI client (branded as Mathius)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Model selection - optimized for speed
const MODELS = {
  fast: 'gpt-4o-mini',      // Fast model for quick generation
  quality: 'gpt-4o',        // Quality model for important tasks
};

/**
 * Learn Edexcel style from existing questions in database
 */
async function learnFromDatabase(lessonId, subject) {
  try {
    const existingQuestions = await Question.find({
      $or: [
        { lesson: lessonId },
        { subject: subject }
      ],
      source: { $in: ['past_paper', 'manual'] },
      isActive: true
    })
    .limit(10)
    .lean();

    if (existingQuestions.length === 0) return null;

    return existingQuestions.map(q => ({
      question: q.questionText,
      answer: q.answerText,
      marks: q.marks,
      difficulty: q.difficulty
    }));
  } catch (error) {
    console.error('Error learning from database:', error);
    return null;
  }
}

/**
 * FAST: Generate Questions with Solutions in ONE call (Mathius Engine)
 */
async function generateQuestionsWithSolutions(options) {
  const { lesson, subject, difficulty, numberOfQuestions, existingExamples } = options;

  let examplesContext = '';
  if (existingExamples && existingExamples.length > 0) {
    examplesContext = `
LEARN FROM THESE EDEXCEL-STYLE EXAMPLES:
${existingExamples.slice(0, 3).map((ex, i) => `
Example ${i + 1}: ${ex.question}
Answer: ${ex.answer}
Marks: ${ex.marks}
`).join('\n')}
Match this style exactly.
`;
  }

  const prompt = `You are Mathius, an expert Edexcel/Cambridge A-Level mathematics examiner AI.

Generate ${numberOfQuestions} original ${difficulty} difficulty questions for: "${lesson}"
Subject: ${subject}

${examplesContext}

REQUIREMENTS:
1. Authentic Edexcel exam style questions
2. Use LaTeX: $...$ for inline, $$...$$ for display math
3. Each question must have complete solution
4. Difficulty-based marks: easy(1-2), medium(3-4), hard(5-8)
5. Vary question types: calculations, applications, word problems

OUTPUT JSON (strict format):
{
  "questions": [
    {
      "questionText": "Question with LaTeX math",
      "answerText": "Complete solution with LaTeX showing all working",
      "marks": number,
      "difficulty": "${difficulty}",
      "explanation": "Student-friendly explanation of the method",
      "steps": [
        {"stepNumber": 1, "title": "Step title", "content": "Step content with LaTeX"}
      ],
      "tips": ["Helpful tip 1", "Helpful tip 2"]
    }
  ]
}

Generate exactly ${numberOfQuestions} complete questions with solutions.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return { success: true, data: parsed.questions || [] };
  } catch (error) {
    console.error('Mathius generation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * MAIN: Fast Question Generation Pipeline (Mathius Engine)
 */
export async function generateQuestionsWithAI(options) {
  const { lessonId, subject, difficulty, numberOfQuestions } = options;

  console.log('🧠 Mathius: Starting question generation...');
  const startTime = Date.now();

  try {
    // Get lesson details
    const lesson = await Lesson.findById(lessonId).lean();
    const lessonTitle = lesson?.title || 'Mathematics';

    // Quick database learning (parallel with nothing, just fast)
    const existingExamples = await learnFromDatabase(lessonId, subject);
    console.log(`📚 Mathius: Found ${existingExamples?.length || 0} examples to learn from`);

    // Single optimized API call for questions + solutions
    console.log('✨ Mathius: Generating questions...');
    const result = await generateQuestionsWithSolutions({
      lesson: lessonTitle,
      subject,
      difficulty,
      numberOfQuestions,
      existingExamples
    });

    if (!result.success) {
      throw new Error(`Generation failed: ${result.error}`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 Mathius: Generated ${result.data.length} questions in ${elapsed}s`);

    return {
      success: true,
      data: result.data.map(q => ({
        ...q,
        source: 'ai_generated',
        verified: true
      })),
      metadata: {
        generatedAt: new Date(),
        model: 'mathius',
        generationTime: elapsed,
        learnedFromExamples: existingExamples?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ Mathius error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Review Student Answer (Mathius Tutor Mode)
 */
export async function reviewStudentAnswer(question, studentAnswer, answerType = 'text') {
  const prompt = `You are Mathius, an expert and encouraging mathematics tutor.

QUESTION:
${question.questionText}

CORRECT ANSWER:
${question.answerText}

MARKS: ${question.marks}

STUDENT'S ANSWER:
${studentAnswer}

TASK:
1. Compare student's answer with correct answer
2. Accept mathematically equivalent forms
3. Award partial marks where appropriate
4. Give encouraging, constructive feedback
5. Use LaTeX for any math in your response: $...$ for inline

OUTPUT JSON:
{
  "isCorrect": boolean,
  "marksAwarded": number,
  "maxMarks": ${question.marks},
  "score": percentage (0-100),
  "feedback": "Encouraging feedback with specific praise or guidance",
  "correctSolution": "Show correct working if student was wrong (use LaTeX)",
  "improvements": ["Specific improvement suggestion"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Mathius review error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate Mock Exam (multiple lessons)
 */
export async function generateMockExam(options) {
  const { lessonIds, numberOfQuestions, difficulty = 'mixed' } = options;

  console.log('📝 Mathius: Generating mock exam...');

  try {
    // Get all lessons
    const lessons = await Lesson.find({ _id: { $in: lessonIds } }).lean();
    
    // Calculate questions per lesson
    const questionsPerLesson = Math.ceil(numberOfQuestions / lessons.length);
    
    // Generate questions for each lesson in parallel
    const generationPromises = lessons.map(async (lesson) => {
      const lessonDifficulty = difficulty === 'mixed' 
        ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
        : difficulty;

      const result = await generateQuestionsWithAI({
        lessonId: lesson._id,
        subject: lesson.subject,
        difficulty: lessonDifficulty,
        numberOfQuestions: questionsPerLesson
      });

      if (result.success) {
        return result.data.map(q => ({
          ...q,
          lessonId: lesson._id,
          lessonTitle: lesson.title
        }));
      }
      return [];
    });

    const allQuestions = (await Promise.all(generationPromises)).flat();

    // Shuffle and limit to requested number
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const finalQuestions = shuffled.slice(0, numberOfQuestions);

    return {
      success: true,
      data: finalQuestions,
      metadata: {
        totalQuestions: finalQuestions.length,
        lessonsIncluded: lessons.map(l => l.title),
        generatedAt: new Date()
      }
    };
  } catch (error) {
    console.error('Mathius mock exam error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * AI Tutor Chat (Mathius Help Mode)
 */
export async function mathiusTutorChat(message, context = {}) {
  const { currentQuestion, lessonTopic, previousMessages = [] } = context;

  const systemPrompt = `You are Mathius, StudySouq's friendly and expert AI mathematics tutor.

Your personality:
- Encouraging and patient
- Uses clear, step-by-step explanations
- Celebrates student progress
- Never gives direct answers - guides students to discover them
- Uses LaTeX for math: $...$ inline, $$...$$ for display

${currentQuestion ? `Current question the student is working on: ${currentQuestion}` : ''}
${lessonTopic ? `Current topic: ${lessonTopic}` : ''}

Help the student understand concepts without doing their work for them.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...previousMessages.slice(-10), // Last 10 messages for context
    { role: 'user', content: message }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages,
      temperature: 0.7,
      max_tokens: 1024
    });

    return {
      success: true,
      data: {
        message: response.choices[0].message.content,
        role: 'assistant'
      }
    };
  } catch (error) {
    console.error('Mathius chat error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract questions from past paper PDF
 */
export async function extractQuestionsFromPastPaper(pdfText, metadata = {}) {
  const prompt = `You are Mathius, extracting questions from an Edexcel exam paper.

Extract ALL questions in clean structured format.
Use LaTeX for all math: $...$ inline, $$...$$ display.

PDF TEXT:
${pdfText}

OUTPUT JSON:
{
  "questions": [
    {
      "questionNumber": "1",
      "subparts": [{ "label": "a", "questionText": "...", "marks": null }],
      "fullQuestionText": "Combined readable version"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.quality,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    return { success: true, data: JSON.parse(response.choices[0].message.content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract markscheme from PDF
 */
export async function extractMarkschemeFromPDF(pdfText) {
  const prompt = `You are Mathius, extracting a markscheme from an exam paper.

Extract answers with mark allocations.
Use LaTeX for all math.

MARKSCHEME TEXT:
${pdfText}

OUTPUT JSON:
{
  "answers": [
    {
      "questionNumber": "1",
      "subparts": [
        { "label": "a", "answerText": "LaTeX answer", "marks": 2, "notes": [] }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.quality,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    return { success: true, data: JSON.parse(response.choices[0].message.content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Merge questions with markscheme
 */
export async function mergeAndSavePastPaper(questionsData, markschemeData, metadata) {
  const { subject, lessonId, paperYear, examBoard } = metadata;

  const mergedQuestions = [];

  for (const q of questionsData.questions) {
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
  generateMockExam,
  mathiusTutorChat,
  extractQuestionsFromPastPaper,
  extractMarkschemeFromPDF,
  mergeAndSavePastPaper
};
