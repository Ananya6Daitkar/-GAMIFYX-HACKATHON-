import express, { Router, Request, Response } from 'express'
import competitionService from '../services/competitionService'

const router = Router()

// Get all competitions
router.get('/', async (req: Request, res: Response) => {
  try {
    const competitions = await competitionService.getAllCompetitions()
    res.json({ competitions })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch competitions' })
  }
})

// Get competition by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const competition = await competitionService.getCompetitionById(id)

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' })
    }

    res.json(competition)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch competition' })
  }
})

// Get competition results/leaderboard
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const results = await competitionService.getCompetitionResults(id)

    res.json({ results })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch results' })
  }
})

// Join a competition
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    // Verify competition exists
    const competition = await competitionService.getCompetitionById(id)
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' })
    }

    // Join competition
    await competitionService.joinCompetition(id, userId)

    res.json({ message: 'Successfully joined competition' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to join competition' })
  }
})

// Get user's participations
router.get('/user/participations', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const participations = await competitionService.getUserParticipations(userId)
    res.json({ participations })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch participations' })
  }
})

// Create a new competition (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { title, description, difficulty, rules, requirements, xpReward, startTime, endTime } = req.body

    // Validate required fields
    if (!title || !description || !difficulty || !rules || !requirements || !xpReward || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const competition = await competitionService.createCompetition(
      title,
      description,
      difficulty,
      rules,
      requirements,
      xpReward,
      new Date(startTime),
      new Date(endTime)
    )

    res.status(201).json(competition)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create competition' })
  }
})

export default router
