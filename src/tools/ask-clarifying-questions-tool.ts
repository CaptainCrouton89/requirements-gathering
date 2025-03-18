/**
 * Ask Clarifying Questions Tool for requirements-gatherer
 * 
 * This tool generates and processes clarifying questions based
 * on the current state of requirements gathering.
 */
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

// Input validation schema for asking questions
const askQuestionsSchema = z.object({
  projectId: z.string(),
  generateNew: z.boolean().optional().default(false),
});

// Input validation schema for answering questions
const answerQuestionsSchema = z.object({
  projectId: z.string(),
  answers: z.record(z.string(), z.string()),
});

// Types for the tool's input
type AskQuestionsInput = z.infer<typeof askQuestionsSchema>;
type AnswerQuestionsInput = z.infer<typeof answerQuestionsSchema>;

/**
 * Generate appropriate clarifying questions based on the current requirements
 */
function generateClarifyingQuestions(requirements: any): string[] {
  // This is a simplified version - in a real application, 
  // this would use more sophisticated logic or an LLM
  
  const questions: string[] = [];
  const stage = requirements.currentStage;
  
  // Questions based on project type
  if (requirements.basicInfo.projectType === 'web') {
    questions.push('What browsers and versions need to be supported?');
    questions.push('Is this a public-facing website or internal application?');
    questions.push('What are the expected peak traffic levels?');
  } else if (requirements.basicInfo.projectType === 'mobile') {
    questions.push('Which mobile platforms need to be supported (iOS, Android, both)?');
    questions.push('What is the minimum OS version that needs to be supported?');
    questions.push('Will the app need to work offline?');
  } else if (requirements.basicInfo.projectType === 'api') {
    questions.push('What authentication mechanism should be used?');
    questions.push('What is the expected request volume?');
    questions.push('Are there any specific performance requirements?');
  }
  
  // General questions for all projects
  if (stage === 'initial') {
    questions.push('Who are the primary users of this project?');
    questions.push('What are the main goals of this project?');
    questions.push('Are there any existing systems this needs to integrate with?');
    questions.push('What are the main features required for the minimum viable product?');
    questions.push('Are there any specific technical constraints or requirements?');
  } else if (stage === 'functional') {
    questions.push('What are the critical user flows or processes?');
    questions.push('Are there any specific business rules that need to be implemented?');
    questions.push('What error cases need to be handled?');
  } else if (stage === 'non-functional') {
    questions.push('What are the performance expectations?');
    questions.push('Are there any specific security requirements?');
    questions.push('What level of availability is required?');
    questions.push('Are there any compliance requirements (GDPR, ADA, etc.)?');
  }
  
  // Return unique questions, removing any that have already been answered
  const existingQuestions = requirements.clarifyingQuestions || [];
  const answeredQuestions = Object.keys(requirements.answers || {});
  
  return [...new Set([...existingQuestions, ...questions])]
    .filter(q => !answeredQuestions.includes(q))
    .slice(0, 5); // Limit to 5 questions at a time
}

/**
 * Get current questions or generate new ones
 */
async function askClarifyingQuestions(input: AskQuestionsInput): Promise<{ 
  questions: string[],
  currentStage: string,
  progress: number
}> {
  try {
    const projectFilePath = path.join(dataDir, `${input.projectId}.json`);
    
    // Check if the project exists
    try {
      await fs.access(projectFilePath);
    } catch (error) {
      throw new Error(`Project with ID ${input.projectId} not found`);
    }
    
    // Read the current requirements
    const requirementsData = JSON.parse(
      (await fs.readFile(projectFilePath)).toString()
    );
    
    // Generate or get existing questions
    let questions: string[] = [];
    
    if (input.generateNew || requirementsData.clarifyingQuestions.length === 0) {
      questions = generateClarifyingQuestions(requirementsData);
      requirementsData.clarifyingQuestions = questions;
      
      // Update the file with new questions
      await fs.writeFile(
        projectFilePath, 
        JSON.stringify(requirementsData, null, 2)
      );
    } else {
      questions = requirementsData.clarifyingQuestions;
    }
    
    // Calculate progress (simplified)
    const answeredCount = Object.keys(requirementsData.answers || {}).length;
    const progress = Math.min(100, Math.floor((answeredCount / 20) * 100));
    
    return {
      questions,
      currentStage: requirementsData.currentStage,
      progress
    };
  } catch (error) {
    console.error('Error in ask clarifying questions tool:', error);
    throw new Error('Failed to get clarifying questions');
  }
}

/**
 * Process answers to clarifying questions
 */
