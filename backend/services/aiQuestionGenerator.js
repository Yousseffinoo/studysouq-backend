import OpenAI from 'openai';
import Question from '../models/Question.js';
import Lesson from '../models/Lesson.js';
import TrainingQuestion from '../models/TrainingQuestion.js';

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
 * Determine subject level from subject name
 */
function determineSubjectLevel(subjectName) {
  const lower = (subjectName || '').toLowerCase();
  if (lower.includes('o-level') || lower.includes('o level') || lower.includes('igcse')) {
    return 'O-Level';
  }
  if (lower.includes('a2') || lower.includes('a2-level') || lower.includes('a2 level')) {
    return 'A2-Level';
  }
  if (lower.includes('as') || lower.includes('as-level') || lower.includes('as level') || lower.includes('a-level') || lower.includes('a level')) {
    return 'AS-Level';
  }
  return 'AS-Level'; // Default
}

/**
 * Learn Edexcel style from TRAINING DATABASE (past papers)
 */
async function learnFromTrainingData(lessonTitle, subjectLevel, limit = 15) {
  try {
    // Search by lesson title/topic in training database
    const trainingQuestions = await TrainingQuestion.find({
      subjectLevel: subjectLevel,
      $or: [
        { lessonTitle: new RegExp(lessonTitle, 'i') },
        { detectedTopics: { $in: [new RegExp(lessonTitle.split(' ')[0], 'i')] } },
        { mathConcepts: { $in: [new RegExp(lessonTitle.split(' ')[0], 'i')] } }
      ]
    })
    .limit(limit)
    .lean();

    if (trainingQuestions.length === 0) {
      // Fallback: get random questions from this subject level
      const fallbackQuestions = await TrainingQuestion.find({ subjectLevel })
        .limit(5)
        .lean();
      return formatTrainingExamples(fallbackQuestions);
    }

    return formatTrainingExamples(trainingQuestions);
  } catch (error) {
    console.error('Error learning from training data:', error);
    return null;
  }
}

/**
 * Format training questions for AI context
 */
function formatTrainingExamples(questions) {
  if (!questions || questions.length === 0) return null;

  return questions.map(q => {
    let fullQuestion = q.questionText;
    let fullAnswer = q.answerText || '';
    
    // Include subparts if available
    if (q.subparts && q.subparts.length > 0) {
      fullQuestion += '\n' + q.subparts.map(sp => `(${sp.label}) ${sp.questionText}`).join('\n');
      fullAnswer = q.subparts.map(sp => `(${sp.label}) ${sp.answerText || ''}`).join('\n');
    }
    
    return {
      question: fullQuestion,
      answer: fullAnswer,
      marks: q.totalMarks,
      difficulty: q.difficulty,
      markschemeNotes: q.markschemeNotes || [],
      paperCode: q.paperCode,
      year: q.year
    };
  });
}

/**
 * Learn Edexcel style from existing questions in database (legacy)
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
  const { lesson, subject, difficulty, numberOfQuestions, existingExamples, trainingExamples } = options;

  let examplesContext = '';
  
  // Prioritize training data (past papers) over generic examples
  const examples = trainingExamples || existingExamples;
  
  if (examples && examples.length > 0) {
    const hasTrainingData = trainingExamples && trainingExamples.length > 0;
    
    examplesContext = `
${hasTrainingData ? '📚 LEARNED FROM REAL EDEXCEL PAST PAPERS:' : 'EXAMPLE QUESTIONS:'}
${examples.slice(0, 5).map((ex, i) => `
------- EXAMPLE ${i + 1} ${ex.paperCode ? `(${ex.paperCode} ${ex.year})` : ''} -------
QUESTION: ${ex.question}
ANSWER: ${ex.answer}
MARKS: ${ex.marks}${ex.markschemeNotes?.length > 0 ? `
EXAMINER NOTES: ${ex.markschemeNotes.join('; ')}` : ''}
`).join('\n')}
-----------------------------------------

CRITICAL: Match the EXACT style, wording patterns, mark allocation, and solution format from these real Edexcel questions.
`;
  }

  const prompt = `You are Mathius, an expert Edexcel/Cambridge A-Level mathematics examiner AI.

Generate ${numberOfQuestions} original ${difficulty} difficulty questions for: "${lesson}"
Subject: ${subject}

${examplesContext}

REQUIREMENTS:
1. Authentic Edexcel exam style questions (match the examples exactly)
2. CRITICAL: ALL math MUST be wrapped in LaTeX delimiters:
   - Use $...$ for inline math (e.g., $x^2 + 5$)
   - Use $$...$$ for display/block math (e.g., $$\\frac{a}{b}$$)
   - NEVER write raw LaTeX without delimiters
   - Example: Write $\\binom{10}{3}$ NOT just \\binom{10}{3}
3. Each question must have complete solution with ALL math in $ delimiters
4. Mark allocation must match Edexcel style: easy(1-2), medium(3-4), hard(5-8)
5. Include examiner-style notes where appropriate
6. Vary question types but maintain authentic exam feel

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
      "tips": ["Helpful tip 1", "Helpful tip 2"],
      "markingNotes": ["Examiner note 1"]
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
    
    // Determine subject level for training data
    const subjectLevel = determineSubjectLevel(subject);
    console.log(`📊 Mathius: Subject level detected: ${subjectLevel}`);

    // PRIORITY 1: Learn from TRAINING DATABASE (past papers)
    const trainingExamples = await learnFromTrainingData(lessonTitle, subjectLevel, 15);
    console.log(`📚 Mathius: Found ${trainingExamples?.length || 0} past paper examples`);

    // PRIORITY 2: Learn from existing questions (fallback)
    let existingExamples = null;
    if (!trainingExamples || trainingExamples.length < 3) {
      existingExamples = await learnFromDatabase(lessonId, subject);
      console.log(`📖 Mathius: Found ${existingExamples?.length || 0} additional examples`);
    }

    // Total examples for context
    const totalExamples = (trainingExamples?.length || 0) + (existingExamples?.length || 0);
    console.log(`📚 Mathius: Total ${totalExamples} examples to learn from`);

    // Single optimized API call for questions + solutions
    console.log('✨ Mathius: Generating questions...');
    const result = await generateQuestionsWithSolutions({
      lesson: lessonTitle,
      subject,
      difficulty,
      numberOfQuestions,
      existingExamples,
      trainingExamples
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
        learnedFromPastPapers: trainingExamples?.length || 0,
        learnedFromExamples: existingExamples?.length || 0,
        subjectLevel
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
  const isImageAnswer = studentAnswer.startsWith('data:image') || answerType === 'draw' || answerType === 'upload';
  
  const textPrompt = `You are Mathius, an expert and encouraging mathematics tutor.

QUESTION:
${question.questionText}

CORRECT ANSWER:
${question.answerText}

MARKS: ${question.marks}

${isImageAnswer ? 'STUDENT\'S ANSWER: [See the attached image of their handwritten work]' : `STUDENT'S ANSWER:\n${studentAnswer}`}

TASK:
1. ${isImageAnswer ? 'Analyze the handwritten work in the image carefully' : 'Compare student\'s answer with correct answer'}
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
    let messages;
    let model = MODELS.fast;

    if (isImageAnswer && studentAnswer.startsWith('data:image')) {
      // Use GPT-4 Vision for image answers
      model = 'gpt-4o';
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { 
              type: 'image_url', 
              image_url: { 
                url: studentAnswer,
                detail: 'high'
              } 
            }
          ]
        }
      ];
    } else {
      messages = [{ role: 'user', content: textPrompt }];
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
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
