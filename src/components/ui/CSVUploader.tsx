'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CSVUploaderProps {
  onUpload: (data: any[]) => void
  onClose: () => void
  sampleHeaders?: string[]
}

export default function CSVUploader({ onUpload, onClose, sampleHeaders }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) processFile(selected)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const selected = e.dataTransfer.files?.[0]
    if (selected) processFile(selected)
  }

  const processFile = (file: File) => {
    setError(null)
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.')
      return
    }
    setFile(file)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`)
          return
        }
        setData(results.data)
      },
      error: (error: Error) => {
        setError(`Failed to read file: ${error.message}`)
      }
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900">Bulk Import CSV</h3>
            <p className="text-xs text-gray-500 mt-0.5">Upload a CSV file to add multiple records</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Upload size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-800">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">CSV files only (max 5MB)</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB • {data.length} records</p>
                </div>
                <button onClick={() => { setFile(null); setData([]); setError(null); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-start gap-2 border border-red-100">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {!error && data.length > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-start gap-2 border border-emerald-100">
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                  <p>Successfully parsed {data.length} rows. Ready to import.</p>
                </div>
              )}
            </div>
          )}

          {sampleHeaders && (
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 border border-blue-100">
              <p className="font-semibold mb-1">Expected Headers:</p>
              <p className="font-mono text-[10px] break-words">{sampleHeaders.join(', ')}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-between items-center gap-2 bg-gray-50">
          {sampleHeaders && (
            <button
              onClick={() => {
                const csv = sampleHeaders.join(',') + '\n' + sampleHeaders.map(h => `example_${h}`).join(',')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `import_template_${new Date().getTime()}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100 hover:border-indigo-200 shadow-sm active:scale-95"
            >
              <Download size={14} /> Download Sample Format
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button 
              disabled={!file || !!error || data.length === 0}
              onClick={() => onUpload(data)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              Import Data
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
