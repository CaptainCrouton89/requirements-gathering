/**
 * Generate Specification Tool for requirements-gatherer
 * 
 * This tool creates a detailed specifications document based
 * on the gathered requirements and answers to clarifying questions.
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

// Input validation schema
const generateSpecificationSchema = z.object({
  projectId: z.string(),
  format: z.enum(['markdown', 'json']).optional().default('markdown'),
  includeSections: z.array(z.string()).optional(),
});

// Type for the tool's input
type GenerateSpecificationInput = z.infer<typeof generateSpecificationSchema>;

/**
 * Generate a specifications document based on gathered requirements
 */
async function generateSpecification(input: GenerateSpecificationInput): Promise<{ 
  success: boolean,
  specification: string,
  format: string,
  sections: string[]
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
    
    // Check if we have enough information to generate a specification
    const answeredCount = Object.keys(requirementsData.answers || {}).length;
    if (answeredCount < 5) {
      throw new Error('Not enough information gathered. Please answer more clarifying questions.');
    }
    
    // Determine which sections to include
    const allSections = [
      'overview',
      'functionalRequirements',
      'nonFunctionalRequirements',
      'constraints',
      'assumptions',
      'stakeholders',
      'glossary'
    ];
    
    const includeSections = input.includeSections || allSections;
    
    // Generate the specification document
    const specification = generateSpecificationDocument(
      requirementsData, 
      input.format, 
      includeSections
    );
    
    return {
      success: true,
      specification,
      format: input.format,
      sections: includeSections
    };
  } catch (error) {
    console.error('Error in generate specification tool:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate specification');
  }
}

/**
 * Generate the specifications document in the requested format
 */
function generateSpecificationDocument(
  requirements: any, 
  format: string,
  includeSections: string[]
): string {
  if (format === 'json') {
    return generateJsonSpecification(requirements, includeSections);
  } else {
    return generateMarkdownSpecification(requirements, includeSections);
  }
}

/**
 * Generate a JSON specifications document
 */
function generateJsonSpecification(requirements: any, includeSections: string[]): string {
  const specification: any = {
    specificationVersion: '1.0',
    generatedAt: new Date().toISOString(),
    projectId: requirements.projectId
  };
  
  // Add basic information
  if (includeSections.includes('overview')) {
    specification.overview = {
      projectName: requirements.basicInfo.projectName,
      projectDescription: requirements.basicInfo.projectDescription,
      projectType: requirements.basicInfo.projectType,
      projectTypeDetails: requirements.basicInfo.projectTypeDetails || '',
      targetCompletion: requirements.basicInfo.targetCompletion || 'Not specified'
    };
  }
  
  // Add stakeholders
  if (includeSections.includes('stakeholders')) {
    specification.stakeholders = requirements.basicInfo.stakeholders || [];
  }
  
  // Add functional requirements
  if (includeSections.includes('functionalRequirements')) {
    specification.functionalRequirements = requirements.requirementCategories.functional.map(
      (req: any, index: number) => ({
        id: `F${index + 1}`,
        description: req.answer,
        source: req.source,
        relatedQuestion: req.question
      })
    );
  }
  
  // Add non-functional requirements
  if (includeSections.includes('nonFunctionalRequirements')) {
    specification.nonFunctionalRequirements = requirements.requirementCategories.nonFunctional.map(
      (req: any, index: number) => ({
        id: `NF${index + 1}`,
        description: req.answer,
        source: req.source,
        relatedQuestion: req.question
      })
    );
  }
  
  // Add constraints
  if (includeSections.includes('constraints')) {
    specification.constraints = requirements.requirementCategories.constraints.map(
      (req: any, index: number) => ({
        id: `C${index + 1}`,
        description: req.answer,
        source: req.source,
        relatedQuestion: req.question
      })
    );
  }
  
  // Add assumptions
  if (includeSections.includes('assumptions')) {
    specification.assumptions = requirements.requirementCategories.assumptions.map(
      (req: any, index: number) => ({
        id: `A${index + 1}`,
        description: req.answer,
        source: req.source,
        relatedQuestion: req.question
      })
    );
  }
  
  // Add glossary (would be more sophisticated in a real application)
  if (includeSections.includes('glossary')) {
    specification.glossary = [];
  }
  
  return JSON.stringify(specification, null, 2);
}

/**
 * Generate a Markdown specifications document
 */
