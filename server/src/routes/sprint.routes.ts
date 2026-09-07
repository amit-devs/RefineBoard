import { Router } from 'express';
import { getSprints, createSprint, updateSprint } from '../controllers/sprint.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const sprintRouter = Router();

sprintRouter.use(requireAuth);

sprintRouter.get('/', getSprints);
sprintRouter.post('/', createSprint);
sprintRouter.put('/:id', updateSprint);
