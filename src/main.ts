import './style.css'
import * as XLSX from 'xlsx'

type IconName =
  | 'arrow'
  | 'spark'
  | 'check'
  | 'upload'
  | 'clock'
  | 'layers'
  | 'mail'
  | 'eye'
  | 'clipboard'
  | 'shield'
  | 'chart'
  | 'box'
  | 'users'
  | 'settings'
  | 'menu'
  | 'close'
  | 'search'
  | 'bell'
  | 'filter'
  | 'plus'
  | 'file'
  | 'message'
  | 'workflow'

const icon = (name: IconName, size = 18) => {
  const paths: Record<IconName, string> = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    spark: '<path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 15v4h14v-4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/>',
    layers: '<path d="m12 4 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h4"/>',
    shield: '<path d="M12 3 19 6v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M4 19V5M4 19h17"/><path d="m7 15 3-4 3 2 5-7"/>',
    box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3 19c.5-3 2.5-5 6-5s5.5 2 6 5M16 6.5a3 3 0 0 1 0 5.5M18 14c1.5.5 2.5 2 3 4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.77 1.77-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-2.5v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-1.77-1.77.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3v-2.5h.07A1.65 1.65 0 0 0 4.6 11a1.65 1.65 0 0 0-.33-1.82l-.06-.06L6 7.35l.06.06A1.65 1.65 0 0 0 7.88 7.7 1.65 1.65 0 0 0 8.9 6.2V6h2.5v.07a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.77 1.77-.06.06A1.65 1.65 0 0 0 19.4 11c.86.1 1.51.7 1.53 1.5H21v2.5h-.07A1.65 1.65 0 0 0 19.4 15Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    filter: '<path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M7 3h8l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5"/>',
    message: '<path d="M4 5h16v11H8l-4 4V5Z"/>',
    workflow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 7.2 15.5 11M8.5 16.8 15.5 13"/>',
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}

const av = (initials: string, tone: string) => `<span class="av av-${tone}">${initials}</span>`

const navMap = [
  ['Produkt', 'produkt'],
  ['Så fungerar det', 'process'],
  ['Exempel', 'exempel'],
  ['Priser', 'priser'],
] as const

const header = () => `
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#top" aria-label="Flowly startsida"><span class="brand-mark">f</span>flowly</a>
      <nav class="desktop-nav" aria-label="Huvudmeny">${navMap.map(([label, id]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
      <div class="header-actions">
        <a class="login-link" href="#faq">Logga in</a>
        <a class="button button-dark button-small" href="#cta">Testa gratis ${icon('arrow', 14)}</a>
      </div>
      <button class="icon-button mobile-menu-trigger" type="button" aria-label="Öppna meny">${icon('menu')}</button>
    </div>
  </header>
  <a class="mobile-sticky-cta" href="#upload">Testa gratis ${icon('arrow', 15)}</a>
  <div class="mobile-menu" aria-hidden="true">
    <button class="icon-button mobile-menu-close" type="button" aria-label="Stäng meny">${icon('close')}</button>
    ${navMap.map(([label, id]) => `<a href="#${id}">${label}</a>`).join('')}
    <a href="#faq">Logga in</a>
    <a class="mobile-cta" href="#cta">Testa gratis ${icon('arrow', 16)}</a>
  </div>
`

