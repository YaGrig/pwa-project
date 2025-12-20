type UserRole = 'Admin' | 'User'

export type User = {
  id: string
  username: string
  email: string
  hashed_password: string
  refresh_token: string
  user_role: UserRole
}

export interface JwtPayload {
  sub: string
  iat?: number
  exp?: number
  // Add other expected claims as needed
}
