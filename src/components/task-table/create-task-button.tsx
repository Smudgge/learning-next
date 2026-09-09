import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldGroup } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreateTaskButton() {
  const [nameInput, setNameInput] = useState('')
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient()

  const { mutate: createTask } = useMutation({
    mutationFn: () => {
      if (!nameInput.trim()) return
      setSubmitting(true)
      return fetch(`/api/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      }).then((res) => {
        setNameInput("");
        setOpen(false);
        setSubmitting(false)
        return res
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger render={
          <Button variant="outline">
            <Plus />
            Create task
          </Button>
        } />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a task.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" onSubmit={createTask} placeholder="Task name" onInput={(e) => setNameInput(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={submitting} onClick={createTask}>Create task</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}