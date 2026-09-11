import { primarySheet, sheetSemantics, type AnalyzedColumn, type WorkbookAnalysis } from './excel'
import { prettyLabel, type MatrixGroup, type SemanticModel } from './semantics'

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

export type ExperienceKpi = {
  id: string
  label: string
  kind: 'count' | 'sum' | 'status-count' | 'sum-group' | 'balance' | 'ratio'
  field?: string
  match?: string
  groupId?: string
  format?: 'number' | 'currency' | 'percent'
}

export type ExperienceChart = {
  id: string
  title: string
  kind: 'groups-by-period' | 'series-totals' | 'status-distribution'
  groupIds?: string[]
}

export type ExperienceNavItem = {
  id: string
  label: string
  screen: 'dashboard' | 'use' | 'group' | 'reports' | 'builder' | 'team'
  groupId?: string
  icon: 'chart' | 'clipboard' | 'settings' | 'users' | 'check'
}

export type ExperienceQuickAction = {
  id: string
  label: string
  groupId?: string
}

export type ExperiencePlan = {
  layout: 'period-matrix' | 'records'
  title: string
  primaryGoal: string
  periods: string[]
  groups: MatrixGroup[]
  navigation: ExperienceNavItem[]
  kpis: ExperienceKpi[]
  charts: ExperienceChart[]
  quickActions: ExperienceQuickAction[]
  emptyPrompt: string
}

