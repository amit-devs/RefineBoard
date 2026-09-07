import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let settings = await prisma.appSettings.findFirst();

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 'default',
          workspaceName: 'E-Commerce Platform',
          defaultPriority: 'medium',
          defaultDevStatus: 'draft',
          defaultRefinementStage: 'draft',
          dorQualityThreshold: 70,
          activeSprint: 'sprint-4',
        },
      });
    }

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const changes = req.body;

    const settings = await prisma.appSettings.upsert({
      where: { id: 'default' },
      update: changes,
      create: {
        id: 'default',
        workspaceName: changes.workspaceName || 'E-Commerce Platform',
        defaultPriority: changes.defaultPriority || 'medium',
        defaultDevStatus: changes.defaultDevStatus || 'draft',
        defaultRefinementStage: changes.defaultRefinementStage || 'draft',
        dorQualityThreshold: changes.dorQualityThreshold !== undefined ? changes.dorQualityThreshold : 70,
        activeSprint: changes.activeSprint || 'sprint-4',
      },
    });

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}