const excelGrid = () => {
  const rows = [
    ['1', 'Namn', 'Vecka', 'Projekt', 'Timmar', 'Status'],
    ['2', 'Anna Andersson', '36', 'Atlas', '38', 'Godkänd'],
    ['3', 'Erik Johansson', '36', 'Nova', '40', 'Väntar'],
    ['4', 'Sara Nilsson', '36', 'Atlas', '36', 'Godkänd'],
    ['5', 'Johan Lind', '36', 'Nova', '32', 'Skickad'],
    ['6', 'Maria Berg', '36', 'Atlas', '40', 'Godkänd'],
    ['7', 'Noah Holm', '36', 'Nova', '28', 'Skickad'],
    ['8', 'Lea Fors', '36', 'Atlas', '37', 'Godkänd'],
  ]
  return `
    <div class="xl-grid">
      <div class="xl-cols"><i></i><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>
      ${rows.map((row, i) => `<div class="xl-row${i === 0 ? ' is-head' : ''}${i === 2 ? ' is-active' : ''}">${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}
    </div>
  `
}

const hero = () => `
  <section class="hero" id="top">
    <div class="hero-aura" aria-hidden="true"></div>
    <div class="hero-copy reveal">
      <p class="eyebrow"><span class="eyebrow-dot"></span>Från kalkylark till arbetsflöde</p>
      <h1>Förvandla ert <em>Excel-kaos</em> till en riktig app.</h1>
      <p class="hero-lead">Har ni ett arbetsflöde som fortfarande lever i Excel, mejl och Teams? Ladda upp filen och gör processen enklare, strukturerad och mindre manuell.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#upload">Ladda upp en Excel-fil ${icon('arrow', 16)}</a>
        <a class="text-link" href="#process">Se hur det fungerar <span>${icon('arrow', 16)}</span></a>
      </div>
      <p class="trust-note">${icon('check', 14)} Ingen kod. Ingen lång implementation.</p>
    </div>

    <div class="hero-demo reveal" id="produkt" data-stage="excel">
      <div class="demo-meta">
        <span class="live-dot"></span>
        <span>Excel → Flowly → Webbapp</span>
        <span class="demo-caption">förhandsvisning</span>
      </div>
      <div class="stage-tabs" role="tablist" aria-label="Produktdemo">
        <button type="button" class="is-active" data-panel="excel">Excel-fil</button>
        <button type="button" data-panel="flowly">Flowly</button>
        <button type="button" data-panel="app">Webbapp</button>
      </div>
      <div class="demo-stage">
        <article class="stage-panel excel-panel" data-panel="excel">
          <div class="xl-window">
            <div class="xl-titlebar">
              <span class="xl-badge">X</span>
              <div>
                <strong>tidrapportering.xlsx</strong>
                <small>Ändrad idag, 08:42 · 28 rader</small>
              </div>
              <span class="xl-status" data-excel-status>Analyserar fil…</span>
            </div>
            <div class="xl-ribbon"><span>Arkiv</span><span class="is-on">Hem</span><span>Infoga</span><span>Data</span></div>
            <div class="xl-formula"><span>fx</span> =SUM(D2:D28)</div>
            ${excelGrid()}
            <div class="xl-sheets"><span class="is-on">Tidrapporter</span><span>Inställningar</span><span>+</span></div>
            <div class="xl-scan" aria-hidden="true"></div>
          </div>
        </article>

        <article class="stage-panel analyze-panel" data-panel="flowly">
          <div class="analyze-card">
            <div class="analyze-head">
              <span class="brand-mark sm">f</span>
              <div>
                <strong>Flowly analyserar arbetsflödet</strong>
                <small>Läser kolumner, roller och godkännanden</small>
              </div>
            </div>
            <ol class="analyze-steps">
              <li data-step="0"><span>✓</span> Kolumner identifierade</li>
              <li data-step="1"><span>✓</span> Roller identifierade</li>
              <li data-step="2"><span>✓</span> Godkännandeflöde hittat</li>
              <li data-step="3"><span>✓</span> Formulär skapat</li>
            </ol>
            <div class="analyze-map">
              <span>Anställd fyller i</span>
              <i></i>
              <span>Chef godkänner</span>
              <i></i>
              <span>Ekonomi exporterar</span>
            </div>
          </div>
        </article>

        <article class="stage-panel app-panel" data-panel="app">
          <div class="mini-app">
            <div class="mini-app-bar">
              <span class="mini-brand"><span class="brand-mark sm">f</span> Flowly</span>
              <label class="mini-search">${icon('search', 12)}<span>Sök rapport eller namn</span></label>
              <span class="mini-bell">${icon('bell', 13)}<b>2</b></span>
              ${av('AA', 'peach')}
            </div>
            <div class="mini-app-body">
              <aside class="mini-side">
                <a class="is-on">${icon('check', 13)} Godkännanden</a>
                <a>${icon('clipboard', 13)} Rapporter</a>
                <a>${icon('users', 13)} Team</a>
              </aside>
              <div class="mini-main">
                <div class="mini-head">
                  <div>
                    <small>Den här veckan</small>
                    <h3>Veckans tidrapporter</h3>
                  </div>
                  <span class="badge badge-ok">3 klara</span>
                </div>
                <div class="mini-filters">
                  <button type="button" class="chip is-on">Alla</button>
                  <button type="button" class="chip">Väntar</button>
                  <button type="button" class="chip">${icon('filter', 11)} Filter</button>
                </div>
                <div class="report-table">
                  <div class="report-row" data-person="anna">${av('AA', 'peach')}<div><strong>Anna Andersson</strong><small>Atlas · 38 h · 09:14</small></div><span class="badge badge-ok">Godkänd</span></div>
                  <div class="report-row is-focus" data-person="erik">${av('EJ', 'blue')}<div><strong>Erik Johansson</strong><small>Nova · 40 h · 10:02</small></div><span class="badge badge-wait" data-erik-status>Väntar på godkännande</span></div>
                  <div class="report-row" data-person="sara">${av('SN', 'sand')}<div><strong>Sara Nilsson</strong><small>Atlas · 36 h · 08:51</small></div><span class="badge badge-ok">Godkänd</span></div>
                </div>
                <div class="hero-approve">
                  <p>Erik väntar på din signatur.</p>
                  <button type="button" class="button button-primary button-tiny approve-demo">Godkänn rapport</button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
`

const chaos = () => `
  <section class="story-section chaos-section" id="exempel">
    <div class="section-intro reveal">
      <p class="eyebrow">01 — 02</p>
      <h2>Ni har redan processen.<br /><em>Problemet är allt runt omkring.</em></h2>
      <p>Det börjar med en enkel fil. Sedan kommer mejlen, Teams-trådarna och versionerna som heter <strong>rapport_FINAL.xlsx</strong>.</p>
    </div>
    <div class="chaos-stage reveal" id="chaos-stage">
      <article class="chaos-item file f1">${icon('file', 14)} rapport.xlsx</article>
      <article class="chaos-item file f2">${icon('file', 14)} rapport_final.xlsx</article>
      <article class="chaos-item file f3">${icon('file', 14)} rapport_final2.xlsx</article>
      <article class="chaos-item file f4">${icon('file', 14)} rapport_FINAL.xlsx</article>
      <article class="chaos-item msg m1">${icon('message', 14)}<div><strong>Teams · Lisa</strong><small>Kan du kolla senaste filen?</small></div></article>
      <article class="chaos-item msg m2">${icon('mail', 14)}<div><strong>Fwd: tidrapport v.36</strong><small>Ekonomi behöver underlaget idag.</small></div></article>
      <article class="chaos-item note n1">Glöm inte kopiera till ekonomi-fliken innan du skickar.</article>
      <article class="chaos-item sheet s1">
        <div class="tiny-sheet"><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <small>Manuell dubbelregistrering</small>
      </article>
      <div class="chaos-result">
        <div class="brand-row"><span class="brand-mark">f</span> En process. En källa.</div>
        <div class="chaos-app">
          <div class="chaos-app-row">${av('AA', 'peach')}<span>Anna Andersson</span><b>38 h</b><em>Godkänd</em></div>
          <div class="chaos-app-row">${av('EJ', 'blue')}<span>Erik Johansson</span><b>40 h</b><em class="wait">Väntar</em></div>
          <div class="chaos-app-row">${av('SN', 'sand')}<span>Sara Nilsson</span><b>36 h</b><em>Godkänd</em></div>
        </div>
      </div>
    </div>
    <div class="section-next-step reveal">
      <div>
        <strong>Känner ni igen er?</strong>
        <p>Börja med det arbetsflöde som skapar mest manuellt arbete.</p>
      </div>
      <a class="text-link" href="#upload">Visa hur Flowly löser det ${icon('arrow', 16)} </a>
    </div>
  </section>
`

const transform = () => `
  <section class="story-section transform-section" id="process">
    <div class="section-intro centered reveal">
      <p class="eyebrow">03</p>
      <h2>Behåll processen.<br /><em>Ta bort kaoset.</em></h2>
      <p>Flowly kräver inte att ni byter ut allt. Vi gör det manuella arbetet runt era befintliga system enklare.</p>
    </div>
    <div class="transform-stage reveal">
      <div class="before-col">
        <p class="col-label">Före</p>
        <div class="before-stack">
          <div class="before-card">${icon('file', 16)} Excel</div>
          <div class="before-card">${icon('mail', 16)} Mejl</div>
          <div class="before-card">${icon('message', 16)} Teams</div>
          <div class="before-card">${icon('clipboard', 16)} Manuella steg</div>
        </div>
      </div>
      <div class="transform-axis" aria-hidden="true">
        <span>Flowly</span>
        <i></i>
      </div>
      <div class="after-col">
        <p class="col-label">Efter</p>
        <ol class="after-flow">
          <li>
            <div class="after-ui form-ui">
              <small>Formulär</small>
              <label>Vecka 36</label>
              <span class="fake-input">38 timmar</span>
            </div>
          </li>
          <li>
            <div class="after-ui flow-ui">
              <small>Arbetsflöde</small>
              <div class="pips"><i class="done"></i><i class="done"></i><i></i></div>
              <span>Chef nästa</span>
            </div>
          </li>
          <li>
            <div class="after-ui approve-ui">
              <small>Godkännande</small>
              <strong>Erik Johansson · 40 h</strong>
              <div class="mini-actions"><span>Godkänn</span><span class="ghost">Avvisa</span></div>
            </div>
          </li>
          <li>
            <div class="after-ui dash-ui">
              <small>Dashboard</small>
              <strong>23 / 25 klara</strong>
              <div class="bar"><i></i></div>
            </div>
          </li>
          <li>
            <div class="after-ui export-ui">
              <small>Export</small>
              <span>${icon('upload', 13)} tillbaka till Excel</span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
`

type ExcelAnalysis = {
  fileName: string
  sheetNames: string[]
  columns: string[]
  rows: string[][]
  rowCount: number
  formFields: string[]
  statusFields: string[]
}

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const matchesColumn = (column: string, terms: string[]) => {
  const normalized = column.toLocaleLowerCase('sv-SE')
  return terms.some((term) => normalized.includes(term))
}

const analyzeExcelFile = async (file: File): Promise<ExcelAnalysis> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const sheetNames = workbook.SheetNames
  const firstSheet = sheetNames[0] ? workbook.Sheets[sheetNames[0]] : undefined
  const matrix = firstSheet
    ? XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' })
    : []
  const nonEmptyRows = matrix.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
  const columns = (nonEmptyRows[0] ?? []).map((column, index) => String(column || `Kolumn ${index + 1}`).trim())
  const dataRows = nonEmptyRows.slice(1).map((row) => columns.map((_, index) => String(row[index] ?? '').trim()))

  if (!columns.length || !dataRows.length) throw new Error('EMPTY_WORKBOOK')

  const formFields = columns.filter((column) => !matchesColumn(column, ['godkänd', 'godkand', 'status', 'approved']))
  const statusFields = columns.filter((column) => matchesColumn(column, ['godkänd', 'godkand', 'status', 'approved']))

  return {
    fileName: file.name,
    sheetNames,
    columns,
    rows: dataRows.slice(0, 8),
    rowCount: dataRows.length,
    formFields: formFields.length ? formFields.slice(0, 5) : columns.slice(0, 5),
    statusFields,
  }
}

const uploadResult = () => '<div class="upload-result" id="upload-result" aria-live="polite" hidden></div>'

const renderAnalysisLoading = (fileName: string) => `
  <div class="analysis-loading">
    <div class="analysis-file"><span class="file-pulse">${icon('file', 22)}</span><div><strong>${escapeHtml(fileName)}</strong><small>Flowly läser filen lokalt i din browser</small></div></div>
    <p class="analysis-status">Analyserar filen...</p>
    <ol class="analysis-steps">
      <li class="is-done"><span>✓</span> Fil uppladdad</li>
      <li class="is-active"><span>→</span> Läser kolumner</li>
      <li><span>→</span> Analyserar struktur</li>
      <li><span>→</span> Förbereder arbetsflöde</li>
    </ol>
  </div>
`

const renderAnalysisError = (title: string, message: string) => `
  <div class="analysis-message error-message"><span class="message-icon">!</span><div><strong>${title}</strong><p>${message}</p></div><button type="button" class="button button-light analysis-retry">Försök igen</button></div>
`

const renderAnalysis = (analysis: ExcelAnalysis) => {
  const columnHeaders = analysis.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')
  const previewRows = analysis.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
  const statusLabel = analysis.statusFields[0] ?? 'Status'
  const processTitle = matchesColumn(analysis.columns.join(' '), ['tim', 'hour']) ? 'Tidrapportering' : 'Ert arbetsflöde'

  return `
    <div class="analysis-result-head">
      <div><p class="eyebrow">Analys klar</p><h3>Vi hittade ett arbetsflöde</h3><p>${escapeHtml(analysis.fileName)}</p></div>
      <button type="button" class="icon-button analysis-close" aria-label="Ladda upp en annan fil">${icon('close', 16)}</button>
    </div>
    <div class="analysis-stats"><div><strong>${analysis.sheetNames.length}</strong><span>ark</span></div><div><strong>${analysis.columns.length}</strong><span>kolumner</span></div><div><strong>${analysis.rowCount}</strong><span>rader</span></div></div>
    <div class="analysis-preview"><div class="analysis-section-label"><span>Förhandsvisning</span><small>Visar ${analysis.rows.length} av ${analysis.rowCount} rader</small></div><div class="preview-table-wrap"><table><thead><tr>${columnHeaders}</tr></thead><tbody>${previewRows}</tbody></table></div></div>
    <div class="workflow-suggestion"><div class="analysis-section-label"><span>Så här skulle Flowly kunna strukturera processen</span><small>Baserat på filens kolumnnamn</small></div><div class="workflow-track"><div class="workflow-node"><span class="node-kicker">01 · Formulär</span><strong>${analysis.formFields.map(escapeHtml).join(' · ')}</strong></div><i>↓</i><div class="workflow-node"><span class="node-kicker">02 · Godkännande</span><strong>${escapeHtml(statusLabel)}</strong></div><i>↓</i><div class="workflow-node"><span class="node-kicker">03 · Översikt</span><strong>${analysis.columns.slice(0, 4).map(escapeHtml).join(' · ')}</strong></div></div></div>
    <div class="flowly-preview"><div class="analysis-section-label"><span>Från Excel till app</span><small>Förhandsvisning</small></div><div class="preview-app"><aside><strong>Flowly</strong><span class="is-selected">${icon('chart', 13)} Översikt</span><span>${icon('clipboard', 13)} Mina uppgifter</span><span>${icon('check', 13)} Godkännanden</span></aside><div><small>Den här veckan</small><h4>${escapeHtml(processTitle)}</h4>${analysis.rows.slice(0, 3).map((row, index) => `<div class="preview-app-row"><span class="preview-avatar">${escapeHtml((row[0] || 'A').slice(0, 2).toUpperCase())}</span><strong>${escapeHtml(row[0] || `Rad ${index + 1}`)}</strong><span>${escapeHtml(row.find((cell) => /\d/.test(cell)) || 'Pågående')}</span><em class="${index === 1 ? 'is-waiting' : ''}">${escapeHtml(statusLabel)} ${index === 1 ? 'Väntar' : 'Godkänd'}</em></div>`).join('')}</div></div></div>
    <div class="analysis-cta"><div><h3>Vill ni göra det här till ett riktigt arbetsflöde?</h3><p>Det här är bara ett exempel på hur Flowly kan strukturera processen.</p></div><div><button type="button" class="button button-primary create-workflow">Skapa mitt arbetsflöde ${icon('arrow', 15)}</button><button type="button" class="text-link analysis-another">Ladda upp en annan fil</button></div></div>
  `
}

type WorkflowField = { name: string; type: string; required: boolean; value: string }
type Report = { id: number; values: Record<string, string>; status: 'Väntar' | 'Godkänd' | 'Avvisad' }
type FlowlyUser = {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}
type FlowlyWorkspace = {
  id: string
  ownerId: string
  name: string
  createdAt: string
  updatedAt: string
}
type FlowlyApp = {
  id: string
  workspaceId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'active'
  sourceFileName: string
  config: {
    topic: string
    fields: WorkflowField[]
    approver: string
    afterApproval: string
    published: boolean
    saved: boolean
    analysis?: ExcelAnalysis
  }
}
type FlowlyStore = {
  users: FlowlyUser[]
  workspaces: FlowlyWorkspace[]
  apps: FlowlyApp[]
  session: { userId: string | null }
}
type ProductState = {
  screen: 'onboarding' | 'projects' | 'dashboard' | 'workflows' | 'builder' | 'use' | 'approvals' | 'team' | 'settings'
  builderTab: 'form' | 'workflow' | 'approvals' | 'team'
  onboardingStep: 1 | 2 | 3 | 4
  topic: string
  customTopic: string
  analysis?: ExcelAnalysis
  fields: WorkflowField[]
  selectedField: number
  approver: string
  afterApproval: string
  saved: boolean
  published: boolean
  reports: Report[]
  currentAppId: string | null
  userName: string
  workspaceName: string
}

const FLOWLY_STORE_KEY = 'flowly-store-v1'
const FLOWLY_PRODUCT_STATE_KEY = 'flowly-product-state'

const readFlowlyStore = (): FlowlyStore => {
  try {
    const saved = localStorage.getItem(FLOWLY_STORE_KEY)
    if (!saved) return { users: [], workspaces: [], apps: [], session: { userId: null } }
    const parsed = JSON.parse(saved) as Partial<FlowlyStore>
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      apps: Array.isArray(parsed.apps) ? parsed.apps : [],
      session: { userId: parsed.session?.userId ?? null },
    }
  } catch {
    return { users: [], workspaces: [], apps: [], session: { userId: null } }
  }
}

const writeFlowlyStore = (store: FlowlyStore) => localStorage.setItem(FLOWLY_STORE_KEY, JSON.stringify(store))

const hashPassword = async (password: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`)

const setSessionUser = (userId: string | null) => {
  const store = readFlowlyStore()
  store.session.userId = userId
  writeFlowlyStore(store)
}

const getCurrentUser = (): FlowlyUser | null => {
  const store = readFlowlyStore()
  return store.users.find((user) => user.id === store.session.userId) ?? null
}

