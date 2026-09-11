import { primarySheet, type WorkbookAnalysis } from './excel'
import type { AppMetric, AppSpec } from './architect'

export type AppRecord = {
  id: string
  values: Record<string, string>
  createdAt: string
  updatedAt: string
  source: 'excel' | 'user'
}

export const recordsFromAnalysis = (analysis: WorkbookAnalysis, makeId: () => string): AppRecord[] => {
  const sheet = primarySheet(analysis)
  const now = new Date().toISOString()
  return sheet.rows.map((row) => {
    const values: Record<string, string> = {}
    sheet.columns.forEach((column, index) => {
      values[column.name] = row[index] ?? ''
    })
    return { id: makeId(), values, createdAt: now, updatedAt: now, source: 'excel' as const }
  })
}

export const recordTitle = (record: AppRecord, spec?: AppSpec) => {
  if (spec?.primaryField && record.values[spec.primaryField]) return record.values[spec.primaryField]
  return Object.values(record.values).find((value) => value.trim()) || 'Ny rad'
}

export const parseAmount = (value: string) => {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : 0
}

export const metricValue = (metric: AppMetric, records: AppRecord[]) => {
  if (metric.kind === 'count') return String(records.length)
  if (metric.kind === 'sum' && metric.field) {
    const total = records.reduce((sum, record) => sum + parseAmount(record.values[metric.field!] || ''), 0)
    return Number.isInteger(total) ? String(total) : total.toLocaleString('sv-SE', { maximumFractionDigits: 2 })
  }
  if (metric.kind === 'status-count' && metric.field && metric.match) {
    return String(records.filter((record) => record.values[metric.field!] === metric.match).length)
  }
  return '0'
}

export const filterRecords = (records: AppRecord[], query: string, statusField?: string, statusValue?: string) => {
  const needle = query.trim().toLocaleLowerCase('sv-SE')
  return records.filter((record) => {
    if (statusField && statusValue && record.values[statusField] !== statusValue) return false
    if (!needle) return true
    return Object.values(record.values).some((value) => value.toLocaleLowerCase('sv-SE').includes(needle))
  })
}
