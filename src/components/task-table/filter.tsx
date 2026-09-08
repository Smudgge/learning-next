import { TaskStatus } from '@/generated/prisma/client';
import { ComboboxItem } from '../ui/combobox';
import { Label } from '../ui/label';
import TaskStatusComponent from './status';
import { Filter } from './table'
import TaskLabelComponent from './label';

export default function TaskFilterComponent({ filter }: { filter: Filter }) {
  if (filter.type === 'Assignees') {
    return (
      <ComboboxItem key={filter.id} value={filter}>
        <Label className="font-bold">{filter.name}</Label>
      </ComboboxItem>
    )
  }
  if (filter.type === 'Status') {
    return (
      <ComboboxItem key={filter.id} value={filter}>
        <TaskStatusComponent status={filter.name as TaskStatus}/>
      </ComboboxItem>
    )
  }
  if (filter.type === 'Labels') {
    return (
      <ComboboxItem key={filter.id} value={filter}>
        <TaskLabelComponent label={{ id: '', name: filter.name }}/>
      </ComboboxItem>
    )
  }

  return <Label>No display implementation for filter {filter.id}</Label>
}