import OpenAI from 'openai';
import TrainingQuestion from '../models/TrainingQuestion.js';
import TrainingBatch from '../models/TrainingBatch.js';
import Lesson from '../models/Lesson.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Topic keywords mapping for auto-detection
const TOPIC_KEYWORDS = {
  'O-Level': {
    'Number': ['integer', 'fraction', 'decimal', 'percentage', 'ratio', 'proportion', 'standard form', 'HCF', 'LCM', 'prime'],
    'Algebra': ['simplify', 'expand', 'factorise', 'factorize', 'solve', 'equation', 'expression', 'formula', 'subject', 'linear', 'quadratic', 'simultaneous'],
    'Sequences': ['sequence', 'term', 'nth term', 'arithmetic', 'geometric', 'pattern'],
    'Functions': ['function', 'f(x)', 'inverse', 'composite', 'domain', 'range'],
    'Coordinate Geometry': ['gradient', 'midpoint', 'distance', 'equation of line', 'parallel', 'perpendicular', 'y = mx + c'],
    'Geometry': ['angle', 'triangle', 'circle', 'polygon', 'parallel', 'congruent', 'similar', 'bearing'],
    'Mensuration': ['area', 'volume', 'surface area', 'perimeter', 'circumference', 'sector', 'arc', 'cylinder', 'cone', 'sphere', 'prism'],
    'Trigonometry': ['sin', 'cos', 'tan', 'sine', 'cosine', 'tangent', 'pythagoras', 'angle of elevation', 'angle of depression'],
    'Vectors': ['vector', 'magnitude', 'column vector', 'position vector'],
    'Transformations': ['reflection', 'rotation', 'translation', 'enlargement', 'transformation'],
    'Statistics': ['mean', 'median', 'mode', 'range', 'frequency', 'histogram', 'cumulative', 'quartile', 'interquartile'],
    'Probability': ['probability', 'tree diagram', 'outcome', 'event', 'independent', 'dependent', 'conditional'],
    'Graphs': ['graph', 'sketch', 'curve', 'parabola', 'cubic', 'reciprocal', 'exponential'],
    'Indices': ['index', 'indices', 'power', 'exponent', 'negative index', 'fractional index'],
    'Surds': ['surd', 'rationalise', 'rationalize', '√', 'square root']
  },
  'AS-Level': {
    'Quadratics': ['quadratic', 'discriminant', 'completing the square', 'roots', 'vertex', 'turning point'],
    'Equations and Inequalities': ['inequality', 'modulus', 'absolute value', 'solve simultaneously'],
    'Coordinate Geometry': ['circle equation', 'tangent', 'normal', 'chord', 'intersection'],
    'Graphs and Transformations': ['transformation', 'stretch', 'translation', 'reflection', 'asymptote'],
    'Binomial Expansion': ['binomial', 'expansion', 'coefficient', 'nCr', 'pascal'],
    'Trigonometry': ['radian', 'arc length', 'sector area', 'sin²', 'cos²', 'tan²', 'identity', 'equation'],
    'Exponentials and Logarithms': ['exponential', 'logarithm', 'ln', 'log', 'natural log', 'e^x'],
    'Differentiation': ['derivative', 'differentiate', 'gradient function', 'dy/dx', 'rate of change', 'tangent', 'normal', 'stationary point', 'maximum', 'minimum'],
    'Integration': ['integrate', 'integral', '∫', 'area under curve', 'definite', 'indefinite'],
    'Vectors': ['vector', 'position vector', 'unit vector', 'scalar product', 'dot product'],
    'Statistics': ['regression', 'correlation', 'standard deviation', 'variance', 'normal distribution', 'binomial distribution'],
    'Mechanics': ['kinematics', 'SUVAT', 'velocity', 'acceleration', 'displacement', 'projectile']
  },
  'A2-Level': {
    'Proof': ['proof', 'prove', 'hence show', 'contradiction', 'induction'],
    'Algebraic Methods': ['partial fraction', 'algebraic division', 'factor theorem', 'remainder theorem'],
    'Functions': ['modulus function', 'composite', 'inverse function', 'domain', 'range'],
    'Series': ['arithmetic series', 'geometric series', 'sum to infinity', 'convergent', 'divergent', 'sigma notation'],
    'Binomial': ['binomial expansion', 'negative index', 'fractional index', 'valid range'],
    'Trigonometry': ['sec', 'cosec', 'cot', 'addition formula', 'double angle', 'R cos', 'R sin', 'small angle'],
    'Parametric Equations': ['parametric', 'parameter', 'cartesian'],
    'Differentiation': ['implicit', 'chain rule', 'product rule', 'quotient rule', 'connected rates', 'parametric differentiation'],
    'Integration': ['integration by parts', 'substitution', 'partial fractions', 'trapezium rule', 'volume of revolution'],
    'Differential Equations': ['differential equation', 'separable', 'first order', 'general solution', 'particular solution'],
    'Numerical Methods': ['iteration', 'Newton-Raphson', 'numerical solution', 'sign change'],
    'Vectors': ['3D vectors', 'scalar product', 'angle between vectors', 'equation of line'],
    'Further Statistics': ['hypothesis testing', 'critical value', 'significance level', 'Type I error', 'Type II error'],
    'Further Mechanics': ['momentum', 'impulse', 'collision', 'work', 'energy', 'power']
  }
};

