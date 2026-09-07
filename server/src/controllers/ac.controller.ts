import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getCriteriaByStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = req.params.storyId as string;
    const criteria = await prisma.acceptanceCriterion.findMany({
      where: { storyId },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(criteria);
  } catch (err) {
    next(err);
  }
}

export async function addCriterion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = req.params.storyId as string;
    const { id, given, when, then, completed, testability } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Criterion ID is required.' });
      return;
    }

    const created = await prisma.acceptanceCriterion.create({
      data: {
        id,
        storyId,
        given: given || '',
        when: when || '',
        then: then || '',
        completed: completed || false,
        testability: testability || 'needs-clarification',
      },
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateCriterion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const changes = req.body;

    const updated = await prisma.acceptanceCriterion.update({
      where: { id },
      data: changes,
    });

    res.status(200).json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: `Acceptance criterion ${req.params.id} not found.` });
      return;
    }
    next(err);
  }
}

export async function deleteCriterion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    await prisma.acceptanceCriterion.delete({
      where: { id },
    });

    res.status(200).json({ message: `Acceptance criterion ${id} deleted successfully.` });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: `Acceptance criterion ${req.params.id} not found.` });
      return;
    }
    next(err);
  }
}