function generateMarkdownSpecification(requirements: any, includeSections: string[]): string {
  let markdown = '';
  
  // Title
  markdown += `# Requirements Specification: ${requirements.basicInfo.projectName}\n\n`;
  
  // Metadata
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Project ID:** ${requirements.projectId}\n\n`;
  
  // Overview
  if (includeSections.includes('overview')) {
    markdown += `## 1. Overview\n\n`;
    markdown += `### 1.1 Project Description\n\n${requirements.basicInfo.projectDescription}\n\n`;
    markdown += `### 1.2 Project Type\n\n${requirements.basicInfo.projectType}`;
    
    if (requirements.basicInfo.projectTypeDetails) {
      markdown += ` (${requirements.basicInfo.projectTypeDetails})`;
    }
    
    markdown += `\n\n`;
    
    if (requirements.basicInfo.targetCompletion) {
      markdown += `### 1.3 Target Completion\n\n${requirements.basicInfo.targetCompletion}\n\n`;
    }
  }
  
  // Stakeholders
  if (includeSections.includes('stakeholders') && requirements.basicInfo.stakeholders?.length > 0) {
    markdown += `## 2. Stakeholders\n\n`;
    
    requirements.basicInfo.stakeholders.forEach((stakeholder: string, index: number) => {
      markdown += `${index + 1}. ${stakeholder}\n`;
    });
    
    markdown += `\n`;
  }
  
  // Functional Requirements
  if (includeSections.includes('functionalRequirements')) {
    markdown += `## 3. Functional Requirements\n\n`;
    
    if (requirements.requirementCategories.functional.length === 0) {
      markdown += `No functional requirements have been defined yet.\n\n`;
    } else {
      requirements.requirementCategories.functional.forEach((req: any, index: number) => {
        markdown += `### 3.${index + 1} [F${index + 1}] ${req.question}\n\n${req.answer}\n\n`;
      });
    }
  }
  
  // Non-Functional Requirements
  if (includeSections.includes('nonFunctionalRequirements')) {
    markdown += `## 4. Non-Functional Requirements\n\n`;
    
    if (requirements.requirementCategories.nonFunctional.length === 0) {
      markdown += `No non-functional requirements have been defined yet.\n\n`;
    } else {
      requirements.requirementCategories.nonFunctional.forEach((req: any, index: number) => {
        markdown += `### 4.${index + 1} [NF${index + 1}] ${req.question}\n\n${req.answer}\n\n`;
      });
    }
  }
  
  // Constraints
  if (includeSections.includes('constraints')) {
    markdown += `## 5. Constraints\n\n`;
    
    if (requirements.requirementCategories.constraints.length === 0) {
      markdown += `No constraints have been defined yet.\n\n`;
    } else {
      requirements.requirementCategories.constraints.forEach((req: any, index: number) => {
        markdown += `### 5.${index + 1} [C${index + 1}] ${req.question}\n\n${req.answer}\n\n`;
      });
    }
  }
  
  // Assumptions
  if (includeSections.includes('assumptions')) {
    markdown += `## 6. Assumptions\n\n`;
    
    if (requirements.requirementCategories.assumptions.length === 0) {
      markdown += `No assumptions have been defined yet.\n\n`;
    } else {
      requirements.requirementCategories.assumptions.forEach((req: any, index: number) => {
        markdown += `### 6.${index + 1} [A${index + 1}] ${req.question}\n\n${req.answer}\n\n`;
      });
    }
  }
  
  // Glossary (would be more sophisticated in a real application)
  if (includeSections.includes('glossary')) {
    markdown += `## 7. Glossary\n\n`;
    markdown += `No glossary terms have been defined yet.\n\n`;
  }
  
  return markdown;
}

// Generate specification endpoint
router.post('/', 
  // Validation middleware
  body('projectId').isString().notEmpty().withMessage('Project ID is required'),
  body('format').optional().isIn(['markdown', 'json']),
  body('includeSections').optional().isArray(),
  
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Parse and validate input
      const parsedInput = generateSpecificationSchema.safeParse(req.body);
      
      if (!parsedInput.success) {
        return res.status(400).json({ 
          error: 'Invalid input',
          details: parsedInput.error.format() 
        });
      }
      
      // Process the request
      const result = await generateSpecification(parsedInput.data);
      
      // Return the result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing generate specification request:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process the request'
      });
    }
  }
);

export default router; 