/**
 * Extract text from PDF buffer
 */
async function extractPDFText(pdfBuffer) {
  try {
    const pkg = await import('pdf-parse');
    const pdf = pkg.default;
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract PDF text');
  }
}

/**
 * Use AI to extract questions from question paper text
 */
async function extractQuestionsFromPaper(paperText, subjectLevel, paperInfo) {
  const prompt = `You are an expert Edexcel/Cambridge examiner. Extract ALL questions from this ${subjectLevel} Maths past paper.

PAPER INFO:
- Code: ${paperInfo.paperCode}
- Year: ${paperInfo.year}
- Session: ${paperInfo.session || 'Unknown'}

PAPER TEXT:
${paperText.substring(0, 15000)}

IMPORTANT RULES:
1. Extract EVERY question with its full text
2. Include ALL subparts (a, b, c, etc.) under each main question
3. ALL math must be in LaTeX with $ delimiters ($...$ for inline, $$...$$ for display)
4. Describe any diagrams/graphs in [DIAGRAM: description]
5. Include mark allocations shown in brackets like (3)
6. Preserve exact wording

OUTPUT STRICT JSON:
{
  "questions": [
    {
      "questionNumber": "1",
      "fullQuestionText": "Full readable question including context",
      "marks": 5,
      "subparts": [
        {
          "label": "a",
          "text": "Subpart text with $LaTeX$",
          "marks": 2
        }
      ],
      "hasImage": true,
      "imageDescription": "Graph showing y = 2x + 3",
      "detectedTopics": ["Linear equations", "Coordinate geometry"]
    }
  ]
}

Return ONLY valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Question extraction error:', error);
    throw error;
  }
}

/**
 * Use AI to extract answers from markscheme text
 */
async function extractAnswersFromMarkscheme(markschemeText, subjectLevel, paperInfo) {
  const prompt = `You are an expert Edexcel/Cambridge examiner. Extract ALL answers and marking criteria from this ${subjectLevel} Maths markscheme.

PAPER INFO:
- Code: ${paperInfo.paperCode}
- Year: ${paperInfo.year}

MARKSCHEME TEXT:
${markschemeText.substring(0, 15000)}

IMPORTANT RULES:
1. Extract answer for EVERY question/subpart
2. Include step-by-step working with marks for each step
3. Include examiner notes (accept, reject, BOD, follow through, etc.)
4. ALL math in LaTeX with $ delimiters
5. Include mark breakdown (M for method, A for accuracy, B for both)

OUTPUT STRICT JSON:
{
  "answers": [
    {
      "questionNumber": "1",
      "subparts": [
        {
          "label": "a",
          "answerText": "Final answer with $LaTeX$",
          "marks": 2,
          "steps": [
            { "step": 1, "content": "Step description", "marks": 1, "markType": "M1" }
          ],
          "examinerNotes": ["Accept equivalent forms", "Follow through from part (a)"]
        }
      ],
      "totalMarks": 5
    }
  ]
}

Return ONLY valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Markscheme extraction error:', error);
    throw error;
  }
}

/**
 * Pair questions with their answers
 */
