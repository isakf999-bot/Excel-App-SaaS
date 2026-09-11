import { primarySheet, sheetSemantics, type WorkbookAnalysis } from './excel'
import type { AppMetric, AppSpec, ExperienceKpi } from './architect'
import { formatMoney, formatPercent, parseNumeric, type MatrixGroup } from './semantics'

export type AppRecord = {
  id: string
  values: Record<string, string>
  createdAt: string
  updatedAt: string
  source: 'excel' | 'user'
}

const nowIso = () => new Date().toISOString()

const makeRecord = (id: string, values: Record<string, string>, source: AppRecord['source'], timestamp = nowIso()): AppRecord => ({
  id,
  values,
  createdAt: timestamp,
  updatedAt: timestamp,
  source,
})

const flattenMatrixGroups = (groups: MatrixGroup[], makeId: () => string, timestamp: string) => {
  const records: AppRecord[] = []
  groups.forEach((group) => {
    group.series.filter((series) => series.role === 'data').forEach((series) => {
      group.periods.forEach((period) => {
        const amount = series.values[period]
        if (amount === undefined || amount === 0) return
        records.push(makeRecord(makeId(), {
          group: group.title,
          category: series.name,
          period,
          amount: String(amount),
          note: '',
        }, 'excel', timestamp))
      })
    })
  })
  return records
}

export const recordsFromAnalysis = (analysis: WorkbookAnalysis, makeId: () => string, spec?: AppSpec): AppRecord[] => {
  const explanation = spec?.description || ''
  const timestamp = nowIso()

  if (spec?.experience?.layout === 'period-matrix') {
    return flattenMatrixGroups(spec.experience.groups, makeId, timestamp)
  }

  const semantics = sheetSemantics(analysis, explanation)
  if (semantics.layout === 'period-matrix') {
    return flattenMatrixGroups(semantics.groups, makeId, timestamp)
  }

  const sheet = primarySheet(analysis)
  return sheet.rows.map((row) => {
    const values: Record<string, string> = {}
    sheet.columns.forEach((column, index) => {
      values[column.name] = row[index] ?? ''
    })
    return makeRecord(makeId(), values, 'excel', timestamp)
  })
}

export const recordTitle = (record: AppRecord, spec?: AppSpec) => {
  if (spec?.experience?.layout === 'period-matrix') {
    const category = record.values.category || record.values.Kategori
    const period = record.values.period || record.values.Period
    return [category, period].filter(Boolean).join(' · ') || 'Ny transaktion'
  }
  if (spec?.primaryField && record.values[spec.primaryField]) return record.values[spec.primaryField]
  return Object.values(record.values).find((value) => value.trim()) || 'Ny rad'
}

export const parseAmount = (value: string) => parseNumeric(value) ?? 0

const groupIdFromRecord = (record: AppRecord, spec?: AppSpec) => {
  const raw = record.values.group || record.values.Grupp || ''
  return spec?.experience?.groups.find((group) => group.id === raw || group.title === raw)?.id || raw
}

export type MatrixInsights = {
  groupTotals: Record<string, number>
  periodTotals: Record<string, Record<string, number>>
  categoryTotals: Record<string, Record<string, number>>
  inTotal: number
  outTotal: number
  balance: number
  ratio: number | null
}

export const insightsFromRecords = (records: AppRecord[], spec?: AppSpec): MatrixInsights => {
  const groups = spec?.experience?.groups || []
  const groupTotals: Record<string, number> = {}
  const periodTotals: Record<string, Record<string, number>> = {}
  const categoryTotals: Record<string, Record<string, number>> = {}
  groups.forEach((group) => {
    groupTotals[group.id] = 0
    periodTotals[group.id] = {}
    categoryTotals[group.id] = {}
  })
  records.forEach((record) => {
    const groupId = groupIdFromRecord(record, spec)
    if (!groupId) return
    const amount = parseAmount(record.values.amount || record.values.Belopp || '')
    const period = record.values.period || record.values.Period || ''
    const category = record.values.category || record.values.Kategori || ''
    groupTotals[groupId] = (groupTotals[groupId] || 0) + amount
    if (period) {
      periodTotals[groupId] = periodTotals[groupId] || {}
      periodTotals[groupId][period] = (periodTotals[groupId][period] || 0) + amount
    }
    if (category) {
      categoryTotals[groupId] = categoryTotals[groupId] || {}
      categoryTotals[groupId][category] = (categoryTotals[groupId][category] || 0) + amount
    }
  })
  const inTotal = groups.filter((group) => group.kind === 'in').reduce((sum, group) => sum + (groupTotals[group.id] || 0), 0)
  const outTotal = groups.filter((group) => group.kind === 'out').reduce((sum, group) => sum + (groupTotals[group.id] || 0), 0)
  return {
    groupTotals,
    periodTotals,
    categoryTotals,
    inTotal,
    outTotal,
    balance: inTotal - outTotal,
    ratio: inTotal ? (outTotal / inTotal) * 100 : null,
  }
}

export const formatKpiValue = (kpi: ExperienceKpi, records: AppRecord[], spec?: AppSpec) => {
  if (spec?.experience?.layout === 'period-matrix') {
    const insights = insightsFromRecords(records, spec)
    if (kpi.kind === 'sum-group' && kpi.groupId) return formatMoney(insights.groupTotals[kpi.groupId] || 0)
    if (kpi.kind === 'balance') return formatMoney(insights.balance)
    if (kpi.kind === 'ratio') return insights.ratio === null ? '—' : formatPercent(insights.ratio)
  }
  if (kpi.kind === 'count') return String(records.length)
  if (kpi.kind === 'sum' && kpi.field) {
    const total = records.reduce((sum, record) => sum + parseAmount(record.values[kpi.field!] || ''), 0)
    return kpi.format === 'currency' ? formatMoney(total) : (Number.isInteger(total) ? String(total) : total.toLocaleString('sv-SE', { maximumFractionDigits: 2 }))
  }
  if (kpi.kind === 'status-count' && kpi.field && kpi.match) {
    return String(records.filter((record) => record.values[kpi.field!] === kpi.match).length)
  }
  return '0'
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

export const filterRecords = (
  records: AppRecord[],
  query: string,
  statusField?: string,
  statusValue?: string,
  extra?: Record<string, string>,
) => {
  const needle = query.trim().toLocaleLowerCase('sv-SE')
  return records.filter((record) => {
    if (statusField && statusValue && record.values[statusField] !== statusValue) return false
    if (extra) {
      const matches = Object.entries(extra).every(([key, value]) => {
        if (!value) return true
        const current = record.values[key] || ''
        return current === value
      })
      if (!matches) return false
    }
    if (!needle) return true
    return Object.values(record.values).some((value) => value.toLocaleLowerCase('sv-SE').includes(needle))
  })
}

export const recentRecords = (records: AppRecord[], limit = 8) =>
  [...records].reverse().sort((a, b) => {
    if (a.source !== b.source) return a.source === 'user' ? -1 : 1
    return (b.updatedAt || '').localeCompare(a.updatedAt || '')
  }).slice(0, limit)
