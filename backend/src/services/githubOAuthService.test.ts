import { describe, it, expect, beforeEach, vi } from 'vitest'
import GitHubOAuthService from './githubOAuthService'
import githubUserRepository from '../database/repositories/githubUserRepository'
import userRepository from '../database/repositories/userRepository'

// Mock repositories and fetch
vi.mock('../database/repositories/githubUserRepository')
vi.mock('../database/repositories/userRepository')
global.fetch = vi.fn()

describe('GitHubOAuthService', () => {
  let service: GitHubOAuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new GitHubOAuthService({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:5000/callback',
    })
  })

  describe('getAuthorizationUrl', () => {
    it('should generate a valid GitHub authorization URL', () => {
      const state = 'test-state-123'
      const url = service.getAuthorizationUrl(state)

      expect(url).toContain('https://github.com/login/oauth/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fcallback')
      expect(url).toContain('scope=repo%2Cuser')
      expect(url).toContain(`state=${state}`)
    })
  })

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for access token', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as any)

      const result = await service.exchangeCodeForToken('test-code')

      expect(result).toEqual(mockTokenResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      )
    })

    it('should throw error if token exchange fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as any)

      await expect(service.exchangeCodeForToken('test-code')).rejects.toThrow(
        'Failed to exchange code for token'
      )
    })
  })

  describe('fetchGitHubUser', () => {
    it('should fetch GitHub user data', async () => {
      const mockUserData = {
        id: 12345,
        login: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      } as any)

      const result = await service.fetchGitHubUser('test-access-token')

      expect(result).toEqual(mockUserData)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      )
    })

    it('should throw error if fetching user data fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as any)

      await expect(service.fetchGitHubUser('test-access-token')).rejects.toThrow(
        'Failed to fetch GitHub user data'
      )
    })
  })

  describe('handleOAuthCallback', () => {
    it('should create new GitHub user link on first OAuth', async () => {
      const userId = 'gamifyx-user-123'
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
      }
      const mockGitHubUser = {
        id: 12345,
        login: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      }
      const mockGamifyXUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'student',
      }
      const mockGitHubUserRecord = {
        id: 'github-user-1',
        userId,
        githubUsername: 'testuser',
        githubId: 12345,
        githubToken: 'test-access-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGitHubUser,
        } as any)

      vi.mocked(githubUserRepository.findByGithubId).mockResolvedValue(null)
      vi.mocked(githubUserRepository.create).mockResolvedValue(mockGitHubUserRecord as any)
      vi.mocked(userRepository.findById).mockResolvedValue(mockGamifyXUser as any)

      const result = await service.handleOAuthCallback('test-code', userId)

      expect(result.user).toEqual(mockGamifyXUser)
      expect(result.githubUser).toEqual(mockGitHubUserRecord)
      expect(githubUserRepository.create).toHaveBeenCalled()
    })

    it('should update existing GitHub user token on re-auth', async () => {
      const userId = 'gamifyx-user-123'
      const mockTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'bearer',
        expires_in: 3600,
      }
      const mockGitHubUser = {
        id: 12345,
        login: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      }
      const mockGamifyXUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'student',
      }
      const existingGitHubUserRecord = {
        id: 'github-user-1',
        userId,
        githubUsername: 'testuser',
        githubId: 12345,
        githubToken: 'old-access-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const updatedGitHubUserRecord = {
        ...existingGitHubUserRecord,
        githubToken: 'new-access-token',
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGitHubUser,
        } as any)

      vi.mocked(githubUserRepository.findByGithubId).mockResolvedValue(existingGitHubUserRecord as any)
      vi.mocked(githubUserRepository.updateToken).mockResolvedValue(updatedGitHubUserRecord as any)
      vi.mocked(userRepository.findById).mockResolvedValue(mockGamifyXUser as any)

      const result = await service.handleOAuthCallback('test-code', userId)

      expect(result.githubUser.githubToken).toBe('new-access-token')
      expect(githubUserRepository.updateToken).toHaveBeenCalled()
    })
  })

  describe('verifyToken', () => {
    it('should return true for valid token', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as any)

      const result = await service.verifyToken('test-access-token')

      expect(result).toBe(true)
    })

    it('should return false for invalid token', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as any)

      const result = await service.verifyToken('invalid-token')

      expect(result).toBe(false)
    })

    it('should return false on network error', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await service.verifyToken('test-access-token')

      expect(result).toBe(false)
    })
  })
})