function pairQuestionsWithAnswers(questions, answers) {
  const paired = [];
  
  for (const q of questions.questions || []) {
    const matchingAnswer = (answers.answers || []).find(
      a => a.questionNumber === q.questionNumber
    );
    
    paired.push({
      ...q,
      answerData: matchingAnswer || null
    });
  }
  
  return paired;
}

/**
 * Auto-detect topics for a question
 */
function detectTopics(questionText, subjectLevel) {
  const topics = [];
  const keywords = TOPIC_KEYWORDS[subjectLevel] || {};
  const lowerText = questionText.toLowerCase();
  
  for (const [topic, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowerText.includes(word.toLowerCase())) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
        break;
      }
    }
  }
  
  return topics;
}

/**
 * Find matching lesson for topics
 */
async function findMatchingLesson(topics, subjectLevel) {
  if (!topics || topics.length === 0) return null;
  
  // Try to find a lesson that matches any of the detected topics
  for (const topic of topics) {
    const lesson = await Lesson.findOne({
      $or: [
        { title: new RegExp(topic, 'i') },
        { description: new RegExp(topic, 'i') }
      ],
      isVisible: true
    }).lean();
    
    if (lesson) {
      return lesson;
    }
  }
  
  return null;
}

/**
 * Determine difficulty based on marks
 */
function determineDifficulty(marks) {
  if (marks <= 2) return 'easy';
  if (marks <= 5) return 'medium';
  return 'hard';
}

/**
 * Process a complete paper batch (questions + markscheme)
 */
export async function processTrainingBatch(batchId) {
  const batch = await TrainingBatch.findById(batchId);
  if (!batch) throw new Error('Batch not found');
  
  const addLog = async (stage, message, success = true) => {
    batch.processingLogs.push({ stage, message, success, timestamp: new Date() });
    await batch.save();
    console.log(`[${stage}] ${message}`);
  };
  
  try {
    // Stage 1: Extract questions
    batch.status = 'extracting';
    await addLog('extraction', 'Starting question extraction...');
    
    const questionsData = await extractQuestionsFromPaper(
      batch.questionPdfText,
      batch.subjectLevel,
      { paperCode: batch.paperCode, year: batch.year, session: batch.session }
    );
    
    await addLog('extraction', `Extracted ${questionsData.questions?.length || 0} questions`);
    batch.extractedQuestions = questionsData.questions?.length || 0;
    
    // Stage 2: Extract markscheme
    await addLog('extraction', 'Starting markscheme extraction...');
    
    const answersData = await extractAnswersFromMarkscheme(
      batch.markschemePdfText,
      batch.subjectLevel,
      { paperCode: batch.paperCode, year: batch.year }
    );
    
    await addLog('extraction', `Extracted ${answersData.answers?.length || 0} answers`);
    
    // Stage 3: Pair questions with answers
    batch.status = 'pairing';
    await addLog('pairing', 'Pairing questions with answers...');
    
    const paired = pairQuestionsWithAnswers(questionsData, answersData);
    batch.pairedQuestions = paired.filter(p => p.answerData).length;
    
    await addLog('pairing', `Paired ${batch.pairedQuestions} question-answer pairs`);
    
    // Stage 4: Map topics and save to database
    batch.status = 'mapping_topics';
    await addLog('mapping', 'Mapping topics and saving to database...');
    
    let topicsMapped = 0;
    
    for (const item of paired) {
      // Detect topics
      const fullText = item.fullQuestionText + ' ' + 
        (item.subparts?.map(s => s.text).join(' ') || '');
      const topics = detectTopics(fullText, batch.subjectLevel);
      
      if (topics.length > 0) topicsMapped++;
      
      // Find matching lesson
      const lesson = await findMatchingLesson(topics, batch.subjectLevel);
      
      // Calculate total marks
      let totalMarks = item.marks || 0;
      if (item.subparts) {
        totalMarks = item.subparts.reduce((sum, sp) => sum + (sp.marks || 0), 0);
      }
      
      // Create training question
      const trainingQuestion = new TrainingQuestion({
        paperCode: batch.paperCode,
        year: batch.year,
        session: batch.session,
        paperNumber: batch.paperNumber,
        subjectLevel: batch.subjectLevel,
        
        detectedTopics: topics,
        lessonId: lesson?._id,
        lessonTitle: lesson?.title,
        
        questionNumber: item.questionNumber,
        questionText: item.fullQuestionText,
        
        subparts: item.subparts?.map(sp => ({
          label: sp.label,
          questionText: sp.text,
          marks: sp.marks,
          answerText: item.answerData?.subparts?.find(a => a.label === sp.label)?.answerText,
          markschemeNotes: item.answerData?.subparts?.find(a => a.label === sp.label)?.examinerNotes || []
        })) || [],
        
        answerText: item.answerData?.subparts?.map(s => `(${s.label}) ${s.answerText}`).join('\n\n') || '',
        solutionSteps: item.answerData?.subparts?.[0]?.steps?.map((s, i) => ({
          step: i + 1,
          content: s.content,
          marks: s.marks
        })) || [],
        markschemeNotes: item.answerData?.subparts?.flatMap(s => s.examinerNotes || []) || [],
        
        totalMarks,
        difficulty: determineDifficulty(totalMarks),
        
        questionType: item.hasImage ? 'graphical' : 'calculation',
        mathConcepts: topics,
        requiresGraph: item.hasImage || false,
        requiresDiagram: item.hasImage || false,
        
        uploadBatchId: batch._id,
        verified: false,
        
        rawQuestionPDF: item.fullQuestionText,
        rawMarkscheme: item.answerData?.subparts?.map(s => s.answerText).join('\n') || ''
      });
      
      await trainingQuestion.save();
    }
    
    batch.topicsMapped = topicsMapped;
    await addLog('mapping', `Mapped ${topicsMapped} questions to topics`);
    
    // Complete
    batch.status = 'completed';
    batch.processedAt = new Date();
    await addLog('complete', 'Processing completed successfully!');
    await batch.save();
    
    return {
      success: true,
      extractedQuestions: batch.extractedQuestions,
      pairedQuestions: batch.pairedQuestions,
      topicsMapped: batch.topicsMapped
    };
    
  } catch (error) {
    batch.status = 'failed';
    batch.processingError = error.message;
    await addLog('error', error.message, false);
    await batch.save();
    throw error;
  }
}

