export interface AuthResponse {
  meta: {
    token: string
  }
}

export interface User {
  id: string
  username: string
  email: string
}
