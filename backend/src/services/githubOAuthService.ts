import { GitHubUser } from '../database/models'
import githubUserRepository from '../database/repositories/githubUserRepository'
import userRepository from '../database/repositories/userRepository'

interface GitHubOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface GitHubUserData {
  id: number
  login: string
  email: string
  avatar_url: string
}

interface GitHubTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
}

export class GitHubOAuthService {
  private config: GitHubOAuthConfig

  constructor(config: GitHubOAuthConfig) {
    this.config = config
  }

  /**
   * Generate GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'repo,user',
      state,
    })
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  /**
   * Fetch GitHub user data using access token
   */
  async fetchGitHubUser(accessToken: string): Promise<GitHubUserData> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub user data')
    }

    return response.json()
  }

  /**
   * Handle GitHub OAuth callback and link/create user
   */
  async handleOAuthCallback(
    code: string,
    gamifyxUserId: string
  ): Promise<{ user: any; githubUser: GitHubUser }> {
    // Exchange code for token
    const tokenResponse = await this.exchangeCodeForToken(code)

    // Fetch GitHub user data
    const githubUserData = await this.fetchGitHubUser(tokenResponse.access_token)

    // Check if GitHub user is already linked
    let githubUser = await githubUserRepository.findByGithubId(githubUserData.id)

    if (githubUser) {
      // Update existing token
      const expiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined

      githubUser = await githubUserRepository.updateToken(
        githubUser.userId,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        expiresAt
      )
    } else {
      // Create new GitHub user link
      const expiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined

      githubUser = await githubUserRepository.create({
        userId: gamifyxUserId,
        githubUsername: githubUserData.login,
        githubId: githubUserData.id,
        githubToken: tokenResponse.access_token,
        githubRefreshToken: tokenResponse.refresh_token,
        tokenExpiresAt: expiresAt,
      })
    }

    // Fetch the linked GamifyX user
    const user = await userRepository.findById(githubUser.userId)

    if (!user) {
      throw new Error('User not found')
    }

    return { user, githubUser }
  }

  /**
   * Verify GitHub token is still valid
   */
  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Refresh GitHub token if expired
   */
  async refreshToken(refreshToken: string): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }
}

export default GitHubOAuthService
