import { AxiosError } from "axios"

import { NotFoundPage } from "./NotFoundPage"
import { ServerErrorPage } from "./ServerErrorPage"

import type { ErrorComponentProps } from "@tanstack/react-router"

// API 404 응답은 NotFoundPage, 그 외 에러는 ServerErrorPage로 분기
export function RootErrorComponent(props: ErrorComponentProps) {
  const { error } = props

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <NotFoundPage />
  }

  return <ServerErrorPage {...props} />
}
