export const MONTH_ALIASES: Array<{ key: string; aliases: string[] }> = [
  { key: 'Jan', aliases: ['jan', 'january', 'januari'] },
  { key: 'Feb', aliases: ['feb', 'february', 'februari'] },
  { key: 'Mar', aliases: ['mar', 'march', 'mars'] },
  { key: 'Apr', aliases: ['apr', 'april'] },
  { key: 'May', aliases: ['may', 'maj'] },
  { key: 'Jun', aliases: ['jun', 'june', 'juni'] },
  { key: 'Jul', aliases: ['jul', 'july', 'juli'] },
  { key: 'Aug', aliases: ['aug', 'august', 'augusti'] },
  { key: 'Sep', aliases: ['sep', 'sept', 'september'] },
  { key: 'Oct', aliases: ['oct', 'okt', 'october', 'oktober'] },
  { key: 'Nov', aliases: ['nov', 'november'] },
  { key: 'Dec', aliases: ['dec', 'december'] },
]

export type GroupKind = 'in' | 'out' | 'neutral'
export type SeriesRole = 'data' | 'total' | 'average'

export type MatrixSeries = {
  name: string
  role: SeriesRole
  values: Record<string, number>
}

export type MatrixGroup = {
  id: string
  title: string
  kind: GroupKind
  periods: string[]
  series: MatrixSeries[]
}

export type SemanticKpiHint = {
  label: string
  value: number
}

export type DetectedFormula = {
  cell: string
  formula: string
}

export type SemanticModel = {
  layout: 'period-matrix' | 'records'
  title: string
  periods: string[]
  groups: MatrixGroup[]
  kpiHints: SemanticKpiHint[]
  formulas: DetectedFormula[]
}

const normalize = (value: string) => value.toLocaleLowerCase('sv-SE').trim()

export const parseNumeric = (value: string) => {
  let raw = String(value ?? '').trim()
  if (!raw) return null
  const wrappedNegative = /^\(.*\)$/.test(raw)
  raw = raw.replace(/[%€$£]/g, '').replace(/\bkr\b/gi, '').replace(/\s/g, '')
  const negative = wrappedNegative || raw.startsWith('-') || raw.startsWith('−')
  raw = raw.replace(/[()]/g, '').replace(/^[-−]/, '')
  if (!raw) return null
  if (raw.includes(',') && raw.includes('.')) {
    raw = raw.replace(/,/g, '')
  } else if ((raw.match(/,/g) || []).length > 1) {
    raw = raw.replace(/,/g, '')
  } else if (raw.includes(',') && !raw.includes('.')) {
    const [left, right = ''] = raw.split(',')
    raw = right.length === 3 && left.length <= 3 ? `${left}${right}` : `${left}.${right}`
  }
  if (!/^\d+(\.\d+)?$/.test(raw)) return null
  const signed = negative ? -Number(raw) : Number(raw)
  return Number.isFinite(signed) ? signed : null
}

export const monthKey = (value: string) => {
  const token = normalize(value).replace(/\./g, '')
  if (!token) return null
  const match = MONTH_ALIASES.find((month) => month.aliases.includes(token) || token === month.key.toLocaleLowerCase('en-US'))
  return match?.key ?? null
}

export const currentPeriodKey = () => MONTH_ALIASES[new Date().getMonth()]?.key || 'Jan'

export const filledCells = (row: string[]) =>
  (row || []).map((cell, index) => ({ cell: String(cell ?? '').trim(), index })).filter((item) => item.cell !== '')

export const isTotalLabel = (value: string) => /^(total|summa|sum|subtotal|totalt)\b/i.test(value.trim())
export const isAverageLabel = (value: string) => /^(average|avg|genomsnitt|medel|medelvärde)\b/i.test(value.trim())

const slug = (value: string) =>
  value.toLocaleLowerCase('sv-SE').replace(/[^a-z0-9åäö]+/gi, '-').replace(/^-|-$/g, '') || 'grupp'

export const prettyLabel = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (trimmed !== trimmed.toLocaleUpperCase('sv-SE') && /[a-zåäö]/i.test(trimmed)) return trimmed
  return trimmed.toLocaleLowerCase('sv-SE').replace(/(^|[\s/-])\S/g, (chunk) => chunk.toLocaleUpperCase('sv-SE'))
}

const kindFromText = (text: string): GroupKind => {
  const inHit = /(income|inkomst|intäkt|intakt|revenue|lön|lon|salary|inbetal)/i.test(text)
  const outHit = /(expense|utgift|kostnad|cost|spend|utlägg|utlagg|utbetal)/i.test(text)
  if (inHit && !outHit) return 'in'
  if (outHit && !inHit) return 'out'
  return 'neutral'
}

