/**
 * Start Requirements Tool for requirements-gatherer
 *
 * This tool initializes the requirements gathering process
 * and collects basic project information.
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
const startRequirementsSchema = z.object({
    projectName: z.string().min(1).max(100),
    projectDescription: z.string().min(1).max(1000),
    projectType: z.enum(['web', 'mobile', 'desktop', 'api', 'other']),
    projectTypeDetails: z.string().optional(),
    targetCompletion: z.string().optional(),
    stakeholders: z.array(z.string()).optional(),
});
/**
 * Start requirements tool handler
 */
async function startRequirementsTool(input) {
    try {
        // Create a project ID based on the name and timestamp
        const timestamp = Date.now();
        const projectId = `${input.projectName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
        // Ensure data directory exists
        try {
            await fs.mkdir(dataDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating data directory:', error);
        }
        // Store initial requirements
        const requirementsData = {
            projectId,
            timestamp,
            basicInfo: input,
            clarifyingQuestions: [],
            answers: {},
            requirementCategories: {
                functional: [],
                nonFunctional: [],
                constraints: [],
                assumptions: []
            },
            currentStage: 'initial',
        };
        const projectFilePath = path.join(dataDir, `${projectId}.json`);
        await fs.writeFile(projectFilePath, JSON.stringify(requirementsData, null, 2));
        return {
            success: true,
            projectId,
            message: `Requirements gathering process started for ${input.projectName}`,
            nextSteps: [
                'We will now ask you clarifying questions to gather more details about your project.',
                'Use the "ask-clarifying-questions" tool to continue the process.',
            ]
        };
    }
    catch (error) {
        console.error('Error in start requirements tool:', error);
        throw new Error('Failed to start requirements gathering process');
    }
}
// Start requirements tool endpoint
router.post('/', 
// Validation middleware
body('projectName').isString().notEmpty().withMessage('Project name is required'), body('projectDescription').isString().notEmpty().withMessage('Project description is required'), body('projectType').isIn(['web', 'mobile', 'desktop', 'api', 'other']).withMessage('Valid project type is required'), body('projectTypeDetails').optional().isString(), body('targetCompletion').optional().isString(), body('stakeholders').optional().isArray(), async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Parse and validate input
        const parsedInput = startRequirementsSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsedInput.error.format()
            });
        }
        // Process the request
        const result = await startRequirementsTool(parsedInput.data);
        // Return the result
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error processing start requirements request:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process the request'
        });
    }
});
export default router;
//# sourceMappingURL=start-requirements-tool.js.map