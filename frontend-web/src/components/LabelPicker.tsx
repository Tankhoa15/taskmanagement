import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, ChevronDown } from 'lucide-react'
import { labelService } from '../services/labelService'
import LabelBadge from './LabelBadge'
import type { Label } from '../types'

interface Props {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export default function LabelPicker({ selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: labelService.getAllLabels,
  })

  const selected = labels.filter((l) => selectedIds.includes(l.id))

  const toggle = (label: Label) => {
    if (selectedIds.includes(label.id)) {
      onChange(selectedIds.filter((id) => id !== label.id))
    } else {
      onChange([...selectedIds, label.id])
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Tag size={14} className="text-gray-400 flex-shrink-0" />
        {selected.length === 0 ? (
          <span className="text-gray-400">Chọn label</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.map((l) => (
              <LabelBadge key={l.id} label={l} size="sm" onRemove={() => toggle(l)} />
            ))}
          </div>
        )}
        <ChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-52 overflow-y-auto">
            {labels.length === 0 && (
              <p className="text-sm text-gray-400 px-2 py-1">Chưa có label nào</p>
            )}
            {labels.map((label) => {
              const checked = selectedIds.includes(label.id)
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggle(label)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-left"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="rounded"
                    style={{ accentColor: label.color }}
                  />
                  <LabelBadge label={label} size="sm" />
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
