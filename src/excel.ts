import * as XLSX from 'xlsx'

export type InferredFieldType = 'text' | 'number' | 'date' | 'select'

export type AnalyzedColumn = {
  name: string
  type: InferredFieldType
  uniqueValues: string[]
  emptyCount: number
  filledCount: number
}

export type AnalyzedSheet = {
  name: string
  rowCount: number
  columns: AnalyzedColumn[]
  sampleRows: string[][]
  rows: string[][]
}

export type WorkbookAnalysis = {
  fileName: string
  sheetNames: string[]
  primarySheet: string
  sheets: AnalyzedSheet[]
  truncated: boolean
  columns: string[]
  rows: string[][]
  rowCount: number
  formFields: string[]
  statusFields: string[]
}

export type ExcelParseErrorCode = 'EMPTY_WORKBOOK' | 'NO_HEADERS' | 'INVALID_FILE' | 'UNSUPPORTED_TYPE'

export class ExcelParseError extends Error {
  code: ExcelParseErrorCode
  constructor(code: ExcelParseErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

const MAX_STORED_ROWS = 5000
const SAMPLE_ROWS = 8
const CATEGORY_MAX_UNIQUE = 12

const cellToString = (cell: unknown): string => {
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) return cell.toISOString().slice(0, 10)
  if (typeof cell === 'number' && Number.isFinite(cell)) return String(cell)
  if (typeof cell === 'boolean') return cell ? 'Ja' : 'Nej'
  return String(cell ?? '').trim()
}

const isDateValue = (value: string) => {
  if (!value) return false
  if (/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(value)) return true
  if (/^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(value)) return true
  return false
}

const isNumberValue = (value: string) => {
  if (!value) return false
  if (isDateValue(value)) return false
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return false
  return Number.isFinite(Number(normalized))
}

const uniqueHeader = (raw: string, index: number, used: Map<string, number>) => {
  const base = raw.trim() || `Kolumn ${index + 1}`
  const count = used.get(base) ?? 0
  used.set(base, count + 1)
  return count === 0 ? base : `${base} (${count + 1})`
}

const inferColumnType = (values: string[]): { type: InferredFieldType; uniqueValues: string[] } => {
  const filled = values.filter((value) => value !== '')
  const unique = [...new Set(filled)]
  if (!filled.length) return { type: 'text', uniqueValues: [] }

  const dateHits = filled.filter(isDateValue).length
  const numberHits = filled.filter(isNumberValue).length
  if (dateHits / filled.length >= 0.6) return { type: 'date', uniqueValues: unique.slice(0, CATEGORY_MAX_UNIQUE) }
  if (numberHits / filled.length >= 0.6) return { type: 'number', uniqueValues: [] }

  const uniqueRatio = unique.length / filled.length
  if (unique.length >= 2 && unique.length <= CATEGORY_MAX_UNIQUE && uniqueRatio <= 0.35) {
    return { type: 'select', uniqueValues: unique.slice(0, CATEGORY_MAX_UNIQUE) }
  }
  return { type: 'text', uniqueValues: unique.slice(0, CATEGORY_MAX_UNIQUE) }
}

const parseSheet = (name: string, sheet: XLSX.WorkSheet): AnalyzedSheet | null => {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' })
  const nonEmpty = matrix.filter((row) => Array.isArray(row) && row.some((cell) => cellToString(cell) !== ''))
  if (nonEmpty.length < 2) return null

  const headerCells = (nonEmpty[0] ?? []).map((cell) => cellToString(cell))
  if (!headerCells.some((cell) => cell !== '')) return null

  const used = new Map<string, number>()
  const columns = headerCells.map((cell, index) => uniqueHeader(cell, index, used))
  const dataRows = nonEmpty.slice(1).map((row) => columns.map((_, index) => cellToString(row[index])))
  const storedRows = dataRows.slice(0, MAX_STORED_ROWS)
  const analyzedColumns = columns.map((name, index) => {
    const values = storedRows.map((row) => row[index] ?? '')
    const inferred = inferColumnType(values)
    return {
      name,
      type: inferred.type,
      uniqueValues: inferred.uniqueValues,
      emptyCount: values.filter((value) => value === '').length,
      filledCount: values.filter((value) => value !== '').length,
    }
  })

  return {
    name,
    rowCount: dataRows.length,
    columns: analyzedColumns,
    sampleRows: storedRows.slice(0, SAMPLE_ROWS),
    rows: storedRows,
  }
}

export const parseWorkbook = async (file: File): Promise<WorkbookAnalysis> => {
  const extension = file.name.toLocaleLowerCase('sv-SE').split('.').pop()
  if (extension !== 'xlsx' && extension !== 'xls') {
    throw new ExcelParseError('UNSUPPORTED_TYPE', 'Den filtypen stöds inte')
  }

  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true, cellNF: false, cellText: false })
  } catch {
    throw new ExcelParseError('INVALID_FILE', 'Vi kunde inte läsa filen')
  }

  const sheetNames = workbook.SheetNames.filter(Boolean)
  if (!sheetNames.length) throw new ExcelParseError('EMPTY_WORKBOOK', 'Excel-filen innehåller inga ark.')

  const sheets = sheetNames
    .map((name) => {
      const sheet = workbook.Sheets[name]
      return sheet ? parseSheet(name, sheet) : null
    })
    .filter((sheet): sheet is AnalyzedSheet => Boolean(sheet))

  if (!sheets.length) {
    throw new ExcelParseError('NO_HEADERS', 'Vi kunde inte hitta någon tydlig tabell i Excel-filen. Kontrollera att första raden innehåller kolumnnamn.')
  }

  const primary = [...sheets].sort((a, b) => b.rowCount - a.rowCount || b.columns.length - a.columns.length)[0]
  const statusFields = primary.columns.filter((column) => /status|godk[aä]nd|approved/i.test(column.name)).map((column) => column.name)
  const formFields = primary.columns.filter((column) => !statusFields.includes(column.name)).map((column) => column.name)

  return {
    fileName: file.name,
    sheetNames,
    primarySheet: primary.name,
    sheets,
    truncated: primary.rowCount > primary.rows.length,
    columns: primary.columns.map((column) => column.name),
    rows: primary.sampleRows,
    rowCount: primary.rowCount,
    formFields: formFields.length ? formFields : primary.columns.map((column) => column.name),
    statusFields,
  }
}

