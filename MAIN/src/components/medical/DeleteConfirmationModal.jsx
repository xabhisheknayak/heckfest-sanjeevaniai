import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'

export function DeleteConfirmationModal({ open, onClose, onConfirm, deleting, recordName }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Medical Record">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="space-y-1">
            {recordName && (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Record: <span className="underline">{recordName}</span>
              </p>
            )}
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              This will permanently delete this medical record and its stored file. Information extracted exclusively from this report may also be removed from your health calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={deleting}
            className="text-xs font-bold"
          >
            [ CANCEL ]
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
          >
            {deleting ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deleting...</span>
              </div>
            ) : (
              '[ DELETE ]'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
