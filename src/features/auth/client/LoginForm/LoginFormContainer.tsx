"use client"

import { useState } from "react"
import { LoginFormView } from "./LoginFormView"

export function LoginFormContainer() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (_formData: FormData) => {
    setIsLoading(true)
    try {
      // TODO: server action / route handler 연결
    } finally {
      setIsLoading(false)
    }
  }

  return <LoginFormView onSubmit={handleSubmit} isLoading={isLoading} />
}
