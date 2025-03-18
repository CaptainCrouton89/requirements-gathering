/**
 * Example Resource for requirements-gatherer
 * 
 * This is a simple example resource that demonstrates the basic structure
 * of an MCP server resource with REST endpoints.
 */
import { Router } from 'express';
import { z } from 'zod';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// Simple in-memory storage for the example
const exampleItems: Record<string, ExampleItem> = {};

// Resource schema
const exampleItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type for the resource
type ExampleItem = z.infer<typeof exampleItemSchema>;

// GET all items
router.get('/', (req, res) => {
  const items = Object.values(exampleItems);
  res.status(200).json({ items });
});

// GET item by ID
router.get('/:id', 
  param('id').isString().notEmpty().withMessage('Valid ID is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const item = exampleItems[id];

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  }
);

// CREATE item
router.post('/',
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const parsedInput = exampleItemSchema.safeParse(req.body);
      
      if (!parsedInput.success) {
        return res.status(400).json({ 
          error: 'Invalid input',
          details: parsedInput.error.format() 
        });
      }

      const now = new Date();
      const id = `example-${Date.now()}`;
      
      const newItem: ExampleItem = {
        ...parsedInput.data,
        id,
        createdAt: now,
        updatedAt: now
      };

      exampleItems[id] = newItem;
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }
);

// UPDATE item
router.put('/:id',
  param('id').isString().notEmpty().withMessage('Valid ID is required'),
  body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const existingItem = exampleItems[id];

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    try {
      // Only update fields that are provided
      const updatedItem: ExampleItem = {
        ...existingItem,
        ...req.body,
        id, // Ensure ID remains the same
        updatedAt: new Date()
      };

      exampleItems[id] = updatedItem;
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }
);

// DELETE item
router.delete('/:id',
  param('id').isString().notEmpty().withMessage('Valid ID is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    if (!exampleItems[id]) {
      return res.status(404).json({ error: 'Item not found' });
    }

    delete exampleItems[id];
    
    res.status(204).send();
  }
);

export default router; 