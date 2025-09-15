export interface ApiError {
  status: string
  title: string
  detail: string
}

export interface ApiErrorResponse {
  errors: ApiError[]
}