async function answerClarifyingQuestions(input: AnswerQuestionsInput): Promise<{ 
  success: boolean,
  message: string,
  updatedStage: string,
  progress: number,
  nextSteps: string[]
}> {
  try {
    const projectFilePath = path.join(dataDir, `${input.projectId}.json`);
    
    // Check if the project exists
    try {
      await fs.access(projectFilePath);
    } catch (error) {
      throw new Error(`Project with ID ${input.projectId} not found`);
    }
    
    // Read the current requirements
    const requirementsData = JSON.parse(
      (await fs.readFile(projectFilePath)).toString()
    );
    
    // Update the answers
    requirementsData.answers = {
      ...requirementsData.answers,
      ...input.answers
    };
    
    // Remove answered questions from the active questions list
    const answeredQuestionKeys = Object.keys(input.answers);
    requirementsData.clarifyingQuestions = 
      requirementsData.clarifyingQuestions.filter(
        (q: string) => !answeredQuestionKeys.includes(q)
      );
    
    // Update the stage if needed
    const answeredCount = Object.keys(requirementsData.answers).length;
    let updatedStage = requirementsData.currentStage;
    
    if (answeredCount >= 5 && updatedStage === 'initial') {
      updatedStage = 'functional';
    } else if (answeredCount >= 10 && updatedStage === 'functional') {
      updatedStage = 'non-functional';
    } else if (answeredCount >= 15 && updatedStage === 'non-functional') {
      updatedStage = 'complete';
    }
    
    requirementsData.currentStage = updatedStage;
    
    // Process the answers to categorize them (simplified)
    // In a real application, this would use more sophisticated logic or an LLM
    answeredQuestionKeys.forEach(question => {
      const answer = input.answers[question];
      
      // Simplified logic for categorizing answers
      if (question.toLowerCase().includes('feature') || 
          question.toLowerCase().includes('user') ||
          question.toLowerCase().includes('process')) {
        requirementsData.requirementCategories.functional.push({
          question,
          answer,
          source: 'clarifying-question'
        });
      } else if (question.toLowerCase().includes('performance') || 
                question.toLowerCase().includes('security') ||
                question.toLowerCase().includes('availability')) {
        requirementsData.requirementCategories.nonFunctional.push({
          question,
          answer,
          source: 'clarifying-question'
        });
      } else if (question.toLowerCase().includes('constraint') || 
                question.toLowerCase().includes('limitation')) {
        requirementsData.requirementCategories.constraints.push({
          question,
          answer,
          source: 'clarifying-question'
        });
      } else {
        // Default to functional requirement
        requirementsData.requirementCategories.functional.push({
          question,
          answer,
          source: 'clarifying-question'
        });
      }
    });
    
    // Save the updated requirements
    await fs.writeFile(
      projectFilePath, 
      JSON.stringify(requirementsData, null, 2)
    );
    
    // Calculate progress
    const progress = Math.min(100, Math.floor((answeredCount / 20) * 100));
    
    // Determine next steps
    let nextSteps = [
      'Continue answering the current set of questions.',
      'You can also generate new questions with the "ask-clarifying-questions" tool.',
    ];
    
    if (updatedStage === 'complete') {
      nextSteps = [
        'You\'ve completed the clarifying questions process.',
        'You can now generate your specifications document with the "generate-specification" tool.',
      ];
    }
    
    return {
      success: true,
      message: 'Answers processed successfully',
      updatedStage,
      progress,
      nextSteps
    };
  } catch (error) {
    console.error('Error in answer clarifying questions tool:', error);
    throw new Error('Failed to process answers');
  }
}

// Get or generate clarifying questions endpoint
router.post('/ask', 
  // Validation middleware
  body('projectId').isString().notEmpty().withMessage('Project ID is required'),
  body('generateNew').optional().isBoolean(),
  
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Parse and validate input
      const parsedInput = askQuestionsSchema.safeParse(req.body);
      
      if (!parsedInput.success) {
        return res.status(400).json({ 
          error: 'Invalid input',
          details: parsedInput.error.format() 
        });
      }
      
      // Process the request
      const result = await askClarifyingQuestions(parsedInput.data);
      
      // Return the result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing ask questions request:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process the request'
      });
    }
  }
);

// Answer clarifying questions endpoint
router.post('/answer', 
  // Validation middleware
  body('projectId').isString().notEmpty().withMessage('Project ID is required'),
  body('answers').isObject().notEmpty().withMessage('Answers object is required'),
  
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Parse and validate input
      const parsedInput = answerQuestionsSchema.safeParse(req.body);
      
      if (!parsedInput.success) {
        return res.status(400).json({ 
          error: 'Invalid input',
          details: parsedInput.error.format() 
        });
      }
      
      // Process the request
      const result = await answerClarifyingQuestions(parsedInput.data);
      
      // Return the result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing answer questions request:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process the request'
      });
    }
  }
);

export default router; 