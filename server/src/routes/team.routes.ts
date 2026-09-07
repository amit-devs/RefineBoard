import { Router } from 'express';
import { getTeam, createTeamMember } from '../controllers/team.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const teamRouter = Router();

teamRouter.use(requireAuth);

teamRouter.get('/', getTeam);
teamRouter.post('/', createTeamMember);
