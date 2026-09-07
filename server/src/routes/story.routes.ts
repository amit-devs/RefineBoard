import { Router } from 'express';
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  reorderStories,
  addDependency,
  removeDependency,
} from '../controllers/story.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const storyRouter = Router();

// Protect all story operations
storyRouter.use(requireAuth);

storyRouter.get('/', getStories);
storyRouter.post('/', createStory);
storyRouter.put('/reorder', reorderStories);
storyRouter.get('/:id', getStoryById);
storyRouter.put('/:id', updateStory);
storyRouter.delete('/:id', deleteStory);
storyRouter.post('/:id/dependencies', addDependency);
storyRouter.delete('/:id/dependencies/:depTargetId', removeDependency);
