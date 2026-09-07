import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getSprints(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sprints = await prisma.sprint.findMany({
      orderBy: { startDate: 'asc' },
    });
    res.status(200).json(sprints);
  } catch (err) {
    next(err);
  }
}

export async function createSprint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const sprint = await prisma.sprint.create({ data });
    res.status(201).json(sprint);
  } catch (err) {
    next(err);
  }
}

export async function updateSprint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const sprint = await prisma.sprint.update({
      where: { id },
      data,
    });
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}