export type AppQuality = {
  dataUnderstanding: number
  userIntent: number
  informationArchitecture: number
  dailyUsability: number
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
  experience?: ExperiencePlan
  quality?: AppQuality
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
  { id: 'budget', keys: ['budget', 'utgift', 'utgifter', 'inkomst', 'belopp', 'kostnad', 'leverantör', 'leverantor', 'kategori', 'ekonomi'], name: 'Budget', entity: 'Transaktion', plural: 'transaktioner', understoodAs: 'Budget och utgifter', workflow: ['Registrera', 'Följ upp', 'Klar'] },
  { id: 'orders', keys: ['order', 'ordrar', 'orderhantering', 'ordernummer', 'kundorder', 'kundordrar', 'beställ', 'bestall', 'produkt', 'leverans'], name: 'Orderhantering', entity: 'Order', plural: 'ordrar', understoodAs: 'Orderhantering', workflow: ['Ny order', 'Behandlas', 'Levererad'] },
  { id: 'quality', keys: ['kvalitet', 'kontroll', 'kontrollpunkt', 'åtgärd', 'atgard', 'checklista', 'revision'], name: 'Kvalitetskontroll', entity: 'Kontroll', plural: 'kontroller', understoodAs: 'Kvalitetskontroll', workflow: ['Planerad', 'Utförd', 'Avvikelse'] },
  { id: 'timesheet', keys: ['tidrapport', 'tidrapportering', 'timmar', 'vecka', 'närvaro', 'narvaro'], name: 'Tidrapportering', entity: 'Tidrapport', plural: 'tidrapporter', understoodAs: 'Tidrapportering', workflow: ['Skapa rapport', 'Granskas', 'Godkänd'] },
  { id: 'deviation', keys: ['avvikelse', 'avvikelser', 'incident', 'felanmälan', 'felanmalan'], name: 'Avvikelser', entity: 'Avvikelse', plural: 'avvikelser', understoodAs: 'Avvikelsehantering', workflow: ['Rapporterad', 'Pågår', 'Åtgärdad'] },
  { id: 'projects', keys: ['projekt', 'projektuppföljning', 'milestone', 'deadline'], name: 'Projektuppföljning', entity: 'Projekt', plural: 'projekt', understoodAs: 'Projektuppföljning', workflow: ['Planerat', 'Pågår', 'Klart'] },
  { id: 'inventory', keys: ['lager', 'inventory', 'artikel', 'sku', 'saldo', 'produktnr', 'stock'], name: 'Lager', entity: 'Artikel', plural: 'artiklar', understoodAs: 'Lagerhantering', workflow: ['Inleverans', 'I lager', 'Beställ'] },
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

const pickDomain = (useCase: string, explanation: string, columns: string[], semantics: SemanticModel): Domain => {
  const explanationText = normalize(explanation)
  const columnText = normalize(columns.join(' '))
  const useCaseText = normalize(useCase)
  const structureText = normalize([semantics.title, ...semantics.groups.map((group) => group.title)].join(' '))
  const ranked = DOMAINS.map((domain) => ({
    domain,
    score:
      scoreDomain(domain, explanationText) * 4
      + scoreDomain(domain, useCaseText) * 2
      + scoreDomain(domain, columnText)
      + scoreDomain(domain, structureText)
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
    name: semantics.title || (useCase && useCase !== 'Annat' ? useCase : 'Ert arbetsflöde'),
    entity: semantics.layout === 'period-matrix' ? 'Transaktion' : 'Post',
    plural: semantics.layout === 'period-matrix' ? 'transaktioner' : 'poster',
    understoodAs: explanation.trim() ? explanation.trim().slice(0, 80) : semantics.title || 'Ett Excel-arbetsflöde',
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
  const preferred = fields.find((field) => /namn|titel|kurs|kund|order|produkt|kontrollpunkt|beskrivning|kategori/i.test(field.name) && field.type !== 'number')
  return preferred?.key || fields.find((field) => field.type === 'text' || field.type === 'select')?.key || fields[0]?.key || 'Rad'
}

const pickStatusField = (fields: AppField[], columns: AnalyzedColumn[]) => {
  const byName = fields.find((field) => isStatusColumn(columns.find((column) => column.name === field.key) || { name: field.name, type: field.type, uniqueValues: [], emptyCount: 0, filledCount: 0 }))
  if (byName) return byName.key
  return fields.find((field) => field.type === 'select' && /status|läge|lage/i.test(field.name))?.key
}

const numberFieldForSum = (fields: AppField[]) => (
  fields.find((field) => field.type === 'number' && /belopp|pris|sum|kostnad|tim|antal|amount/i.test(field.name))
  || fields.find((field) => field.type === 'number')
)

const hintFor = (semantics: SemanticModel, pattern: RegExp) =>
  semantics.kpiHints.find((hint) => pattern.test(hint.label))

const actionLabelForGroup = (group: MatrixGroup) => {
  if (group.kind === 'in') return 'Lägg till inkomst'
  if (group.kind === 'out') return 'Lägg till utgift'
  return `Lägg till ${group.title.toLocaleLowerCase('sv-SE')}`
}

const matrixFields = (semantics: SemanticModel): AppField[] => {
  const categories = [...new Set(semantics.groups.flatMap((group) => group.series.filter((item) => item.role === 'data').map((item) => item.name)))]
  return [
    { key: 'group', name: 'Grupp', type: 'select', required: true, options: semantics.groups.map((group) => group.title) },
    { key: 'category', name: 'Kategori', type: 'select', required: true, options: categories },
    { key: 'period', name: 'Period', type: 'select', required: true, options: semantics.periods },
    { key: 'amount', name: 'Belopp', type: 'number', required: true },
    { key: 'note', name: 'Anteckning', type: 'text', required: false },
  ]
}

const buildMatrixExperience = (semantics: SemanticModel, explanation: string): ExperiencePlan => {
  const inGroups = semantics.groups.filter((group) => group.kind === 'in')
  const outGroups = semantics.groups.filter((group) => group.kind === 'out')
  const kpis: ExperienceKpi[] = []
  semantics.groups.forEach((group) => {
    const hint = hintFor(semantics, new RegExp(group.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
      || (group.kind === 'in' ? hintFor(semantics, /income|inkomst|intäkt/i) : group.kind === 'out' ? hintFor(semantics, /expense|utgift|kostnad/i) : undefined)
    kpis.push({
      id: `sum-${group.id}`,
      label: hint?.label || `Totalt ${group.title.toLocaleLowerCase('sv-SE')}`,
      kind: 'sum-group',
      groupId: group.id,
      format: 'currency',
    })
  })
  if (inGroups.length && outGroups.length) {
    kpis.push({
      id: 'balance',
      label: hintFor(semantics, /balance|saldo|netto/i)?.label || 'Saldo',
      kind: 'balance',
      format: 'currency',
    })
    kpis.push({
      id: 'ratio',
      label: hintFor(semantics, /percent|procent|spent|andel/i)?.label || 'Andel använd',
      kind: 'ratio',
      format: 'percent',
    })
  }

  const charts: ExperienceChart[] = []
  if (semantics.periods.length >= 3 && semantics.groups.length) {
    charts.push({
      id: 'by-period',
      title: semantics.groups.map((group) => group.title).join(' och '),
      kind: 'groups-by-period',
      groupIds: semantics.groups.map((group) => group.id),
    })
  }
  const breakdown = (outGroups.length ? outGroups : [...semantics.groups])
    .slice()
    .sort((a, b) => b.series.filter((item) => item.role === 'data').length - a.series.filter((item) => item.role === 'data').length)[0]
  if (breakdown) {
    charts.push({
      id: `cats-${breakdown.id}`,
      title: breakdown.title,
      kind: 'series-totals',
      groupIds: [breakdown.id],
    })
  }

  const navigation: ExperienceNavItem[] = [
    { id: 'dashboard', label: 'Översikt', screen: 'dashboard', icon: 'chart' },
    ...semantics.groups.map((group) => ({
      id: `group-${group.id}`,
      label: group.title,
      screen: 'group' as const,
      groupId: group.id,
      icon: 'clipboard' as const,
    })),
  ]
  if (charts.length) navigation.push({ id: 'reports', label: 'Rapporter', screen: 'reports', icon: 'chart' })

  return {
    layout: 'period-matrix',
    title: semantics.title,
    primaryGoal: explanation.trim() || 'Följ värden över tid utan att redigera Excel.',
    periods: semantics.periods,
    groups: semantics.groups,
    navigation,
    kpis: kpis.slice(0, 4),
    charts: charts.slice(0, 2),
    quickActions: semantics.groups.map((group) => ({ id: `add-${group.id}`, label: actionLabelForGroup(group), groupId: group.id })),
    emptyPrompt: `Lägg till din första ${semantics.groups[0] ? semantics.groups[0].title.toLocaleLowerCase('sv-SE') : 'post'} för att komma igång.`,
  }
}

const buildRecordsExperience = (
  domain: Domain,
  fields: AppField[],
  statusField: string | undefined,
  amountField: AppField | undefined,
  explanation: string,
): ExperiencePlan => {
  const kpis: ExperienceKpi[] = [
    { id: 'count', label: `Antal ${domain.plural}`, kind: 'count', format: 'number' },
  ]
  if (amountField) kpis.push({ id: 'sum', label: amountField.name, kind: 'sum', field: amountField.key, format: /belopp|pris|kostnad|sum/i.test(amountField.name) ? 'currency' : 'number' })
  if (statusField) {
    const options = fields.find((field) => field.key === statusField)?.options || []
    const open = options.find((option) => /väntar|vant|öppen|oppen|pågående|pagaende|ny|planerad/i.test(option)) || options[0]
    if (open) kpis.push({ id: 'open', label: open, kind: 'status-count', field: statusField, match: open, format: 'number' })
  }
  const charts: ExperienceChart[] = []
  if (statusField && (fields.find((field) => field.key === statusField)?.options?.length || 0) >= 2) {
    charts.push({ id: 'status', title: 'Fördelning', kind: 'status-distribution' })
  }
  return {
    layout: 'records',
    title: domain.name,
    primaryGoal: explanation.trim() || `Hantera ${domain.plural} utan Excel.`,
    periods: [],
    groups: [],
    navigation: [
      { id: 'dashboard', label: 'Översikt', screen: 'dashboard', icon: 'chart' },
      { id: 'records', label: domain.plural[0].toUpperCase() + domain.plural.slice(1), screen: 'use', icon: 'clipboard' },
    ],
    kpis: kpis.slice(0, 4),
    charts,
    quickActions: [{ id: 'add', label: `Ny ${domain.entity.toLocaleLowerCase('sv-SE')}` }],
    emptyPrompt: `Inga ${domain.plural} ännu. Skapa den första för att komma igång.`,
  }
}

const scoreQuality = (experience: ExperiencePlan, explanation: string): AppQuality => {
  const dataUnderstanding = experience.layout === 'period-matrix'
    ? Math.min(100, 55 + experience.groups.length * 12 + (experience.periods.length >= 6 ? 15 : 0))
    : Math.min(100, 50 + experience.kpis.length * 10)
  const userIntent = explanation.trim().length > 20 ? 86 : 58
  const informationArchitecture = Math.min(100, 40 + experience.navigation.length * 12 + experience.charts.length * 8)
  const dailyUsability = Math.min(100, 45 + experience.quickActions.length * 18 + (experience.layout === 'period-matrix' ? 20 : 8))
  return { dataUnderstanding, userIntent, informationArchitecture, dailyUsability }
}

export const generateAppSpec = (input: {
  useCase: string
  explanation: string
  analysis: WorkbookAnalysis
}): AppSpec => {
  const sheet = primarySheet(input.analysis)
  const explanation = input.explanation.trim()
  const semantics = sheetSemantics(input.analysis, explanation)
  const domain = pickDomain(input.useCase, explanation, sheet.columns.map((column) => column.name), semantics)
  const matrix = semantics.layout === 'period-matrix'
  const fields = matrix ? matrixFields(semantics) : sheet.columns.map(fieldFromColumn)
  const primaryField = matrix ? 'category' : pickPrimaryField(fields, explanation)
  const statusField = matrix ? undefined : pickStatusField(fields, sheet.columns)
  const amountField = numberFieldForSum(fields)
  const wantsApproval = mentions(normalize(explanation + ' ' + input.useCase), ['godkänn', 'godkann', 'granska', 'chef', 'attest'])
    || Boolean(statusField && /godk/i.test(statusField))
    || domain.id === 'timesheet'

  const features: AppSpec['features'] = ['search', 'create', 'edit', 'delete']
  if (statusField || matrix) features.splice(1, 0, 'filter')
  if (wantsApproval && statusField) features.push('approvals')

  const experience = matrix
    ? buildMatrixExperience(semantics, explanation)
    : buildRecordsExperience(domain, fields, statusField, amountField, explanation)

  const metrics: AppMetric[] = [
    { id: 'count', label: `Antal ${matrix ? 'transaktioner' : domain.plural}`, kind: 'count' },
  ]
  if (amountField) metrics.push({ id: 'sum', label: amountField.name, kind: 'sum', field: amountField.key })
  if (statusField) {
    const options = fields.find((field) => field.key === statusField)?.options || []
    const open = options.find((option) => /väntar|vant|öppen|oppen|pågående|pagaende|ny|planerad/i.test(option)) || options[0]
    if (open) metrics.push({ id: 'open', label: open, kind: 'status-count', field: statusField, match: open })
  }

  const suggestedActions = [
    ...experience.quickActions.map((action) => action.label),
    ...(experience.charts.length ? ['Se trender i översikten'] : []),
    `Sök bland ${matrix ? 'transaktioner' : domain.plural}`,
  ]

  const understoodAs = matrix
    ? (semantics.title ? prettyLabel(semantics.title) : domain.understoodAs)
    : domain.understoodAs

  const name = matrix && semantics.title ? prettyLabel(semantics.title) : domain.name

  return {
    name,
    description: explanation || `App byggd från ${input.analysis.fileName}.`,
    entityName: matrix ? 'Transaktion' : domain.entity,
    entityNamePlural: matrix ? 'transaktioner' : domain.plural,
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
    understoodAs,
    experience,
    quality: scoreQuality(experience, explanation),
  }
}

export const specToWorkflowFields = (spec: AppSpec) => spec.fields.map((field) => ({
  name: field.name,
  type: field.type === 'number' ? 'Number' : field.type === 'date' ? 'Date' : field.type === 'select' ? 'Status' : 'Text',
  required: field.required,
  value: '',
}))