const getCurrentWorkspace = (): FlowlyWorkspace | null => {
  const user = getCurrentUser()
  if (!user) return null
  const store = readFlowlyStore()
  return store.workspaces.find((workspace) => workspace.ownerId === user.id) ?? null
}

const getCurrentWorkspaceApps = (): FlowlyApp[] => {
  const workspace = getCurrentWorkspace()
  if (!workspace) return []
  const store = readFlowlyStore()
  return store.apps.filter((app) => app.workspaceId === workspace.id)
}

const ensureCurrentWorkspace = (user: FlowlyUser): FlowlyWorkspace => {
  const store = readFlowlyStore()
  const existing = store.workspaces.find((workspace) => workspace.ownerId === user.id)
  if (existing) return existing
  const workspace: FlowlyWorkspace = {
    id: makeId(),
    ownerId: user.id,
    name: `${user.name.split(' ')[0] || 'Flowly'} workspace`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.workspaces.push(workspace)
  writeFlowlyStore(store)
  return workspace
}

const upsertWorkflowApp = (app: FlowlyApp) => {
  const store = readFlowlyStore()
  const existingIndex = store.apps.findIndex((entry) => entry.id === app.id)
  if (existingIndex >= 0) {
    store.apps[existingIndex] = app
  } else {
    store.apps.push(app)
  }
  writeFlowlyStore(store)
  return app
}

const loadAppIntoState = (app: FlowlyApp | null) => {
  if (!app) {
    productState.currentAppId = null
    productState.topic = ''
    productState.fields = []
    productState.approver = 'Chef'
    productState.afterApproval = 'Markera som klar'
    productState.saved = false
    productState.published = false
    productState.analysis = undefined
    return
  }
  productState.currentAppId = app.id
  productState.topic = app.config.topic || app.name
  productState.fields = app.config.fields.length ? app.config.fields : []
  productState.approver = app.config.approver || 'Chef'
  productState.afterApproval = app.config.afterApproval || 'Markera som klar'
  productState.saved = app.config.saved
  productState.published = app.config.published
  productState.analysis = app.config.analysis
  productState.userName = getCurrentUser()?.name || productState.userName
  productState.workspaceName = getCurrentWorkspace()?.name || productState.workspaceName
}

const productState: ProductState = {
  screen: 'onboarding', builderTab: 'form', onboardingStep: 1, topic: '', customTopic: '', fields: [], selectedField: 0,
  approver: 'Chef', afterApproval: 'Markera som klar', saved: false, published: false, reports: [], currentAppId: null,
  userName: 'Flowly användare', workspaceName: 'Flowly workspace',
}

const storedProductState = localStorage.getItem(FLOWLY_PRODUCT_STATE_KEY)
if (storedProductState) {
  try { Object.assign(productState, JSON.parse(storedProductState)) } catch { localStorage.removeItem(FLOWLY_PRODUCT_STATE_KEY) }
}

const persistProductState = () => localStorage.setItem(FLOWLY_PRODUCT_STATE_KEY, JSON.stringify(productState))

const currentUserProfile = () => getCurrentUser()
const currentWorkspaceProfile = () => getCurrentWorkspace()
const saveCurrentWorkflow = () => {
  const user = currentUserProfile()
  const workspace = currentWorkspaceProfile()
  if (!user || !workspace) return null

  const existing = productState.currentAppId ? readFlowlyStore().apps.find((app) => app.id === productState.currentAppId) ?? null : null
  const appId = existing?.id ?? makeId()
  const nextApp: FlowlyApp = {
    id: appId,
    workspaceId: workspace.id,
    name: productState.topic || existing?.name || 'Nytt arbetsflöde',
    description: productState.customTopic || existing?.description || `Arbetsflöde byggt från ${productState.analysis?.fileName || 'Excel'}`,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: productState.published ? 'active' : 'draft',
    sourceFileName: productState.analysis?.fileName || existing?.sourceFileName || 'excel-fil.xlsx',
    config: {
      topic: productState.topic,
      fields: productState.fields,
      approver: productState.approver,
      afterApproval: productState.afterApproval,
      published: productState.published,
      saved: true,
      analysis: productState.analysis,
    },
  }
  productState.currentAppId = nextApp.id
  productState.saved = true
  productState.published = nextApp.status === 'active'
  upsertWorkflowApp(nextApp)
  loadAppIntoState(nextApp)
  persistProductState()
  return nextApp
}

const authModal = () => `
  <div class="auth-overlay" id="auth-overlay" hidden>
    <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" class="icon-button auth-close" aria-label="Stäng">${icon('close', 17)}</button>
      <span class="brand auth-brand"><span class="brand-mark">f</span>flowly</span>
      <div class="auth-heading"><p class="eyebrow">${icon('spark', 12)} Flowly workspace</p><h2 id="auth-title">Skapa ditt Flowly-konto</h2><p class="auth-description">Skapa ett gratis konto och bygg ert första arbetsflöde.</p></div>
      <div class="auth-tabs"><button type="button" class="auth-tab is-active" data-auth-mode="signup">Skapa konto</button><button type="button" class="auth-tab" data-auth-mode="login">Logga in</button></div>
      <form class="auth-form" data-auth-form>
        <label class="name-field">Namn<input name="name" type="text" placeholder="Anna Andersson" autocomplete="name" required /></label>
        <label>E-post<input name="email" type="email" placeholder="ni@foretag.se" autocomplete="email" required /></label>
        <label>Lösenord<input name="password" type="password" placeholder="Minst 8 tecken" minlength="8" autocomplete="new-password" required /></label>
        <label class="confirm-field">Bekräfta lösenord<input name="confirmPassword" type="password" placeholder="Skriv lösenordet igen" minlength="8" autocomplete="new-password" required /></label>
        <a class="forgot-link" href="#">Glömt lösenord?</a>
        <p class="auth-error" aria-live="polite"></p>
        <button class="button button-primary button-full" type="submit" data-auth-submit>Skapa konto ${icon('arrow', 15)}</button>
      </form>
      <div class="auth-divider"><span>eller</span></div>
      <button type="button" class="button button-light button-full google-button">${icon('users', 16)} Fortsätt med Google</button>
      <p class="terms-copy">Genom att skapa ett konto godkänner du Flowlys villkor och integritetspolicy.</p>
    </div>
  </div>
`

const onboardingSteps = () => `<div class="product-stepper">${[['01', 'Konto'], ['02', 'Arbetsflöde'], ['03', 'Excel'], ['04', 'Konfigurera']].map(([number, label], index) => `<span class="${index + 1 <= productState.onboardingStep ? 'is-active' : ''}"><b>${number}</b>${label}</span>`).join('')}</div>`

const productSidebar = () => {
  const currentUser = currentUserProfile()
  const workspace = currentWorkspaceProfile()
  const initials = currentUser?.name?.split(' ')?.slice(0, 2).map((segment) => segment[0]?.toUpperCase() ?? '').join('') || 'FU'
  return `
    <aside class="product-sidebar">
      <a class="product-brand" href="#product-dashboard"><span class="brand-mark">f</span><strong>flowly</strong></a>
      <div class="workspace-switcher">${av(initials.slice(0, 2).toUpperCase() || 'FU', 'sand')}<span><small>Workspace</small>${escapeHtml(workspace?.name || 'Flowly workspace')}</span>${icon('arrow', 13)}</div>
      <nav class="product-nav"><p>Arbetsyta</p>${[['projects', 'workflow', 'Mina projekt'], ['dashboard', 'chart', 'Översikt'], ['workflows', 'workflow', 'Mina arbetsflöden'], ['approvals', 'check', 'Godkännanden'], ['team', 'users', 'Team']].map(([screen, ic, label]) => `<button type="button" data-product-screen="${screen}" class="${productState.screen === screen ? 'is-active' : ''}">${icon(ic as IconName, 16)}${label}${screen === 'approvals' && productState.reports.filter((report) => report.status === 'Väntar').length ? `<b>${productState.reports.filter((report) => report.status === 'Väntar').length}</b>` : ''}</button>`).join('')}<p class="nav-spacer">Workspace</p><button type="button" data-product-screen="settings" class="${productState.screen === 'settings' ? 'is-active' : ''}">${icon('settings', 16)}Inställningar</button></nav>
      <div class="sidebar-bottom"><span>${av(initials.slice(0, 2).toUpperCase() || 'FU', 'peach')}<span><strong>${escapeHtml(currentUser?.name || 'Flowly användare')}</strong><small>Admin</small></span></span><button type="button" data-product-action="logout" aria-label="Logga ut">${icon('arrow', 15)}</button></div>
    </aside>
  `
}

const productHeader = (title: string, description: string) => `<header class="product-header"><div><p class="product-kicker">Flowly workspace</p><h1>${title}</h1><p>${description}</p></div><div class="product-header-actions"><span class="workspace-status"><i></i> Lokalt workspace</span><button type="button" class="icon-button">${icon('bell', 16)}</button></div></header>`

const workflowFieldsFromAnalysis = (analysis: ExcelAnalysis): WorkflowField[] => analysis.columns.map((name) => ({
  name,
  type: matchesColumn(name, ['tim', 'antal', 'sum', 'kostnad']) ? 'Number' : matchesColumn(name, ['datum', 'date']) ? 'Date' : matchesColumn(name, ['godkänd', 'godkand', 'status']) ? 'Status' : 'Text',
  required: !matchesColumn(name, ['kommentar', 'comment']),
  value: '',
}))

const onboardingView = () => {
  if (productState.onboardingStep === 1) return `<div class="onboarding-panel"><div class="onboarding-copy"><p class="product-kicker">Steg 02 · Arbetsflöde</p><h1>Välkommen till Flowly</h1><p>Låt oss bygga ert första arbetsflöde. Vad vill ni göra enklare?</p></div><div class="topic-grid">${['Tidrapportering', 'Beställningar', 'Kvalitetskontroller', 'Avvikelsehantering', 'Projektuppföljning', 'Annat'].map((topic) => `<button type="button" class="topic-card ${productState.topic === topic ? 'is-selected' : ''}" data-topic="${topic}"><span>${icon(topic === 'Tidrapportering' ? 'clock' : topic === 'Beställningar' ? 'box' : topic === 'Projektuppföljning' ? 'chart' : 'clipboard', 18)}</span><strong>${topic}</strong><small>${topic === 'Annat' ? 'Beskriv själv' : 'Bygg från en befintlig process'}</small></button>`).join('')}</div>${productState.topic === 'Annat' ? '<textarea class="custom-topic" placeholder="Beskriv ert arbetsflöde…"></textarea>' : ''}<button type="button" class="button button-primary onboarding-next" ${productState.topic ? '' : 'disabled'}>Fortsätt till Excel ${icon('arrow', 15)}</button></div>`
  if (productState.onboardingStep === 2) return `<div class="onboarding-panel"><div class="onboarding-copy"><p class="product-kicker">Steg 03 · Excel</p><h1>Börja med er Excel-fil</h1><p>Ladda upp filen ni redan använder. Flowly använder den som utgångspunkt för att bygga ert arbetsflöde.</p></div><label class="product-upload-zone" for="product-file-upload"><input id="product-file-upload" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" /><span class="upload-symbol">${icon('upload', 25)}</span><strong>Släpp din Excel-fil här</strong><small>eller välj fil från datorn</small><em>.xlsx / .xls</em></label><div class="product-upload-result" aria-live="polite"></div><button type="button" class="text-link onboarding-back" data-product-action="back-onboarding">Tillbaka</button></div>`
  return `<div class="onboarding-panel onboarding-finished"><div class="onboarding-copy"><p class="product-kicker">Steg 04 · Konfigurera</p><h1>Analysen är klar.</h1><p>Flowly har skapat ett första utkast. Nu kan ni kontrollera fälten och göra arbetsflödet till ert.</p></div><div class="onboarding-summary"><span class="summary-icon">${icon('check', 22)}</span><div><strong>${escapeHtml(productState.analysis?.fileName || 'Excel-fil')}</strong><small>${productState.analysis?.columns.length || 0} kolumner · ${productState.analysis?.rowCount || 0} rader identifierade</small></div></div><button type="button" class="button button-primary onboarding-next">Öppna Workflow Builder ${icon('arrow', 15)}</button></div>`
}

const fieldPreviewValue = (field: WorkflowField, index: number) => {
  if (field.type === 'Number') return '8'
  if (field.type === 'Date') return '2026-09-09'
  if (field.type === 'Status') return 'Väntar'
  if (field.value) return field.value
  if (index === 0) return 'Anna Andersson'
  if (field.name === 'Projekt') return 'Projekt A'
  return `Fyll i ${field.name.toLocaleLowerCase('sv-SE')}`
}

const builderView = () => {
  if (productState.builderTab === 'workflow') return builderWorkflowView()
  if (productState.builderTab === 'approvals') return approvalsView()
  if (productState.builderTab === 'team') return teamView()
  const fields = productState.fields.length ? productState.fields : (productState.analysis ? workflowFieldsFromAnalysis(productState.analysis) : [])
  productState.fields = fields
  const selected = fields[productState.selectedField] || fields[0]
  const fieldRows = fields.map((field, index) => `<button type="button" class="field-row ${index === productState.selectedField ? 'is-selected' : ''}" data-field-index="${index}"><span><small>${escapeHtml(field.name)}</small><strong>${escapeHtml(fieldPreviewValue(field, index))}</strong></span><em>${field.required ? 'Obligatoriskt' : 'Valfritt'}</em></button>`).join('')
  const editor = selected ? `<label>Fältnamn<input data-editor="name" value="${escapeHtml(selected.name)}" /></label><label>Typ<select data-editor="type"><option ${selected.type === 'Text' ? 'selected' : ''}>Text</option><option ${selected.type === 'Number' ? 'selected' : ''}>Number</option><option ${selected.type === 'Date' ? 'selected' : ''}>Date</option><option ${selected.type === 'Status' ? 'selected' : ''}>Status</option></select></label><label class="toggle-label">Obligatoriskt <button type="button" class="toggle ${selected.required ? 'is-on' : ''}" data-toggle-required><i></i></button></label><button type="button" class="button button-dark button-full" data-product-action="save-field">Spara fält</button><button type="button" class="remove-field" data-product-action="remove-field">Ta bort fält</button>` : '<p>Välj ett fält i formuläret för att redigera det.</p>'
  return `<div class="product-layout"><div class="builder-sidebar"><p class="product-kicker">Workflow Builder</p><h2>${escapeHtml(productState.topic || 'Tidrapportering')}</h2><nav><button class="is-active" type="button">${icon('clipboard', 15)} Formulär</button><button type="button" data-builder-tab="workflow">${icon('workflow', 15)} Arbetsflöde</button><button type="button" data-builder-tab="approvals">${icon('check', 15)} Godkännanden</button><button type="button" data-builder-tab="team">${icon('users', 15)} Användare</button></nav><div class="builder-source">${icon('file', 15)}<span><small>Byggt från</small>${escapeHtml(productState.analysis?.fileName || 'Excel-fil')}</span></div></div><div class="builder-main">${productHeader('Formulär', 'Kontrollera fälten Flowly hittade i er Excel-fil.')}${productState.saved ? '<div class="save-toast">✓ Arbetsflödet sparades som utkast.</div>' : ''}<div class="builder-columns"><section class="builder-canvas"><div class="builder-canvas-head"><div><span class="status-pill draft">Utkast</span><h2>${escapeHtml(productState.topic || 'Tidrapportering')}</h2><p>Det här är formuläret som teamet kommer att använda.</p></div><div class="view-toggle"><button type="button" class="is-active">Redigera</button><button type="button" data-product-action="preview">Förhandsvisning</button></div></div><div class="form-preview-card">${fieldRows}<button type="button" class="button button-primary button-full submit-preview">Skicka rapport ${icon('arrow', 15)}</button></div></section><aside class="field-editor"><p class="product-kicker">Fältinställningar</p><h3>${escapeHtml(selected?.name || 'Välj ett fält')}</h3>${editor}</aside></div><div class="builder-footer"><button type="button" class="button button-light" data-product-action="save-workflow">Spara arbetsflöde</button><button type="button" class="button button-primary" data-product-action="publish-workflow">${productState.published ? 'Aktivt arbetsflöde' : 'Publicera arbetsflöde'} ${icon('arrow', 15)}</button></div></div></div>`
}

const builderWorkflowView = () => `<div class="product-layout"><div class="builder-sidebar"><p class="product-kicker">Workflow Builder</p><h2>${escapeHtml(productState.topic || 'Tidrapportering')}</h2><nav><button type="button" data-builder-tab="form">${icon('clipboard', 15)} Formulär</button><button class="is-active" type="button" data-builder-tab="workflow">${icon('workflow', 15)} Arbetsflöde</button><button type="button" data-builder-tab="approvals">${icon('check', 15)} Godkännanden</button><button type="button" data-builder-tab="team">${icon('users', 15)} Användare</button></nav></div><div class="builder-main">${productHeader('Arbetsflöde', 'Så här rör sig en rapport genom processen.') }<div class="workflow-builder-track">${['Skapa rapport', 'Skickas', 'Chef granskar', 'Godkänd / Avvisad', 'Klar'].map((step, index) => `<div class="workflow-builder-node"><span>${String(index + 1).padStart(2, '0')}</span><strong>${step}</strong><small>${index === 0 ? 'Teamet fyller i formuläret' : index === 2 ? `Godkänns av ${escapeHtml(productState.approver)}` : index === 4 ? productState.afterApproval : 'Nästa steg i flödet'}</small></div>${index < 4 ? '<i>↓</i>' : ''}`).join('')}</div><div class="builder-footer"><button type="button" class="button button-light" data-builder-tab="form">Tillbaka till formulär</button><button type="button" class="button button-primary" data-product-action="save-workflow">Spara arbetsflöde</button></div></div></div>`

const workflowCard = () => `<article class="workflow-product-card"><div class="workflow-card-top"><span class="card-icon">${icon('clock', 16)}</span><span class="status-pill ${productState.published ? 'active' : 'draft'}">${productState.published ? 'Aktiv' : 'Utkast'}</span></div><h3>${escapeHtml(productState.topic || 'Tidrapportering')}</h3><p>${productState.published ? productState.reports.length + ' rapporter' : 'Bygg vidare från er Excel-fil'}</p><small>Senast uppdaterad idag</small><div class="workflow-card-actions"><button type="button" class="button button-dark button-small" data-product-action="use-workflow">Använd</button><button type="button" class="text-link" data-product-action="edit-workflow">Redigera ${icon('arrow', 14)}</button></div></article>`

const appCards = () => {
  const apps = getCurrentWorkspaceApps()
  if (!apps.length) {
    return `<div class="empty-product-state"><span class="empty-state-icon">${icon('upload', 22)}</span><h3>Välkommen till Flowly</h3><p>Skapa din första app från en Excel-fil.</p><button type="button" class="button button-primary" data-product-action="new-workflow">Ladda upp Excel ${icon('arrow', 15)}</button></div>`
  }

  return apps.map((app) => `
    <article class="workflow-product-card">
      <div class="workflow-card-top"><span class="card-icon">${icon('clock', 16)}</span><span class="status-pill ${app.status === 'active' ? 'active' : 'draft'}">${app.status === 'active' ? 'Aktiv' : 'Utkast'}</span></div>
      <h3>${escapeHtml(app.name)}</h3>
      <p>${escapeHtml(app.description || 'Byggt från Excel')}</p>
      <small>Senast uppdaterad ${new Date(app.updatedAt).toLocaleDateString('sv-SE')}</small>
      <div class="workflow-card-actions">
        <button type="button" class="button button-dark button-small" data-product-action="open-app" data-app-id="${app.id}">Öppna</button>
        <button type="button" class="text-link" data-product-action="delete-app" data-app-id="${app.id}">Ta bort ${icon('arrow', 14)}</button>
      </div>
    </article>
  `).join('')
}

const projectsView = () => {
  const apps = getCurrentWorkspaceApps()
  const user = currentUserProfile()
  return `<div class="product-page"><header class="product-header"><div><p class="product-kicker">Flowly workspace</p><h1>${user?.name ? `Hej ${escapeHtml(user.name.split(' ')[0])}` : 'Mina projekt'}</h1><p>Välj ett projekt eller skapa ett nytt.</p></div><div class="product-header-actions"><button type="button" class="button button-primary button-small" data-product-action="new-workflow">${icon('plus', 14)} Skapa nytt projekt</button></div></header><div class="product-section-heading"><div><p class="product-kicker">Projekt</p><h2>Mina projekt</h2></div></div>${apps.length ? `<div class="workflow-product-grid">${appCards()}</div>` : `<div class="empty-product-state"><span class="empty-state-icon">${icon('upload', 22)}</span><h3>Välkommen till Flowly</h3><p>Du har inga projekt ännu. Skapa din första app från en Excel-fil.</p><button type="button" class="button button-primary" data-product-action="new-workflow">Skapa projekt ${icon('arrow', 15)}</button></div>`}</div>`
}

const dashboardView = () => `<div class="product-page">${productHeader('Översikt', 'En lugn plats för era arbetsflöden och nästa steg.')}<div class="metric-grid"><div><span class="metric-icon">${icon('workflow', 16)}</span><strong>${getCurrentWorkspaceApps().filter((app) => app.status === 'active').length}</strong><small>Aktiva arbetsflöden</small></div><div><span class="metric-icon amber">${icon('clock', 16)}</span><strong>${productState.reports.filter((report) => report.status === 'Väntar').length}</strong><small>Väntar på godkännande</small></div><div><span class="metric-icon blue">${icon('chart', 16)}</span><strong>${productState.reports.length}</strong><small>Rapporter denna vecka</small></div><div><span class="metric-icon sage">${productState.reports.length ? '92%' : '—'}</span><strong>${productState.reports.length ? '92%' : '—'}</strong><small>Godkända i tid</small></div></div><div class="product-section-heading"><div><p class="product-kicker">Arbetsflöden</p><h2>Det ni arbetar med</h2></div><button type="button" class="button button-primary button-small" data-product-action="new-workflow">${icon('plus', 14)} Skapa arbetsflöde</button></div><div class="workflow-product-grid">${appCards()}</div><div class="product-section-heading"><div><p class="product-kicker">Senaste aktivitet</p><h2>Rapporter</h2></div><button type="button" class="text-link" data-product-screen="approvals">Visa alla ${icon('arrow', 14)}</button></div>${reportsTable()}</div>`

const reportsTable = () => productState.reports.length ? `<div class="reports-table"><div class="reports-table-head"><span>Rapport</span><span>Status</span><span>Åtgärd</span></div>${productState.reports.map((report) => `<div class="reports-table-row"><div><strong>${escapeHtml(report.values.Namn || report.values.Name || 'Rapport')}</strong><small>${escapeHtml(productState.topic || 'Arbetsflöde')} · ${escapeHtml(report.values.Datum || 'Idag')}</small></div><span class="status-pill ${report.status === 'Godkänd' ? 'active' : report.status === 'Avvisad' ? 'rejected' : 'waiting'}">${report.status}</span><button type="button" class="text-link" data-product-screen="approvals">Öppna ${icon('arrow', 13)}</button></div>`).join('')}</div>` : '<div class="quiet-empty">Inga inskickade rapporter ännu.</div>'

const workflowsView = () => `<div class="product-page">${productHeader('Mina arbetsflöden', 'Bygg, publicera och använd era processer på ett ställe.')}<div class="workflow-product-grid">${appCards()}</div></div>`

const useWorkflowView = () => {
  const fields = productState.fields.filter((field) => field.type !== 'Status')
  return `<div class="product-page use-page">${productHeader(productState.topic || 'Tidrapportering', 'Fyll i rapporten och skicka den till nästa steg i processen.')}<div class="use-layout"><section class="use-form-card"><div class="use-form-heading"><span class="status-pill active">Aktivt arbetsflöde</span><h2>${escapeHtml(productState.topic || 'Veckans tidrapport')}</h2><p>Alla obligatoriska fält behöver fyllas i.</p></div><form class="workflow-use-form">${fields.map((field, index) => `<label>${escapeHtml(field.name)}${field.type === 'Date' ? `<input name="${escapeHtml(field.name)}" type="date" value="2026-09-09" ${field.required ? 'required' : ''} />` : field.type === 'Number' ? `<input name="${escapeHtml(field.name)}" type="number" placeholder="8" ${field.required ? 'required' : ''} />` : field.name.toLocaleLowerCase('sv-SE').includes('projekt') ? `<select name="${escapeHtml(field.name)}" ${field.required ? 'required' : ''}><option value="">Välj projekt</option><option>Projekt A</option><option>Projekt B</option></select>` : `<input name="${escapeHtml(field.name)}" type="text" placeholder="${index === 0 ? 'Anna Andersson' : 'Fyll i ' + field.name.toLocaleLowerCase('sv-SE')}" ${field.required ? 'required' : ''} />`}</label>`).join('')}<p class="form-error" aria-live="polite"></p><button type="submit" class="button button-primary">Skicka rapport ${icon('arrow', 15)}</button></form></section><aside class="process-rail"><p class="product-kicker">Arbetsflöde</p><h3>Vad händer sedan?</h3>${['Skapa rapport', 'Skickas', 'Chef granskar', 'Godkänd / Avvisad', 'Klar'].map((step, index) => `<div class="process-step ${index === 0 ? 'is-current' : ''}"><b>${String(index + 1).padStart(2, '0')}</b><span>${step}</span></div>`).join('')}</aside></div></div>`
}

const approvalRows = () => productState.reports.map((report) => {
  const actions = report.status === 'Väntar'
    ? `<button type="button" class="approve-row" data-report-action="approve" data-report-id="${report.id}">Godkänn</button><button type="button" class="reject-row" data-report-action="reject" data-report-id="${report.id}">Avvisa</button>`
    : '<small>Inga åtgärder</small>'
  const statusClass = report.status === 'Godkänd' ? 'active' : report.status === 'Avvisad' ? 'rejected' : 'waiting'
  return `<article class="approval-product-card"><div class="approval-person"><span class="preview-avatar">${escapeHtml((report.values.Namn || 'AA').slice(0, 2).toUpperCase())}</span><div><strong>${escapeHtml(report.values.Namn || 'Rapport')}</strong><small>${escapeHtml(productState.topic || 'Tidrapport')} · ${escapeHtml(report.values.Projekt || 'Projekt A')}</small></div></div><span class="status-pill ${statusClass}">${report.status}</span><div class="approval-actions-product">${actions}</div></article>`
}).join('')

const approvalsView = () => {
  const approverOptions = ['Chef', 'Anna Andersson', 'Erik Johansson', 'Team Lead'].map((name) => `<option ${productState.approver === name ? 'selected' : ''}>${name}</option>`).join('')
  const empty = '<div class="empty-product-state"><span class="empty-state-icon">✓</span><h3>Inget väntar just nu</h3><p>När teamet skickar in rapporter visas de här.</p></div>'
  return `<div class="product-page">${productHeader('Godkännanden', 'Granska rapporter som väntar på nästa steg.')}<div class="approval-config"><div><p class="product-kicker">Godkännande</p><h2>Vem godkänner?</h2><select data-approval="approver">${approverOptions}</select></div><div><p class="product-kicker">Efter godkännande</p><h2>Vad händer sedan?</h2><label><input type="radio" name="after-approval" value="Markera som klar" ${productState.afterApproval === 'Markera som klar' ? 'checked' : ''} /> Markera som klar</label><label><input type="radio" name="after-approval" value="Exportera" ${productState.afterApproval === 'Exportera' ? 'checked' : ''} /> Exportera</label><label><input type="radio" name="after-approval" value="Skicka vidare" ${productState.afterApproval === 'Skicka vidare' ? 'checked' : ''} /> Skicka vidare</label></div></div><div class="product-section-heading"><div><p class="product-kicker">Inkorg</p><h2>Rapporter att granska</h2></div><button type="button" class="button button-light button-small" data-product-action="export">Exportera till Excel</button></div><div class="approval-list">${productState.reports.length ? approvalRows() : empty}</div></div>`
}

const teamView = () => `<div class="product-page">${productHeader('Team', 'Bestäm vilka som ska kunna använda arbetsflödet.')}<div class="product-section-heading"><div><p class="product-kicker">3 medlemmar</p><h2>Ert team</h2></div><button type="button" class="button button-primary button-small" data-product-action="invite">${icon('plus', 14)} Bjud in medlem</button></div><div class="team-list">${[['Anna Andersson', 'Admin', 'peach'], ['Erik Johansson', 'Manager', 'blue'], ['Sara Nilsson', 'Member', 'sage']].map(([name, role, tone]) => `<div><span>${av(name.split(' ').map((part) => part[0]).join(''), tone)}</span><strong>${name}<small>${role}</small></strong><span class="team-access">Aktiv</span></div>`).join('')}</div></div>`

const settingsView = () => `<div class="product-page">${productHeader('Inställningar', 'Grundläggande inställningar för ert workspace.')}<section class="settings-card"><p class="product-kicker">Workspace</p><h2>Nordmark AB</h2><label>Workspace-namn<input value="Nordmark AB" /></label><label>Standardgodkännare<select><option>Chef</option><option>Team Lead</option></select></label><button type="button" class="button button-dark">Spara inställningar</button></section></div>`

const productContent = () => {
  if (productState.screen === 'projects') return projectsView()
  if (productState.screen === 'builder') return builderView()
  if (productState.screen === 'use') return useWorkflowView()
  if (productState.screen === 'approvals') return approvalsView()
  if (productState.screen === 'workflows') return workflowsView()
  if (productState.screen === 'team') return teamView()
  if (productState.screen === 'settings') return settingsView()
  return dashboardView()
}

const productShell = () => productState.screen === 'onboarding' ? `<div class="onboarding-shell"><div class="onboarding-top"><a class="brand" href="#top"><span class="brand-mark">f</span>flowly</a><button type="button" class="text-link" data-product-action="logout">Logga ut</button></div>${onboardingSteps()}${onboardingView()}</div>` : `<div class="product-shell">${productSidebar()}<main class="product-main">${productContent()}</main></div>`

const steps = () => `
  <section class="story-section steps-section" id="upload">
    <div class="section-intro split reveal">
      <div>
        <p class="eyebrow">Så fungerar det</p>
        <h2>Från fil till <em>färdigt flöde.</em></h2>
      </div>
      <p>Tre steg. Ett arbetsflöde som teamet faktiskt vill använda.</p>
    </div>
    <div class="steps-grid">
      <article class="step-card reveal">
        <span class="step-num">01</span>
        <h3>Ladda upp</h3>
        <p>Ladda upp Excel-filen ni redan använder.</p>
        <label class="upload-zone" for="file-upload">
          <input id="file-upload" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
          <span class="upload-symbol">${icon('upload', 22)}</span>
          <strong class="upload-label">Släpp din Excel-fil här</strong>
          <small>eller välj fil från datorn</small>
        </label>
        <small class="upload-note">.xlsx eller .xls · Börja med arbetsflödet ni redan använder.</small>
      </article>
      <article class="step-card reveal">
        <span class="step-num">02</span>
        <h3>Beskriv processen</h3>
        <p>Berätta vad filen används till och vilka som ska använda den.</p>
        <div class="chat-card">
          ${av('DU', 'peach')}
          <p>Våra anställda fyller i timmar varje vecka. Chefen godkänner och ekonomi exporterar underlaget.</p>
        </div>
        <div class="typing">${icon('spark', 13)} Flowly läser in processen</div>
      </article>
      <article class="step-card reveal">
        <span class="step-num">03</span>
        <h3>Börja arbeta</h3>
        <p>Flowly skapar ett strukturerat arbetsflöde som hela teamet kan använda.</p>
        <div class="born-app">
          <div class="born-top"><span class="mini-brand"><span class="brand-mark sm">f</span> Flowly</span><span class="badge badge-ok">Live</span></div>
          <small>Veckans översikt</small>
          <strong>23 av 25 rapporter klara</strong>
          <div class="bar"><i></i></div>
        </div>
      </article>
    </div>
    ${uploadResult()}
  </section>
`

const dashboard = () => `
  <section class="story-section product-section">
    <div class="section-intro centered reveal">
      <p class="eyebrow">04</p>
      <h2>Nu arbetar teamet i <em>en riktig app.</em></h2>
      <p>Från Excel-rader till ett arbetsflöde hela teamet kan använda. Statusen är synlig för alla — inte gömd i en mejltråd.</p>
    </div>
    <div class="product-frame reveal" id="product-demo">
      <div class="frame-bar">
        <span class="frame-url">app.flowly.se / nordmark / godkännanden</span>
        <span class="frame-meta">${icon('search', 13)} ${icon('bell', 13)}</span>
      </div>
      <div class="dashboard-shell">
        <aside class="dashboard-sidebar">
          <div class="dash-brand"><span class="brand-mark">f</span> flowly</div>
          <div class="dash-workspace">${av('N', 'sand')}<span>Nordmark AB</span></div>
          <nav>
            <a href="#product-demo">${icon('chart', 15)} Översikt</a>
            <a href="#product-demo">${icon('clipboard', 15)} Mina uppgifter</a>
            <a href="#product-demo">${icon('workflow', 15)} Arbetsflöden</a>
            <a class="selected" href="#product-demo">${icon('check', 15)} Godkännanden <b data-pending-count>3</b></a>
            <a href="#product-demo">${icon('layers', 15)} Rapporter</a>
            <a href="#product-demo">${icon('users', 15)} Team</a>
            <a href="#product-demo">${icon('settings', 15)} Inställningar</a>
          </nav>
        </aside>
        <div class="dashboard-content">
          <div class="dash-mobile-top"><span class="mini-brand"><span class="brand-mark sm">f</span> Flowly</span>${av('AA', 'peach')}</div>
          <div class="dash-header">
            <div>
              <p class="crumb">Arbetsyta / Godkännanden</p>
              <h3>Godkännanden</h3>
              <p class="dash-sub"><span data-waiting-copy>3</span> väntar på dig</p>
            </div>
            <div class="dash-tools">
              <label class="search-field">${icon('search', 14)}<input type="search" placeholder="Sök namn eller projekt" readonly /></label>
              <button type="button" class="button button-dark button-small">Exportera underlag</button>
            </div>
          </div>
          <div class="progress-card">
            <div>
              <small>Den här veckan</small>
              <strong><span data-done-count>23</span> <em>/ 25</em></strong>
              <p>rapporter klara</p>
            </div>
            <div class="bar lg"><i style="width:92%"></i></div>
          </div>
          <div class="approval-board">
            <article class="approval-card" data-row="anna">
              ${av('AA', 'peach')}
              <div class="approval-info">
                <strong>Anna Andersson</strong>
                <small>Tidrapport — vecka 36 · Atlas</small>
                <span class="meta">38 timmar · Skickad idag, 09:14</span>
              </div>
              <div class="approval-actions">
                <button type="button" class="approve-row">Godkänn</button>
                <button type="button" class="reject-row">Avvisa</button>
              </div>
            </article>
            <article class="approval-card" data-row="erik">
              ${av('EJ', 'blue')}
              <div class="approval-info">
                <strong>Erik Johansson</strong>
                <small>Tidrapport — vecka 36 · Nova</small>
                <span class="meta">40 timmar · Skickad idag, 10:02</span>
              </div>
              <div class="approval-actions">
                <button type="button" class="approve-row">Godkänn</button>
                <button type="button" class="reject-row">Avvisa</button>
              </div>
            </article>
            <article class="approval-card" data-row="johan">
              ${av('JL', 'sage')}
              <div class="approval-info">
                <strong>Johan Lind</strong>
                <small>Tidrapport — vecka 36 · Nova</small>
                <span class="meta">32 timmar · Skickad igår, 17:41</span>
              </div>
              <div class="approval-actions">
                <button type="button" class="approve-row">Godkänn</button>
                <button type="button" class="reject-row">Avvisa</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
`

const useCases = () => {
  const items = [
    ['clock', 'Tidrapportering', 'Få in timmarna direkt från teamet och låt rätt person godkänna.', 'timesheet'],
    ['shield', 'Kvalitetskontroller', 'Gör checklistor, avvikelser och uppföljning till en tydlig rutin.', 'quality'],
    ['layers', 'Avvikelsehantering', 'Samla rapporter, bilder, ansvariga och status på ett ställe.', 'deviation'],
    ['box', 'Beställningar', 'Fånga behov, godkänn inköp och följ leveransen utan mejltrådar.', 'orders'],
    ['chart', 'Projektuppföljning', 'Se läget i projekten medan det fortfarande går att påverka.', 'project'],
    ['clipboard', 'Interna checklistor', 'Gör återkommande arbete enklare att utföra och följa upp.', 'checks'],
  ] as const

  const previews: Record<string, string> = {
    timesheet: `<div class="pv-table"><div>${av('AA', 'peach')} Anna <b>38 h</b></div><div>${av('EJ', 'blue')} Erik <b>40 h</b></div><div>${av('SN', 'sand')} Sara <b>36 h</b></div></div>`,
    quality: `<div class="pv-checks"><label class="done">✓ Skyddskläder kontrollerade</label><label class="done">✓ Maskin 4 signerad</label><label>○ Avvikelse att följa upp</label></div>`,
    deviation: `<div class="pv-form"><span>Beskrivning</span><i>Läckage vid linje 2</i><span>Ansvarig</span><i>Maria Berg</i></div>`,
    orders: `<div class="pv-table compact"><div>Filter 440 <span class="badge badge-wait">Väntar</span></div><div>Handskar XL <span class="badge badge-ok">Godkänd</span></div><div>Olja 20L <span class="badge badge-ok">Levererad</span></div></div>`,
    project: `<div class="pv-bars"><div><span>Atlas</span><div class="bar"><i style="width:82%"></i></div></div><div><span>Nova</span><div class="bar"><i style="width:54%"></i></div></div></div>`,
    checks: `<div class="pv-checks tight"><label class="done">✓ Öppning</label><label class="done">✓ Kylkedja</label><label>○ Stängning</label></div>`,
  }

  return `
    <section class="story-section usecase-section">
      <div class="section-intro split reveal">
        <div>
          <p class="eyebrow">05</p>
          <h2>Alla kan använda den.<br /><em>Samma process, rätt vy.</em></h2>
        </div>
        <p>Det som idag kräver påminnelser och kopiering kan bli ett arbetsflöde med roller, behörigheter och tydliga nästa steg.</p>
      </div>
      <div class="usecase-grid">
        ${items.map(([ic, title, body, key]) => `
          <article class="usecase-card reveal">
            <div class="usecase-preview">${previews[key]}</div>
            <div class="usecase-copy">
              <span class="card-icon">${icon(ic, 16)}</span>
              <h3>${title}</h3>
              <p>${body}</p>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `
}

const integration = () => `
  <section class="story-section difference-section">
    <div class="difference-copy reveal">
      <p class="eyebrow">06</p>
      <h2>Ni behöver inte byta <em>era system.</em></h2>
      <p><strong>Nej. Flowly är inte ett nytt ERP-system.</strong> Vi strukturerar processerna som idag hamnar mellan Excel, mejl, Teams och era befintliga system.</p>
      <ul>
        <li><span>${icon('check', 14)}</span>Börja med Excel-filen ni redan har</li>
        <li><span>${icon('check', 14)}</span>Rätt person ser rätt saker</li>
        <li><span>${icon('check', 14)}</span>Behåll exporten till Excel</li>
      </ul>
    </div>
    <div class="export-frame reveal">
      <div class="export-window">
        <div class="export-head">
          <strong>Exportera vecka 36</strong>
          <small>23 godkända rapporter</small>
        </div>
        <label class="export-option is-on">${icon('file', 16)} Excel (.xlsx)<small>Tillbaka till filen ni redan har</small></label>
        <label class="export-option">${icon('mail', 16)} Skicka till ekonomi<small>Underlag till nästa steg i kedjan</small></label>
        <button type="button" class="button button-primary button-full">Exportera underlag</button>
      </div>
    </div>
  </section>
`

const pricing = () => `
  <section class="story-section pricing-section" id="priser">
    <div class="section-intro centered reveal">
      <p class="eyebrow">Priser</p>
      <h2>Växla upp när <em>ni är redo.</em></h2>
      <p>Börja litet. Bygg vidare när processen växer.</p>
    </div>
    <div class="pricing-grid">
      <article class="price-card reveal">
        <span class="price-tag">Starter</span>
        <h3>För små team</h3>
        <div class="price">499 <small>kr/mån</small></div>
        <p>Ett arbetsflöde och team som vill komma igång.</p>
        <a class="price-link" href="#cta">Testa gratis ${icon('arrow', 14)}</a>
      </article>
      <article class="price-card featured reveal">
        <span class="popular-tag">Rekommenderas</span>
        <span class="price-tag">Team</span>
        <h3>För flera arbetsflöden</h3>
        <div class="price">1 499 <small>kr/mån</small></div>
        <p>För företag som vill samla fler processer på ett ställe.</p>
        <a class="button button-primary button-full" href="#cta">Testa Team gratis ${icon('arrow', 14)}</a>
      </article>
      <article class="price-card reveal">
        <span class="price-tag">Enterprise</span>
        <h3>För hela verksamheten</h3>
        <div class="price contact-price">Kontakta oss</div>
        <p>Anpassningar, fler team och stöd hela vägen.</p>
        <a class="price-link" href="#cta">Prata med oss ${icon('arrow', 14)}</a>
      </article>
    </div>
    <div class="pricing-next-step reveal">
      <div><strong>Börja med ett arbetsflöde.</strong><span>Testa Flowly och se om det passar processen ni redan har.</span></div>
      <a class="button button-primary" href="#upload">Testa Flowly gratis ${icon('arrow', 16)}</a>
    </div>
  </section>
`

const roles = () => `
  <section class="story-section roles-section">
    <div class="role-banner reveal">
      <div>
        <p class="eyebrow">Byggt för team som gör jobbet</p>
        <h2>Samma produkt.<br /><em>Olika ansvar.</em></h2>
      </div>
      <p>Ekonomi, operations, projektledning, HR, produktion och administration. Mindre att jaga. Mer att få gjort.</p>
    </div>
    <div class="role-list">
      ${['Ekonomi', 'Operations', 'Projektledning', 'HR', 'Produktion', 'Administration'].map((role) => `<span>${role}</span>`).join('')}
    </div>
  </section>
`

const faq = () => `
  <section class="story-section faq-section" id="faq">
    <div class="section-intro centered reveal">
      <p class="eyebrow">Frågor</p>
      <h2>Det ni undrar <em>innan ni börjar.</em></h2>
    </div>
    <div class="faq-list reveal">
      ${[
        ['Måste vi sluta använda Excel?', 'Nej. Flowly kan börja med de Excel-filer ni redan använder.'],
        ['Behöver vi kunna programmera?', 'Nej. Ni beskriver processen på vanlig svenska, sedan hjälper Flowly er vidare.'],
        ['Hur lång tid tar det att komma igång?', 'Det beror på arbetsflödet. Börja med en fil och beskriv hur ni använder den, så ser ni snabbt vad som behöver struktureras.'],
        ['Måste vi byta vårt ERP-system?', 'Nej. Flowly är inte ett nytt ERP-system utan ett enklare lager för manuella processer mellan era befintliga system.'],
        ['Kan vi exportera data till Excel?', 'Ja. Era data är era och kan exporteras tillbaka till Excel när ni behöver.'],
        ['Kan flera personer använda samma arbetsflöde?', 'Ja, med olika roller och behörigheter för varje steg i processen.'],
        ['Vad händer om Flowly inte passar vårt arbetsflöde?', 'Då har ni fått en tydligare bild av processen utan att behöva byta ut era befintliga system.'],
      ].map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join('')}
    </div>
  </section>
`

const cta = () => `
  <section class="final-cta" id="cta">
    <div class="cta-inner reveal">
      <p class="eyebrow">07</p>
      <h2>Har ni en Excel-fil som borde vara en app?</h2>
      <p>Börja med filen ni redan använder. Se hur mycket enklare arbetsflödet kan bli.</p>
      <div class="hero-actions">
        <a class="button button-light" href="#upload">Testa Flowly gratis ${icon('arrow', 16)}</a>
        <a class="text-link light-link" href="#produkt">Se exempel <span>${icon('arrow', 16)}</span></a>
      </div>
      <small class="cta-note">Ingen kod. Ingen lång implementation.</small>
    </div>
  </section>
`

const footer = () => `
  <footer class="site-footer">
    <div class="footer-top">
      <a class="brand" href="#top"><span class="brand-mark">f</span>flowly</a>
      <p>Ni har redan processen.<br /><strong>Slipp bara Excel-kaoset.</strong></p>
      <div class="footer-links">
        <div><small>Utforska</small><a href="#produkt">Produkt</a><a href="#process">Så fungerar det</a><a href="#exempel">Exempel</a></div>
        <div><small>Företag</small><a href="#priser">Priser</a><a href="#faq">Kontakt</a><a href="#faq">Integritet</a></div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Flowly</span>
      <span>Gjord för bättre arbetsdagar i Sverige</span>
      <span>Villkor</span>
    </div>
  </footer>
`

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `${header()}<main>${hero()}${chaos()}${transform()}${steps()}${dashboard()}${useCases()}${integration()}${pricing()}${roles()}${faq()}${cta()}</main>${footer()}`
app.insertAdjacentHTML('beforeend', authModal())

const authOverlay = () => document.querySelector<HTMLElement>('#auth-overlay')
const renderProduct = () => {
  const currentUser = currentUserProfile()
  if (!currentUser) {
    document.body.classList.remove('is-product-mode')
    app.innerHTML = `${header()}<main>${hero()}${chaos()}${transform()}${steps()}${dashboard()}${useCases()}${integration()}${pricing()}${roles()}${faq()}${cta()}</main>${footer()}`
    app.insertAdjacentHTML('beforeend', authModal())
    return
  }

  const workspace = currentWorkspaceProfile() || ensureCurrentWorkspace(currentUser)
  productState.userName = currentUser.name
  productState.workspaceName = workspace.name
  if (productState.currentAppId) {
    const activeApp = getCurrentWorkspaceApps().find((app) => app.id === productState.currentAppId)
    if (activeApp) loadAppIntoState(activeApp)
  } else if (productState.screen === 'builder' || productState.screen === 'use' || productState.screen === 'approvals' || productState.screen === 'workflows' || productState.screen === 'team' || productState.screen === 'settings' || productState.screen === 'dashboard') {
    productState.screen = 'projects'
  }
  if (productState.screen === 'onboarding') {
    productState.screen = 'onboarding'
  }
  document.body.classList.add('is-product-mode')
  app.innerHTML = productShell()
}

const openAuth = (mode: 'signup' | 'login' = 'signup') => {
  const overlay = authOverlay()
  if (!overlay) return
  overlay.hidden = false
  overlay.dataset.mode = mode
  overlay.querySelectorAll<HTMLButtonElement>('[data-auth-mode]').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authMode === mode))
  const title = overlay.querySelector('#auth-title')
  const description = overlay.querySelector('.auth-description')
  const nameField = overlay.querySelector<HTMLElement>('.name-field')
  const submit = overlay.querySelector<HTMLButtonElement>('[data-auth-submit]')
  const forgot = overlay.querySelector<HTMLElement>('.forgot-link')
  if (title) title.textContent = mode === 'signup' ? 'Skapa ditt Flowly-konto' : 'Logga in i Flowly'
  if (description) description.textContent = mode === 'signup' ? 'Skapa ett gratis konto och bygg ert första arbetsflöde.' : 'Fortsätt där ni slutade och öppna ert workspace.'
  if (nameField) nameField.hidden = mode === 'login'
  if (submit) submit.innerHTML = `${mode === 'signup' ? 'Skapa konto' : 'Logga in'} ${icon('arrow', 15)}`
  if (forgot) forgot.hidden = mode === 'signup'
}

const closeAuth = () => { const overlay = authOverlay(); if (overlay) overlay.hidden = true }

const openUserApp = (appId: string) => {
  const app = readFlowlyStore().apps.find((entry) => entry.id === appId)
  if (!app) return
  loadAppIntoState(app)
  productState.screen = 'builder'
  persistProductState()
  renderProduct()
}

const deleteUserApp = (appId: string) => {
  const store = readFlowlyStore()
  const app = store.apps.find((entry) => entry.id === appId)
  if (!app) return
  if (!window.confirm(`Är du säker på att du vill ta bort ${app.name}?\n\nDetta går inte att ångra.`)) return
  store.apps = store.apps.filter((entry) => entry.id !== appId)
  writeFlowlyStore(store)
  if (productState.currentAppId === appId) {
    productState.currentAppId = null
  }
  persistProductState()
  renderProduct()
}

const beginOnboarding = () => {
  productState.screen = 'onboarding'
  productState.onboardingStep = 1
  productState.topic = ''
  productState.analysis = undefined
  productState.fields = []
  productState.saved = false
  productState.published = false
  productState.currentAppId = null
  persistProductState()
  closeAuth()
  renderProduct()
}

const handleProductFile = async (file: File | undefined) => {
  const result = document.querySelector<HTMLElement>('.product-upload-result')
  if (!file || !result) return
  const extension = file.name.toLocaleLowerCase('sv-SE').split('.').pop()
  if (extension !== 'xlsx' && extension !== 'xls') {
    result.innerHTML = renderAnalysisError('Den filtypen stöds inte', 'Ladda upp en .xlsx- eller .xls-fil.')
    return
  }
  result.innerHTML = renderAnalysisLoading(file.name)
  try {
    const [analysis] = await Promise.all([analyzeExcelFile(file), new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : 850))])
    productState.analysis = analysis
    productState.fields = workflowFieldsFromAnalysis(analysis)
    productState.onboardingStep = 4
    persistProductState()
    renderProduct()
  } catch (error) {
    const emptyFile = error instanceof Error && error.message === 'EMPTY_WORKBOOK'
    result.innerHTML = renderAnalysisError(emptyFile ? 'Vi hittade inga data att analysera.' : 'Vi kunde inte läsa filen', emptyFile ? 'Ladda upp en Excel-fil som innehåller ett arbetsflöde eller en tabell.' : 'Kontrollera att filen är en giltig Excel-fil och försök igen.')
  }
}

const exportReports = () => {
  const rows = productState.reports.map((report) => ({ ...report.values, Status: report.status }))
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Status: 'Inga rapporter ännu' }])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, productState.topic || 'Flowly')
  XLSX.writeFile(book, `${(productState.topic || 'flowly-workflow').toLocaleLowerCase('sv-SE').replace(/\s+/g, '-')}.xlsx`)
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const cta = target.closest<HTMLAnchorElement>('a[href="#cta"], a[href="#faq"]')
  if (cta) {
    event.preventDefault()
    openAuth(cta.getAttribute('href') === '#faq' ? 'login' : 'signup')
  }
  if (target.closest('.auth-close')) closeAuth()
  const authTab = target.closest<HTMLButtonElement>('[data-auth-mode]')
  if (authTab) openAuth((authTab.dataset.authMode as 'signup' | 'login') || 'signup')
})

document.querySelector<HTMLFormElement>('[data-auth-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget as HTMLFormElement
  const overlay = authOverlay()
  const data = new FormData(form)
  const mode = overlay?.dataset.mode || 'signup'
  const name = String(data.get('name') || '').trim()
  const email = String(data.get('email') || '').trim().toLowerCase()
  const password = String(data.get('password') || '')
  const confirmPassword = String(data.get('confirmPassword') || '')
  const error = overlay?.querySelector<HTMLElement>('.auth-error')

  if (mode === 'signup') {
    if (!name) { if (error) error.textContent = 'Fyll i ert namn för att fortsätta.'; return }
    if (!emailRegex.test(email)) { if (error) error.textContent = 'Ange en giltig e-postadress.'; return }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      if (error) error.textContent = 'Lösenordet måste vara minst 8 tecken och innehålla minst en stor bokstav och en siffra.'
      return
    }
    if (password !== confirmPassword) { if (error) error.textContent = 'Lösenorden matchar inte.'; return }

    const store = readFlowlyStore()
    if (store.users.some((user) => user.email.toLowerCase() === email)) {
      if (error) error.textContent = 'Det finns redan ett konto med den e-postadressen.'
      return
    }

    const passwordHash = await hashPassword(password)
    const user: FlowlyUser = {
      id: makeId(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    store.users.push(user)
    const workspace = ensureCurrentWorkspace(user)
    store.session.userId = user.id
    writeFlowlyStore(store)
    productState.userName = user.name
    productState.workspaceName = workspace.name
    productState.currentAppId = null
    productState.screen = 'projects'
    persistProductState()
    closeAuth()
    renderProduct()
    return
  }

  if (!emailRegex.test(email)) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  const store = readFlowlyStore()
  const user = store.users.find((entry) => entry.email.toLowerCase() === email)
  if (!user) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  const passwordHash = await hashPassword(password)
  if (user.passwordHash !== passwordHash) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  store.session.userId = user.id
  writeFlowlyStore(store)
  const workspace = ensureCurrentWorkspace(user)
  productState.userName = user.name
  productState.workspaceName = workspace.name
  productState.currentAppId = null
  productState.screen = 'projects'
  persistProductState()
  closeAuth()
  renderProduct()
})

app.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  if (target.id === 'product-file-upload' && target instanceof HTMLInputElement) void handleProductFile(target.files?.[0])
  if (target.matches('[data-approval="approver"]')) { productState.approver = target.value; persistProductState() }
  if (target.matches('input[name="after-approval"]')) { productState.afterApproval = target.value; persistProductState() }
})

app.addEventListener('dragover', (event) => {
  const zone = (event.target as HTMLElement).closest('.product-upload-zone')
  if (zone) { event.preventDefault(); zone.classList.add('is-dragging') }
})
app.addEventListener('dragleave', (event) => (event.target as HTMLElement).closest('.product-upload-zone')?.classList.remove('is-dragging'))
app.addEventListener('drop', (event) => {
  const zone = (event.target as HTMLElement).closest('.product-upload-zone')
  if (!zone) return
  event.preventDefault()
  zone.classList.remove('is-dragging')
  void handleProductFile((event as DragEvent).dataTransfer?.files?.[0])
})

app.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement
  if (!form.matches('.workflow-use-form')) return
  event.preventDefault()
  if (!form.checkValidity()) { form.querySelector<HTMLElement>('.form-error')!.textContent = 'Fyll i alla obligatoriska fält innan rapporten skickas.'; form.reportValidity(); return }
  const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
  productState.reports.push({ id: Date.now(), values, status: 'Väntar' })
  productState.screen = 'approvals'
  persistProductState()
  renderProduct()
})

app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const screenButton = target.closest<HTMLElement>('[data-product-screen]')
  if (screenButton) { productState.screen = screenButton.dataset.productScreen as ProductState['screen']; persistProductState(); renderProduct(); return }
  const topic = target.closest<HTMLElement>('[data-topic]')
  if (topic) { productState.topic = topic.dataset.topic || ''; renderProduct(); return }
  if (target.closest('.onboarding-next')) {
    if (productState.onboardingStep === 1) { productState.customTopic = document.querySelector<HTMLTextAreaElement>('.custom-topic')?.value.trim() || ''; productState.onboardingStep = 2; persistProductState(); renderProduct() }
    else if (productState.onboardingStep === 4) {
      productState.screen = 'builder'
      if (!productState.currentAppId) {
        saveCurrentWorkflow()
      }
      persistProductState()
      renderProduct()
    }
    return
  }
  const field = target.closest<HTMLElement>('[data-field-index]')
  if (field) { productState.selectedField = Number(field.dataset.fieldIndex); renderProduct(); return }
  const builderTab = target.closest<HTMLElement>('[data-builder-tab]')
  if (builderTab) { productState.builderTab = (builderTab.dataset.builderTab as ProductState['builderTab']) || 'form'; persistProductState(); renderProduct(); return }
  const action = target.closest<HTMLElement>('[data-product-action]')?.dataset.productAction
  if (action === 'back-onboarding') { productState.onboardingStep = 1; renderProduct(); return }
  if (action === 'new-workflow') { beginOnboarding(); return }
  if (action === 'open-app') {
    const appId = target.closest<HTMLElement>('[data-app-id]')?.dataset.appId
    if (appId) openUserApp(appId)
    return
  }
  if (action === 'delete-app') {
    const appId = target.closest<HTMLElement>('[data-app-id]')?.dataset.appId
    if (appId) deleteUserApp(appId)
    return
  }
  if (action === 'edit-workflow') { productState.screen = 'builder'; renderProduct(); return }
  if (action === 'use-workflow') { productState.screen = 'use'; renderProduct(); return }
  if (action === 'save-field') {
    const selected = productState.fields[productState.selectedField]
    const nameInput = document.querySelector<HTMLInputElement>('[data-editor="name"]')
    const typeInput = document.querySelector<HTMLSelectElement>('[data-editor="type"]')
    if (selected && nameInput && typeInput) { selected.name = nameInput.value.trim() || selected.name; selected.type = typeInput.value; persistProductState(); renderProduct() }
    return
  }
  if (action === 'preview') { productState.screen = 'use'; persistProductState(); renderProduct(); return }
  if (target.closest('[data-toggle-required]')) { const selected = productState.fields[productState.selectedField]; if (selected) { selected.required = !selected.required; persistProductState(); renderProduct() } return }
  if (action === 'remove-field') { productState.fields.splice(productState.selectedField, 1); productState.selectedField = Math.max(0, productState.selectedField - 1); persistProductState(); renderProduct(); return }
  if (action === 'save-workflow') {
    saveCurrentWorkflow()
    renderProduct()
    return
  }
  if (action === 'publish-workflow') {
    if (window.confirm('Redo att publicera? Efter publicering kan teammedlemmar börja använda arbetsflödet.')) {
      productState.published = true
      productState.saved = true
      saveCurrentWorkflow()
      renderProduct()
    }
    return
  }
  if (action === 'export') { exportReports(); return }
  if (action === 'logout') {
    setSessionUser(null)
    productState.currentAppId = null
    productState.screen = 'projects'
    persistProductState()
    renderProduct()
    return
  }
  const reportAction = target.closest<HTMLElement>('[data-report-action]')
  if (reportAction) { const report = productState.reports.find((item) => item.id === Number(reportAction.dataset.reportId)); if (report) report.status = reportAction.dataset.reportAction === 'approve' ? 'Godkänd' : 'Avvisad'; persistProductState(); renderProduct() }
})

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduceMotion) document.documentElement.classList.add('reduce-motion')

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  },
  { threshold: 0.12 },
)
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

const chaosStage = document.querySelector('#chaos-stage')
if (chaosStage) {
  const chaosObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        window.setTimeout(() => entry.target.classList.add('is-assembled'), reduceMotion ? 0 : 1100)
        chaosObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.38 },
  )
  chaosObserver.observe(chaosStage)
}

const headerEl = document.querySelector('.site-header')
const onScroll = () => headerEl?.classList.toggle('is-scrolled', window.scrollY > 8)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

const demo = document.querySelector<HTMLElement>('.hero-demo')
const stageButtons = document.querySelectorAll<HTMLButtonElement>('.stage-tabs button')
const panels = document.querySelectorAll<HTMLElement>('.stage-panel')
const stages = ['excel', 'flowly', 'app'] as const
let demoPaused = false

const excelStatus = document.querySelector('[data-excel-status]')
const setStage = (stage: string) => {
  if (!demo) return
  demo.dataset.stage = stage
  stageButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.panel === stage))
  if (excelStatus) {
    excelStatus.textContent = stage === 'excel' ? 'Analyserar fil…' : 'Redo att importera'
  }
}

stageButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    demoPaused = true
    setStage(btn.dataset.panel ?? 'excel')
  })
})

panels.forEach((panel) => {
  panel.addEventListener('mouseenter', () => {
    demoPaused = true
    setStage(panel.dataset.panel ?? 'excel')
  })
  panel.addEventListener('mouseleave', () => {
    demoPaused = false
  })
})

if (!reduceMotion && demo) {
  let index = 0
  window.setInterval(() => {
    if (demoPaused) return
    index = (index + 1) % stages.length
    setStage(stages[index])
  }, 3800)
}

const initializeFlowly = () => {
  const currentUser = currentUserProfile()
  if (!currentUser) {
    renderProduct()
    return
  }
  const workspace = currentWorkspaceProfile() || ensureCurrentWorkspace(currentUser)
  productState.userName = currentUser.name
  productState.workspaceName = workspace.name
  productState.screen = 'projects'
  productState.currentAppId = null
  renderProduct()
}

initializeFlowly()

const uploadZone = document.querySelector<HTMLLabelElement>('.upload-zone')
const uploadInput = document.querySelector<HTMLInputElement>('#file-upload')
const uploadLabel = document.querySelector<HTMLElement>('.upload-label')
const uploadResultEl = document.querySelector<HTMLElement>('#upload-result')
let analysisRun = 0

const showUploadResult = (content: string) => {
  if (!uploadResultEl) return
  uploadResultEl.hidden = false
  uploadResultEl.innerHTML = content
  uploadResultEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' })
}

const resetUpload = () => {
  analysisRun += 1
  if (uploadInput) uploadInput.value = ''
  if (uploadLabel) uploadLabel.textContent = 'Släpp din Excel-fil här'
  if (uploadResultEl) {
    uploadResultEl.hidden = true
    uploadResultEl.innerHTML = ''
  }
}

const handleUpload = async (file: File | undefined) => {
  if (!file) return
  const currentRun = ++analysisRun
  const extension = file.name.toLocaleLowerCase('sv-SE').split('.').pop()
  if (extension !== 'xlsx' && extension !== 'xls') {
    showUploadResult(renderAnalysisError('Den filtypen stöds inte', 'Ladda upp en .xlsx- eller .xls-fil.'))
    return
  }

  if (uploadLabel) uploadLabel.textContent = file.name
  showUploadResult(renderAnalysisLoading(file.name))

  try {
    const [analysis] = await Promise.all([
      analyzeExcelFile(file),
      new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : 950)),
    ])
    if (currentRun !== analysisRun) return
    showUploadResult(renderAnalysis(analysis))
  } catch (error) {
    if (currentRun !== analysisRun) return
    const emptyFile = error instanceof Error && error.message === 'EMPTY_WORKBOOK'
    showUploadResult(renderAnalysisError(
      emptyFile ? 'Vi hittade inga data att analysera.' : 'Vi kunde inte läsa filen',
      emptyFile ? 'Ladda upp en Excel-fil som innehåller ett arbetsflöde eller en tabell.' : 'Kontrollera att filen är en giltig Excel-fil och försök igen.',
    ))
  }
}

uploadInput?.addEventListener('change', () => {
  void handleUpload(uploadInput.files?.[0])
})

;['dragenter', 'dragover'].forEach((type) => {
  uploadZone?.addEventListener(type, (event) => {
    event.preventDefault()
    uploadZone.classList.add('is-dragging')
  })
})
;['dragleave', 'drop'].forEach((type) => {
  uploadZone?.addEventListener(type, (event) => {
    event.preventDefault()
    uploadZone.classList.remove('is-dragging')
  })
})
uploadZone?.addEventListener('drop', (event) => {
  const file = (event as DragEvent).dataTransfer?.files?.[0]
  void handleUpload(file)
})

uploadResultEl?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  if (target.closest('.analysis-retry, .analysis-close, .analysis-another')) {
    resetUpload()
    uploadInput?.click()
  }
  if (target.closest('.create-workflow')) {
    const cta = target.closest('.analysis-cta')
    if (cta) cta.innerHTML = '<div class="analysis-message success-message"><span class="message-icon">✓</span><div><strong>Flowly är snart redo för nästa steg.</strong><p>Vi har sparat ingen fil. Den här förhandsvisningen visar hur arbetsflödet kan börja.</p></div></div>'
  }
})

const pendingCount = document.querySelector('[data-pending-count]')
const waitingCopy = document.querySelector('[data-waiting-copy]')
const doneCount = document.querySelector('[data-done-count]')

const progressFill = document.querySelector<HTMLElement>('.progress-card .bar i')
const bumpMetrics = () => {
  const pending = Math.max(0, Number(pendingCount?.textContent ?? 3) - 1)
  const done = Math.min(25, Number(doneCount?.textContent ?? 23) + 1)
  if (pendingCount) pendingCount.textContent = String(pending)
  if (waitingCopy) waitingCopy.textContent = String(pending)
  if (doneCount) doneCount.textContent = String(done)
  if (progressFill) progressFill.style.width = `${(done / 25) * 100}%`
}

document.querySelectorAll<HTMLButtonElement>('.approve-row').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.approval-card')
    if (!card || card.classList.contains('is-done')) return
    card.classList.add('is-done', 'is-approved')
    const actions = card.querySelector('.approval-actions')
    if (actions) actions.innerHTML = '<span class="badge badge-ok">Godkänd</span>'
    bumpMetrics()
  })
})

document.querySelectorAll<HTMLButtonElement>('.reject-row').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.approval-card')
    if (!card || card.classList.contains('is-done')) return
    card.classList.add('is-done', 'is-rejected')
    const actions = card.querySelector('.approval-actions')
    if (actions) actions.innerHTML = '<span class="badge badge-stop">Avvisad</span>'
    bumpMetrics()
  })
})

document.querySelector('.approve-demo')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement
  button.textContent = 'Godkänd'
  button.classList.add('is-done')
  button.disabled = true
  const status = document.querySelector('[data-erik-status]')
  if (status) {
    status.textContent = 'Godkänd'
    status.classList.remove('badge-wait')
    status.classList.add('badge-ok')
  }
  document.querySelector('[data-person="erik"]')?.classList.remove('is-focus')
})

const mobileMenu = document.querySelector<HTMLElement>('.mobile-menu')
document.querySelector('.mobile-menu-trigger')?.addEventListener('click', () => {
  mobileMenu?.classList.add('open')
  mobileMenu?.setAttribute('aria-hidden', 'false')
})
document.querySelector('.mobile-menu-close')?.addEventListener('click', () => {
  mobileMenu?.classList.remove('open')
  mobileMenu?.setAttribute('aria-hidden', 'true')
})
mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open')
    mobileMenu.setAttribute('aria-hidden', 'true')
  })
})

const navTargets: Array<[string, string]> = [
  ['produkt', 'produkt'],
  ['process', 'process'],
  ['exempel', 'exempel'],
  ['product-demo', 'produkt'],
  ['priser', 'priser'],
]
const navLinks = document.querySelectorAll('.desktop-nav a')
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const match = navTargets.find(([id]) => id === entry.target.id)
      if (!match) return
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${match[1]}`)
      })
    })
  },
  { rootMargin: '-42% 0px -48% 0px', threshold: 0 },
)
navTargets.forEach(([id]) => {
  const section = document.getElementById(id)
  if (section) navObserver.observe(section)
})
