import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CheckCircle2, Edit3, ShieldAlert, Sparkles } from 'lucide-react'

export function VerificationModal({ open, onClose, metrics = [], onSaveVerified }) {
  const [items, setItems] = useState([])
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (metrics) {
      setItems(metrics.map((m) => ({ ...m, verified: false })))
    }
  }, [metrics])

  const handleMarkCorrect = (index) => {
    const next = [...items]
    next[index].verified = true
    setItems(next)
  }

  const handleStartEdit = (item) => {
    setEditingKey(item.key)
    setEditValue(item.value)
    setEditUnit(item.unit || '')
  }

  const handleSaveEdit = (index) => {
    const next = [...items]
    next[index].value = isNaN(Number(editValue)) ? editValue : Number(editValue)
    next[index].unit = editUnit
    next[index].verified = true
    setItems(next)
    setEditingKey(null)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await onSaveVerified(items)
      onClose()
    } catch (err) {
      console.error('Failed to save verified metrics:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!metrics || metrics.length === 0) return null

  return (
    <Modal open={open} onClose={onClose} title="Verify Extracted Health Measurements">
      <div className="space-y-4">
        {/* Important Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-300 text-xs font-medium">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Please verify extracted values against your original report.</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Review each measurement parameter. Confirm accuracy or edit values before saving to your permanent health vault.
            </p>
          </div>
        </div>

        {/* Extracted Metrics List */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={item.key || idx}
              className={`p-3.5 rounded-2xl border transition ${
                item.verified
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Confidence: {Math.round((item.confidence || 0.9) * 100)}%
                    </span>
                  </div>

                  {editingKey === item.key ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 text-xs font-bold"
                      />
                      <Input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-20 text-xs"
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(idx)} className="bg-emerald-600 text-white text-xs">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      Extracted: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">{item.value}</span> {item.unit}
                      {item.referenceRange && (
                        <span className="text-[11px] text-slate-400 font-normal ml-2">(Ref: {item.referenceRange})</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.verified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCorrect(idx)}
                        className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border-emerald-300"
                      >
                        ✓ Correct
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Skip Verification
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
          >
            {saving ? 'Saving...' : 'SAVE VERIFIED HEALTH DATA'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
