import { auth } from "@/auth"
import Tasks from "@/components/task-table/table";

export default async function Dashboard() {
  
  const session = await auth()
  if (!session) return <p>Not signed in</p>

  return (
    <div className="p-4">
      <Tasks />
    </div>
  )
}