import { competitionRepository } from '../database/repositories'
import type { Competition, CompetitionResult } from '../database/models'

export const competitionService = {
  async getAllCompetitions(): Promise<Competition[]> {
    return competitionRepository.getAllCompetitions()
  },

  async getCompetitionById(id: string): Promise<Competition | null> {
    return competitionRepository.getCompetitionById(id)
  },

  async createCompetition(
    title: string,
    description: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    rules: string,
    requirements: string,
    xpReward: number,
    startTime: Date,
    endTime: Date
  ): Promise<Competition> {
    return competitionRepository.createCompetition({
      title,
      description,
      difficulty,
      rules,
      requirements,
      xpReward,
      startTime,
      endTime,
    })
  },

  async joinCompetition(competitionId: string, userId: string): Promise<void> {
    const isParticipating = await competitionRepository.isParticipating(competitionId, userId)
    if (!isParticipating) {
      await competitionRepository.joinCompetition(competitionId, userId)
    }
  },

  async getCompetitionResults(competitionId: string): Promise<CompetitionResult[]> {
    return competitionRepository.getCompetitionResults(competitionId)
  },

  async getUserParticipations(userId: string): Promise<{ competitionId: string }[]> {
    return competitionRepository.getUserParticipations(userId)
  },

  async updateParticipantScore(
    competitionId: string,
    userId: string,
    submissionCount: number,
    qualityScore: number,
    xpEarned: number
  ): Promise<void> {
    await competitionRepository.updateParticipantScore(
      competitionId,
      userId,
      submissionCount,
      qualityScore,
      xpEarned
    )
  },

  async isParticipating(competitionId: string, userId: string): Promise<boolean> {
    return competitionRepository.isParticipating(competitionId, userId)
  },
}

export default competitionService
