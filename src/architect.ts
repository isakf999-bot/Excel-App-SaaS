import { primarySheet, type AnalyzedColumn, type WorkbookAnalysis } from './excel'

export type AppField = {
  key: string
  name: string
  type: 'text' | 'number' | 'date' | 'select'
  required: boolean
  options?: string[]
}

export type AppMetric = {
  id: string
  label: string
  kind: 'count' | 'sum' | 'status-count'
  field?: string
  match?: string
}

export type AppSpec = {
  name: string
  description: string
  entityName: string
  entityNamePlural: string
  primaryField: string
  statusField?: string
  fields: AppField[]
  features: Array<'search' | 'filter' | 'create' | 'edit' | 'delete' | 'approvals'>
  metrics: AppMetric[]
  workflow: string[]
  suggestedActions: string[]
  sheetName: string
  understoodAs: string
}

type Domain = {
  id: string
  keys: string[]
  name: string
  entity: string
  plural: string
  understoodAs: string
  workflow: string[]
}

const DOMAINS: Domain[] = [
  { id: 'courses', keys: ['kurs', 'kurser', 'skola', 'lärare', 'larare', 'elev', 'undervis', 'klass', 'kurskod'], name: 'Kursöversikt', entity: 'Kurs', plural: 'kurser', understoodAs: 'Kurshantering', workflow: ['Planera kurs', 'Pågående', 'Avslutad'] },
  { id: 'customers', keys: ['kund', 'kunder', 'kontakt', 'crm', 'följa upp', 'folja upp', 'prospekt'], name: 'Kundlista', entity: 'Kund', plural: 'kunder', understoodAs: 'Kunduppföljning', workflow: ['Ny kontakt', 'Pågående', 'Klar'] },
  { id: 'budget', keys: ['budget', 'utgift', 'utgifter', 'inkomst', 'belopp', 'kostnad', 'leverantör', 'leverantor', 'kategori', 'ekonomi'], name: 'Budget', entity: 'Post', plural: 'poster', understoodAs: 'Budget och utgifter', workflow: ['Registrera', 'Följ upp', 'Klar'] },
  { id: 'orders', keys: ['order', 'ordrar', 'orderhantering', 'ordernummer', 'kundorder', 'kundordrar', 'beställ', 'bestall', 'produkt', 'leverans'], name: 'Orderhantering', entity: 'Order', plural: 'ordrar', understoodAs: 'Orderhantering', workflow: ['Ny order', 'Behandlas', 'Levererad'] },
  { id: 'quality', keys: ['kvalitet', 'kontroll', 'kontrollpunkt', 'åtgärd', 'atgard', 'checklista', 'revision'], name: 'Kvalitetskontroll', entity: 'Kontroll', plural: 'kontroller', understoodAs: 'Kvalitetskontroll', workflow: ['Planerad', 'Utförd', 'Avvikelse'] },
  { id: 'timesheet', keys: ['tidrapport', 'tidrapportering', 'timmar', 'vecka', 'närvaro', 'narvaro'], name: 'Tidrapportering', entity: 'Tidrapport', plural: 'tidrapporter', understoodAs: 'Tidrapportering', workflow: ['Skapa rapport', 'Granskas', 'Godkänd'] },
  { id: 'deviation', keys: ['avvikelse', 'avvikelser', 'incident', 'felanmälan', 'felanmalan'], name: 'Avvikelser', entity: 'Avvikelse', plural: 'avvikelser', understoodAs: 'Avvikelsehantering', workflow: ['Rapporterad', 'Pågår', 'Åtgärdad'] },
  { id: 'projects', keys: ['projekt', 'projektuppföljning', 'milestone', 'deadline'], name: 'Projektuppföljning', entity: 'Projekt', plural: 'projekt', understoodAs: 'Projektuppföljning', workflow: ['Planerat', 'Pågår', 'Klart'] },
]

const normalize = (value: string) => value.toLocaleLowerCase('sv-SE')

