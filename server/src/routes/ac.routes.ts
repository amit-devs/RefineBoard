import { Router } from 'express';
import {
  getCriteriaByStory,
  addCriterion,
  updateCriterion,
  deleteCriterion,
} from '../controllers/ac.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const acRouter = Router();

acRouter.use(requireAuth);

acRouter.get('/stories/:storyId/acceptance-criteria', getCriteriaByStory);
acRouter.post('/stories/:storyId/acceptance-criteria', addCriterion);
acRouter.put('/acceptance-criteria/:id', updateCriterion);
acRouter.delete('/acceptance-criteria/:id', deleteCriterion);
