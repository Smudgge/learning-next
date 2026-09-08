"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useSession, signOut } from "next-auth/react"

export default function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return null // or a skeleton/spinner

  if (session) {
    return <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
  }

  return (
    <Button>
      <Link href="/login" className="flex items-center gap-2">
        <span>Sign in</span>
      </Link>
    </Button>
  )
}