export const primarySheet = (analysis: WorkbookAnalysis): AnalyzedSheet => {
  if (analysis.sheets?.length) {
    return analysis.sheets.find((sheet) => sheet.name === analysis.primarySheet) ?? analysis.sheets[0]
  }
  return {
    name: analysis.primarySheet || analysis.sheetNames?.[0] || 'Blad1',
    rowCount: analysis.rowCount || analysis.rows?.length || 0,
    columns: (analysis.columns || []).map((name) => ({
      name,
      type: /status|godk/i.test(name) ? 'select' : /datum|date/i.test(name) ? 'date' : /antal|belopp|pris|tim/i.test(name) ? 'number' : 'text',
      uniqueValues: [],
      emptyCount: 0,
      filledCount: analysis.rowCount || 0,
    })),
    sampleRows: analysis.rows || [],
    rows: analysis.rows || [],
  }
}

export const excelErrorCopy = (error: unknown): { title: string; message: string } => {
  if (error instanceof ExcelParseError) {
    if (error.code === 'UNSUPPORTED_TYPE') return { title: 'Den filtypen stöds inte', message: 'Ladda upp en .xlsx- eller .xls-fil.' }
    if (error.code === 'NO_HEADERS') return { title: 'Ingen tabell hittades', message: error.message }
    if (error.code === 'EMPTY_WORKBOOK') return { title: 'Vi hittade inga data att analysera.', message: 'Ladda upp en Excel-fil som innehåller ett arbetsflöde eller en tabell.' }
    return { title: 'Vi kunde inte läsa filen', message: 'Kontrollera att filen är en giltig Excel-fil och försök igen.' }
  }
  return { title: 'Vi kunde inte läsa filen', message: 'Kontrollera att filen är en giltig Excel-fil och försök igen.' }
}