/**
 * Get training statistics
 */
export async function getTrainingStats() {
  const questionStats = await TrainingQuestion.getStatsByLevel();
  const batchStats = await TrainingBatch.getUploadStats();
  
  // Get topic distribution
  const topicDistribution = await TrainingQuestion.aggregate([
    { $unwind: '$detectedTopics' },
    {
      $group: {
        _id: { level: '$subjectLevel', topic: '$detectedTopics' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Format topic distribution by level
  const topicsByLevel = {};
  for (const item of topicDistribution) {
    const level = item._id.level;
    if (!topicsByLevel[level]) topicsByLevel[level] = [];
    topicsByLevel[level].push({
      topic: item._id.topic,
      count: item.count
    });
  }
  
  return {
    byLevel: questionStats,
    batches: batchStats,
    topicsByLevel,
    totalQuestions: questionStats.reduce((sum, s) => sum + s.totalQuestions, 0)
  };
}

/**
 * Get training questions for AI context
 */
export async function getTrainingQuestionsForGeneration(subjectLevel, lessonTitle, limit = 20) {
  // First try exact lesson match
  let questions = await TrainingQuestion.find({
    subjectLevel,
    lessonTitle: new RegExp(lessonTitle, 'i')
  })
  .select('questionText answerText solutionSteps totalMarks difficulty markschemeNotes subparts')
  .limit(limit)
  .lean();
  
  // If not enough, try topic match
  if (questions.length < 5) {
    const topicQuestions = await TrainingQuestion.find({
      subjectLevel,
      $or: [
        { detectedTopics: { $in: [new RegExp(lessonTitle, 'i')] } },
        { mathConcepts: { $in: [new RegExp(lessonTitle, 'i')] } }
      ]
    })
    .select('questionText answerText solutionSteps totalMarks difficulty markschemeNotes subparts')
    .limit(limit - questions.length)
    .lean();
    
    questions = [...questions, ...topicQuestions];
  }
  
  return questions;
}

export default {
  extractPDFText,
  processTrainingBatch,
  getTrainingStats,
  getTrainingQuestionsForGeneration
};

