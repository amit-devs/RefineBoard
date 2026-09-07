import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

function formatStory(story: any) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(story.tags || '[]');
  } catch {
    tags = [];
  }

  return {
    id: story.id,
    title: story.title,
    asA: story.asA,
    iWant: story.iWant,
    soThat: story.soThat,
    priority: story.priority,
    devStatus: story.devStatus,
    refinementStage: story.refinementStage,
    storyPoints: story.storyPoints,
    businessValue: story.businessValue,
    effort: story.effort,
    sprint: story.sprintId || '',
    assignee: story.assignee || '',
    tags,
    dependenciesReviewed: story.dependenciesReviewed,
    qualityScore: story.qualityScore,
    position: story.position,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
    acceptanceCriteria: (story.acceptanceCriteria || []).map((ac: any) => ({
      id: ac.id,
      given: ac.given,
      when: ac.when,
      then: ac.then,
      completed: ac.completed,
      testability: ac.testability,
    })),
    dependencies: (story.dependencies || []).map((dep: any) => ({
      id: dep.targetStoryId,
      title: dep.title,
      type: dep.type,
    })),
    activityLog: (story.activityLog || []).map((act: any) => ({
      id: act.id,
      timestamp: act.timestamp.toISOString(),
      field: act.field,
      description: act.description,
      oldValue: act.oldValue || undefined,
      newValue: act.newValue || undefined,
      author: act.author || undefined,
    })),
  };
}

export async function getStories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stories = await prisma.userStory.findMany({
      orderBy: { position: 'asc' },
      include: {
        acceptanceCriteria: true,
        dependencies: true,
        activityLog: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    res.status(200).json(stories.map(formatStory));
  } catch (err) {
    next(err);
  }
}

export async function getStoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const story = await prisma.userStory.findUnique({
      where: { id },
      include: {
        acceptanceCriteria: true,
        dependencies: true,
        activityLog: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!story) {
      res.status(404).json({ error: `User story ${id} not found.` });
      return;
    }

    res.status(200).json(formatStory(story));
  } catch (err) {
    next(err);
  }
}

export async function createStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    if (!data.id || !data.title) {
      res.status(400).json({ error: 'Story ID and title are required.' });
      return;
    }

    const count = await prisma.userStory.count();
    const position = data.position !== undefined ? data.position : count + 1;

    const created = await prisma.userStory.create({
      data: {
        id: data.id,
        title: data.title,
        asA: data.asA || '',
        iWant: data.iWant || '',
        soThat: data.soThat || '',
        priority: data.priority || 'medium',
        devStatus: data.devStatus || 'draft',
        refinementStage: data.refinementStage || 'draft',
        storyPoints: data.storyPoints || 0,
        businessValue: data.businessValue !== undefined ? data.businessValue : 5,
        effort: data.effort !== undefined ? data.effort : 5,
        sprintId: data.sprint || null,
        assignee: data.assignee || null,
        tags: JSON.stringify(data.tags || []),
        dependenciesReviewed: data.dependenciesReviewed || false,
        qualityScore: data.qualityScore || 0,
        position,
        activityLog: {
          create: {
            field: 'created',
            description: `Story ${data.id} created`,
            author: req.user?.email || 'System',
          },
        },
      },
      include: {
        acceptanceCriteria: true,
        dependencies: true,
        activityLog: { orderBy: { timestamp: 'desc' } },
      },
    });

    res.status(201).json(formatStory(created));
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: `Story with ID ${req.body.id} already exists.` });
      return;
    }
    next(err);
  }
}

export async function updateStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { changes, activityEntry } = req.body;

    const updateData: any = {};
    if (changes.title !== undefined) updateData.title = changes.title;
    if (changes.asA !== undefined) updateData.asA = changes.asA;
    if (changes.iWant !== undefined) updateData.iWant = changes.iWant;
    if (changes.soThat !== undefined) updateData.soThat = changes.soThat;
    if (changes.priority !== undefined) updateData.priority = changes.priority;
    if (changes.devStatus !== undefined) updateData.devStatus = changes.devStatus;
    if (changes.refinementStage !== undefined) updateData.refinementStage = changes.refinementStage;
    if (changes.storyPoints !== undefined) updateData.storyPoints = changes.storyPoints;
    if (changes.businessValue !== undefined) updateData.businessValue = changes.businessValue;
    if (changes.effort !== undefined) updateData.effort = changes.effort;
    if (changes.sprint !== undefined) updateData.sprintId = changes.sprint || null;
    if (changes.assignee !== undefined) updateData.assignee = changes.assignee;
    if (changes.tags !== undefined) updateData.tags = JSON.stringify(changes.tags);
    if (changes.dependenciesReviewed !== undefined) updateData.dependenciesReviewed = changes.dependenciesReviewed;
    if (changes.qualityScore !== undefined) updateData.qualityScore = changes.qualityScore;
    if (changes.position !== undefined) updateData.position = changes.position;

    if (activityEntry) {
      updateData.activityLog = {
        create: {
          field: activityEntry.field || 'updated',
          description: activityEntry.description || 'Updated',
          oldValue: activityEntry.oldValue ? String(activityEntry.oldValue) : null,
          newValue: activityEntry.newValue ? String(activityEntry.newValue) : null,
          author: activityEntry.author || req.user?.email || null,
        },
      };
    }

    const updated = await prisma.userStory.update({
      where: { id },
      data: updateData,
      include: {
        acceptanceCriteria: true,
        dependencies: true,
        activityLog: { orderBy: { timestamp: 'desc' } },
      },
    });

    res.status(200).json(formatStory(updated));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: `Story ${req.params.id} not found.` });
      return;
    }
    next(err);
  }
}

export async function deleteStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.userStory.delete({
      where: { id },
    });
    res.status(200).json({ message: `Story ${id} deleted successfully.` });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: `Story ${req.params.id} not found.` });
      return;
    }
    next(err);
  }
}

export async function reorderStories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds must be an array of story IDs.' });
      return;
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.userStory.update({
          where: { id },
          data: { position: index + 1 },
        })
      )
    );

    res.status(200).json({ message: 'Stories reordered successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function addDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { targetStoryId, title, type } = req.body;

    if (!targetStoryId || !title) {
      res.status(400).json({ error: 'targetStoryId and title are required.' });
      return;
    }

    const created = await prisma.storyDependency.create({
      data: {
        storyId: id,
        targetStoryId,
        title,
        type: type || 'depends-on',
      },
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function removeDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const depTargetId = req.params.depTargetId as string;

    await prisma.storyDependency.deleteMany({
      where: {
        storyId: id,
        targetStoryId: depTargetId,
      },
    });

    res.status(200).json({ message: 'Dependency removed successfully.' });
  } catch (err) {
    next(err);
  }
}
