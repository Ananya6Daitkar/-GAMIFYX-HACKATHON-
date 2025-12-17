import pool from '../connection'
import { Assignment } from '../models'

export class AssignmentRepository {
  async findById(id: string): Promise<Assignment | null> {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async findByTeacherId(teacherId: string): Promise<Assignment[]> {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC',
      [teacherId]
    )
    return result.rows
  }

  async findAll(): Promise<Assignment[]> {
    const result = await pool.query(
      'SELECT * FROM assignments ORDER BY deadline ASC'
    )
    return result.rows
  }

  async create(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const result = await pool.query(
      `INSERT INTO assignments (teacher_id, title, description, difficulty, xp_reward, required_files, expected_folder_structure, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        assignment.teacherId,
        assignment.title,
        assignment.description,
        assignment.difficulty,
        assignment.xpReward,
        assignment.requiredFiles,
        assignment.expectedFolderStructure || null,
        assignment.deadline,
      ]
    )
    return result.rows[0]
  }

  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.title) {
      fields.push(`title = $${paramCount++}`)
      values.push(updates.title)
    }
    if (updates.description) {
      fields.push(`description = $${paramCount++}`)
      values.push(updates.description)
    }
    if (updates.difficulty) {
      fields.push(`difficulty = $${paramCount++}`)
      values.push(updates.difficulty)
    }
    if (updates.xpReward !== undefined) {
      fields.push(`xp_reward = $${paramCount++}`)
      values.push(updates.xpReward)
    }
    if (updates.requiredFiles) {
      fields.push(`required_files = $${paramCount++}`)
      values.push(updates.requiredFiles)
    }
    if (updates.expectedFolderStructure) {
      fields.push(`expected_folder_structure = $${paramCount++}`)
      values.push(updates.expectedFolderStructure)
    }
    if (updates.deadline) {
      fields.push(`deadline = $${paramCount++}`)
      values.push(updates.deadline)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM assignments WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  }
}

export default new AssignmentRepository()