export const inferGroupKind = (title: string, explanation = ''): GroupKind => {
  const fromTitle = kindFromText(normalize(title))
  if (fromTitle !== 'neutral') return fromTitle
  return kindFromText(normalize(explanation))
}

export const isSectionRow = (row: string[]) => {
  const filled = filledCells(row)
  if (filled.length !== 1 || filled[0].index > 1) return false
  const label = filled[0].cell
  if (parseNumeric(label) !== null) return false
  return label.length <= 48
}

const isKpiRow = (row: string[]) => {
  const filled = filledCells(row)
  if (filled.length < 2 || filled.length > 4) return false
  if (filled[0].index > 1) return false
  const numberCell = filled.find((item) => parseNumeric(item.cell) !== null)
  if (!numberCell || numberCell.index === 0) return false
  const monthHits = filled.filter((item) => monthKey(item.cell)).length
  return monthHits === 0
}

export const detectPeriodHeader = (row: string[]) => {
  const months = (row || [])
    .map((cell, index) => ({ index, month: monthKey(String(cell ?? '')) }))
    .filter((item): item is { index: number; month: string } => Boolean(item.month))
  if (months.length < 6) return null
  const unique: string[] = []
  months.forEach((item) => {
    if (!unique.includes(item.month)) unique.push(item.month)
  })
  return { periods: unique, monthIndexes: months }
}

export const findHeaderRowIndex = (rows: string[][]) => {
  for (let index = 0; index < rows.length; index += 1) {
    if (detectPeriodHeader(rows[index])) return index
    const filled = filledCells(rows[index])
    if (filled.length >= 3 && !isSectionRow(rows[index])) return index
  }
  const first = rows.findIndex((row) => filledCells(row).length > 0)
  return first === -1 ? 0 : first
}

const seriesRole = (name: string): SeriesRole => {
  if (isAverageLabel(name)) return 'average'
  if (isTotalLabel(name)) return 'total'
  return 'data'
}

export const analyzeSemantics = (
  rows: string[][],
  formulas: DetectedFormula[] = [],
  explanation = '',
): SemanticModel => {
  const compact = (rows || []).map((row) => (row || []).map((cell) => String(cell ?? '').trim()))
  const titleRow = compact.find((row) => isSectionRow(row) && filledCells(row)[0].cell.length > 2)
  const title = prettyLabel(titleRow?.[0] || '')
  const groups: MatrixGroup[] = []
  const kpiHints: SemanticKpiHint[] = []
  let pendingSection = ''

  compact.forEach((row, rowIndex) => {
    if (isSectionRow(row)) {
      pendingSection = row[0]
      return
    }
    if (!groups.length && isKpiRow(row)) {
      const numberCell = filledCells(row).find((item) => parseNumeric(item.cell) !== null)
      kpiHints.push({
        label: prettyLabel(row[0]),
        value: parseNumeric(numberCell?.cell || '') || 0,
      })
      return
    }
    const header = detectPeriodHeader(row)
    if (!header) return
    const series: MatrixSeries[] = []
    for (let cursor = rowIndex + 1; cursor < compact.length; cursor += 1) {
      const next = compact[cursor]
      if (detectPeriodHeader(next) || isSectionRow(next)) break
      if (!filledCells(next).length) break
      const name = next[0] || `Rad ${cursor + 1}`
      const values: Record<string, number> = {}
      header.monthIndexes.forEach((item) => {
        const amount = parseNumeric(next[item.index] || '')
        if (amount !== null) values[item.month] = amount
      })
      series.push({ name, role: seriesRole(name), values })
    }
    const dataSeries = series.filter((item) => item.role === 'data')
    if (dataSeries.length >= 2) {
      const rawTitle = pendingSection || (groups.length === 0 ? 'Värden' : `Grupp ${groups.length + 1}`)
      groups.push({
        id: slug(rawTitle) || `grupp-${groups.length + 1}`,
        title: prettyLabel(rawTitle),
        kind: inferGroupKind(rawTitle, explanation),
        periods: header.periods,
        series,
      })
      pendingSection = ''
    }
  })

  if (groups.length === 1 && groups[0].kind === 'neutral') {
    groups[0].kind = inferGroupKind(groups[0].title + ' ' + groups[0].series.map((item) => item.name).join(' '), explanation)
  }

  return {
    layout: groups.length ? 'period-matrix' : 'records',
    title,
    periods: groups[0]?.periods || [],
    groups,
    kpiHints,
    formulas,
  }
}

export const formatMoney = (value: number) => {
  const absolute = Math.abs(value)
  const formatted = Number.isInteger(Math.round(absolute * 100) / 100) && Number.isInteger(absolute)
    ? absolute.toLocaleString('sv-SE')
    : absolute.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${value < 0 ? '−' : ''}${formatted} kr`
}

export const formatPercent = (value: number) => {
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toLocaleString('sv-SE')} %`
}