const wordMatch = (haystack: string, key: string) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^\\p{L}])${escaped}(?:[^\\p{L}]|$)`, 'iu').test(haystack)
}

const scoreDomain = (domain: Domain, haystack: string) => {
  return domain.keys.reduce((score, key) => score + (wordMatch(haystack, key) ? 1 : 0), 0)
}

const useCaseBonus: Record<string, string> = {
  Tidrapportering: 'timesheet',
  Beställningar: 'orders',
  Kvalitetskontroller: 'quality',
  Avvikelsehantering: 'deviation',
  Projektuppföljning: 'projects',
}

const pickDomain = (useCase: string, explanation: string, columns: string[]): Domain => {
  const explanationText = normalize(explanation)
  const columnText = normalize(columns.join(' '))
  const useCaseText = normalize(useCase)
  const ranked = DOMAINS.map((domain) => ({
    domain,
    score:
      scoreDomain(domain, explanationText) * 4
      + scoreDomain(domain, useCaseText) * 2
      + scoreDomain(domain, columnText)
      + (useCaseBonus[useCase] === domain.id ? 3 : 0),
  })).sort((a, b) => b.score - a.score)

  if (ranked[0] && ranked[0].score > 0) return ranked[0].domain
  if (useCase && useCase !== 'Annat') {
    const fromUseCase = DOMAINS.find((domain) => scoreDomain(domain, useCaseText) > 0)
    if (fromUseCase) return fromUseCase
  }
  return {
    id: 'generic',
    keys: [],
    name: useCase && useCase !== 'Annat' ? useCase : 'Ert arbetsflöde',
    entity: 'Post',
    plural: 'poster',
    understoodAs: explanation.trim() ? explanation.trim().slice(0, 60) : 'Ett Excel-arbetsflöde',
    workflow: ['Registrera', 'Uppföljning', 'Klar'],
  }
}

const mentions = (text: string, terms: string[]) => terms.some((term) => text.includes(term))

const isStatusColumn = (column: AnalyzedColumn) => /status|godk[aä]nd|läge|lage|state/i.test(column.name) || column.type === 'select' && /status|godk/i.test(column.name)

const fieldFromColumn = (column: AnalyzedColumn): AppField => {
  const optional = /kommentar|comment|anteckning|notering|åtgärd|atgard|beskrivning/i.test(column.name)
  const emptyRatio = column.filledCount + column.emptyCount === 0 ? 1 : column.emptyCount / (column.filledCount + column.emptyCount)
  return {
    key: column.name,
    name: column.name,
    type: column.type,
    required: !optional && emptyRatio < 0.45,
    options: column.type === 'select' ? column.uniqueValues : undefined,
  }
}

const pickPrimaryField = (fields: AppField[], explanation: string) => {
  const text = normalize(explanation)
  const mentioned = fields.find((field) => field.type !== 'number' && text.includes(normalize(field.name)))
  if (mentioned) return mentioned.key
  const preferred = fields.find((field) => /namn|titel|kurs|kund|order|produkt|kontrollpunkt|beskrivning/i.test(field.name) && field.type !== 'number')
  return preferred?.key || fields.find((field) => field.type === 'text')?.key || fields[0]?.key || 'Rad'
}

const pickStatusField = (fields: AppField[], columns: AnalyzedColumn[]) => {
  const byName = fields.find((field) => isStatusColumn(columns.find((column) => column.name === field.key) || { name: field.name, type: field.type, uniqueValues: [], emptyCount: 0, filledCount: 0 }))
  if (byName) return byName.key
  return fields.find((field) => field.type === 'select')?.key
}

const numberFieldForSum = (fields: AppField[]) => (
  fields.find((field) => field.type === 'number' && /belopp|pris|sum|kostnad|tim|antal/i.test(field.name))
  || fields.find((field) => field.type === 'number')
)

export const generateAppSpec = (input: {
  useCase: string
  explanation: string
  analysis: WorkbookAnalysis
}): AppSpec => {
  const sheet = primarySheet(input.analysis)
  const explanation = input.explanation.trim()
  const domain = pickDomain(input.useCase, explanation, sheet.columns.map((column) => column.name))
  const fields = sheet.columns.map(fieldFromColumn)
  const primaryField = pickPrimaryField(fields, explanation)
  const statusField = pickStatusField(fields, sheet.columns)
  const amountField = numberFieldForSum(fields)
  const wantsApproval = mentions(normalize(explanation + ' ' + input.useCase), ['godkänn', 'godkann', 'granska', 'chef', 'attest'])
    || Boolean(statusField && /godk/i.test(statusField))
    || domain.id === 'timesheet'

  const features: AppSpec['features'] = ['search', 'create', 'edit', 'delete']
  if (statusField) features.splice(1, 0, 'filter')
  if (wantsApproval && statusField) features.push('approvals')

  const metrics: AppMetric[] = [
    { id: 'count', label: `Antal ${domain.plural}`, kind: 'count' },
  ]
  if (amountField) metrics.push({ id: 'sum', label: amountField.name, kind: 'sum', field: amountField.key })
  if (statusField) {
    const options = fields.find((field) => field.key === statusField)?.options || []
    const open = options.find((option) => /väntar|vant|öppen|oppen|pågående|pagaende|ny|planerad/i.test(option)) || options[0]
    if (open) metrics.push({ id: 'open', label: open, kind: 'status-count', field: statusField, match: open })
  }

  const suggestedActions = [
    `Sök bland ${domain.plural}`,
    `Skapa ${domain.entity.toLocaleLowerCase('sv-SE')}`,
    `Redigera ${domain.entity.toLocaleLowerCase('sv-SE')}`,
  ]
  if (statusField) suggestedActions.push('Filtrera på status')
  if (features.includes('approvals')) suggestedActions.push('Godkänn eller avvisa')

  const description = explanation
    || `App byggd från ${input.analysis.fileName} med ${sheet.rowCount} ${domain.plural}.`

  return {
    name: domain.name,
    description,
    entityName: domain.entity,
    entityNamePlural: domain.plural,
    primaryField,
    statusField,
    fields,
    features,
    metrics,
    workflow: statusField
      ? (fields.find((field) => field.key === statusField)?.options?.length
        ? fields.find((field) => field.key === statusField)!.options!
        : domain.workflow)
      : domain.workflow,
    suggestedActions,
    sheetName: sheet.name,
    understoodAs: domain.understoodAs,
  }
}

export const specToWorkflowFields = (spec: AppSpec) => spec.fields.map((field) => ({
  name: field.name,
  type: field.type === 'number' ? 'Number' : field.type === 'date' ? 'Date' : field.type === 'select' ? 'Status' : 'Text',
  required: field.required,
  value: '',
}))
