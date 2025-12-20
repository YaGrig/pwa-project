export interface CustomRequest extends Request {
  user: string
  cookies: {
    access_token: string
  }
}
