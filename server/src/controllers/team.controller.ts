import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
}

export async function createTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const member = await prisma.teamMember.create({ data });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}
