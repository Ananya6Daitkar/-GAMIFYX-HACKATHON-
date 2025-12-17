import db from '../connection'
import type { Competition, CompetitionParticipant, CompetitionResult } from '../models'

export const competitionRepository = {
  async getAllCompetitions(): Promise<Competition[]> {
    const result = await db.query(
      `SELECT id, title, description, difficulty, rules, requirements, 
              "xpReward", "startTime", "endTime", "createdAt", "updatedAt"
       FROM competitions
       ORDER BY "startTime" DESC`
    )
    return result.rows
  },

  async getCompetitionById(id: string): Promise<Competition | null> {
    const result = await db.query(
      `SELECT id, title, description, difficulty, rules, requirements,
              "xpReward", "startTime", "endTime", "createdAt", "updatedAt"
       FROM competitions
       WHERE id = $1`,
      [id]
    )
    return result.rows[0] || null
  },

  async createCompetition(competition: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Competition> {
    const id = crypto.randomUUID()
    const now = new Date()

    const result = await db.query(
      `INSERT INTO competitions (id, title, description, difficulty, rules, requirements,
                                 "xpReward", "startTime", "endTime", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, description, difficulty, rules, requirements,
                 "xpReward", "startTime", "endTime", "createdAt", "updatedAt"`,
      [
        id,
        competition.title,
        competition.description,
        competition.difficulty,
        competition.rules,
        competition.requirements,
        competition.xpReward,
        competition.startTime,
        competition.endTime,
        now,
        now,
      ]
    )

    return result.rows[0]
  },

  async joinCompetition(competitionId: string, userId: string): Promise<CompetitionParticipant> {
    const id = crypto.randomUUID()
    const now = new Date()

    const result = await db.query(
      `INSERT INTO competition_participants (id, "competitionId", "userId", "submissionCount", 
                                             "qualityScore", "xpEarned", "joinedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, "competitionId", "userId", "submissionCount", "qualityScore", "xpEarned", "joinedAt"`,
      [id, competitionId, userId, 0, 0, 0, now]
    )

    return result.rows[0]
  },

  async getParticipants(competitionId: string): Promise<CompetitionParticipant[]> {
    const result = await db.query(
      `SELECT id, "competitionId", "userId", "submissionCount", "qualityScore", "xpEarned", "joinedAt"
       FROM competition_participants
       WHERE "competitionId" = $1
       ORDER BY "qualityScore" DESC, "submissionCount" DESC`,
      [competitionId]
    )
    return result.rows
  },

  async getCompetitionResults(competitionId: string): Promise<CompetitionResult[]> {
    const result = await db.query(
      `SELECT "competitionId", 
              ROW_NUMBER() OVER (ORDER BY "qualityScore" DESC, "submissionCount" DESC) as rank,
              "userId", "submissionCount", "qualityScore", "xpEarned"
       FROM competition_participants
       WHERE "competitionId" = $1
       ORDER BY rank`,
      [competitionId]
    )

    return result.rows.map((row: any) => ({
      competitionId: row.competitionId,
      rank: row.rank,
      userId: row.userId,
      submissionCount: row.submissionCount,
      qualityScore: row.qualityScore,
      xpEarned: row.xpEarned,
    }))
  },

  async getUserParticipations(userId: string): Promise<{ competitionId: string }[]> {
    const result = await db.query(
      `SELECT "competitionId"
       FROM competition_participants
       WHERE "userId" = $1`,
      [userId]
    )
    return result.rows
  },

  async updateParticipantScore(
    competitionId: string,
    userId: string,
    submissionCount: number,
    qualityScore: number,
    xpEarned: number
  ): Promise<void> {
    await db.query(
      `UPDATE competition_participants
       SET "submissionCount" = $1, "qualityScore" = $2, "xpEarned" = $3
       WHERE "competitionId" = $4 AND "userId" = $5`,
      [submissionCount, qualityScore, xpEarned, competitionId, userId]
    )
  },

  async isParticipating(competitionId: string, userId: string): Promise<boolean> {
    const result = await db.query(
      `SELECT id FROM competition_participants
       WHERE "competitionId" = $1 AND "userId" = $2`,
      [competitionId, userId]
    )
    return result.rows.length > 0
  },
}
