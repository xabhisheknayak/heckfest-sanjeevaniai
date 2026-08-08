import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Download, FileText, ExternalLink } from 'lucide-react'

export function RecordViewerModal({ open, onClose, record }) {
  if (!record) return null

  const isPdf = record.mimeType === 'application/pdf' || record.fileUrl?.toLowerCase().includes('.pdf') || record.recordName?.toLowerCase().endsWith('.pdf')
  const isImage = record.mimeType?.startsWith('image/') || record.fileUrl?.startsWith('data:image/') || (!isPdf && record.fileUrl)

  const handleDownload = () => {
    if (!record.fileUrl) return
    const a = document.createElement('a')
    a.href = record.fileUrl
    a.download = record.recordName || 'medical-record'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Modal open={open} onClose={onClose} title={record.recordName || 'Medical Record View'}>
      <div className="space-y-4">
        {/* Record Meta Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs">
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Date: </span>
            <span className="text-slate-600 dark:text-slate-400">{record.recordDate || 'N/A'}</span>
          </div>
          {(record.doctorName || record.hospitalName) && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Doctor/Hospital: </span>
              <span className="text-slate-600 dark:text-slate-400">
                {record.doctorName} {record.hospitalName ? `(${record.hospitalName})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="relative min-h-[250px] max-h-[450px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
          {isImage ? (
            <img
              src={record.fileUrl}
              alt={record.recordName}
              className="max-h-[400px] w-auto max-w-full rounded-xl object-contain shadow-md"
            />
          ) : isPdf ? (
            <iframe
              src={record.fileUrl}
              title={record.recordName}
              className="w-full h-[400px] rounded-xl border-0"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-slate-500 text-center">
              <FileText className="h-12 w-12 text-slate-400" />
              <p className="text-xs font-semibold">Preview not directly embeddable for this format.</p>
              <Button size="sm" variant="outline" onClick={handleDownload} className="mt-2">
                <ExternalLink className="h-4 w-4 mr-1" /> Open File
              </Button>
            </div>
          )}
        </div>

        {/* Notes if present */}
        {record.notes && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-300">
            <span className="font-bold">Notes: </span>
            <span>{record.notes}</span>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD
          </Button>
        </div>
      </div>
    </Modal>
  )
}
