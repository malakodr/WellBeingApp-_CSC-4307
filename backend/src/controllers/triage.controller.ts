import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { detectRisk } from '../lib/riskDetection';

const triageSchema = z.object({
  topic: z.string().min(1),
  moodScore: z.number().min(1).max(5),
  urgency: z.enum(['Low', 'Medium', 'High']),
  message: z.string().optional(),
});

export const createTriage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = triageSchema.parse(req.body);

    // Detect risk based on message content
    const riskFlag = validatedData.message
      ? detectRisk(validatedData.message)
      : false;

    // Determine routing based on risk, urgency, and mood
    let route: 'CRISIS' | 'BOOK' | 'PEER';
    
    if (riskFlag) {
      route = 'CRISIS';
    } else if (validatedData.urgency === 'High') {
      route = 'BOOK';
    } else {
      route = 'PEER';
    }

    // Save triage form
    const triageForm = await prisma.triageForm.create({
      data: {
        userId: req.user!.id,
        topic: validatedData.topic,
        moodScore: validatedData.moodScore,
        urgency: validatedData.urgency,
        message: validatedData.message,
        riskFlag,
        route,
      },
    });

    // If high risk, create a crisis alert
    if (riskFlag) {
      await prisma.crisisAlert.create({
        data: {
          userId: req.user!.id,
          message: validatedData.message || `High-risk triage detected: ${validatedData.topic}`,
        },
      });
    }

    // Build response based on route
    let response: any = {
      id: triageForm.id,
      route,
      riskFlag,
    };

    if (route === 'CRISIS') {
      response = {
        ...response,
        numbers: ['141', '112'],
        bannerText: 'If you feel unsafe, please call now.',
      };
    } else if (route === 'BOOK') {
      response = {
        ...response,
        counselorFilters: {
          topic: validatedData.topic,
        },
      };
    } else if (route === 'PEER') {
      response = {
        ...response,
        room: `${validatedData.topic.toLowerCase()}-support`,
      };
    }

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Create triage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTriages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const triages = await prisma.triageForm.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ triages });
  } catch (error) {
    console.error('Get triages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
