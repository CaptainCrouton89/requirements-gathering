/**
 * Example Tool for requirements-gatherer
 *
 * This is a simple example tool that demonstrates the basic structure
 * of an MCP server tool.
 */
import { Router } from 'express';
import { z } from 'zod';
import { body, validationResult } from 'express-validator';
const router = Router();
// Input validation schema
const exampleSchema = z.object({
    message: z.string().min(1).max(500),
    echo: z.boolean().optional().default(false),
});
/**
 * Example tool handler
 */
async function exampleTool(input) {
    try {
        const { message, echo } = input;
        // Simple processing logic
        const response = echo
            ? `Echo: ${message}`
            : `Received your message: "${message}". This is the example tool response.`;
        return { response };
    }
    catch (error) {
        console.error('Error in example tool:', error);
        throw new Error('Failed to process example tool request');
    }
}
// Example tool endpoint
router.post('/', 
// Validation middleware
body('message').isString().notEmpty().withMessage('Message is required'), body('echo').optional().isBoolean().withMessage('Echo must be a boolean'), async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Parse and validate input
        const parsedInput = exampleSchema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsedInput.error.format()
            });
        }
        // Process the request
        const result = await exampleTool(parsedInput.data);
        // Return the result
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error processing example tool request:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process the request'
        });
    }
});
export default router;
//# sourceMappingURL=example-tool.js.map