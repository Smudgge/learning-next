import { auth } from "@/auth"

export default async function Dashboard() {
  const session = await auth()
  if (!session) return <p>Not signed in</p>

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <h1 className="text-2xl font-bold">
        Welcome, {session.user?.email}
      </h1>
    </div>
  )
}