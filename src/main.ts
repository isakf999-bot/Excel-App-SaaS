import './style.css'
import './landing.css'
import * as XLSX from 'xlsx'
import { excelErrorCopy, parseWorkbook, type WorkbookAnalysis } from './excel'
import { generateAppSpec, specToWorkflowFields, type AppSpec, type ExperienceChart } from './architect'
import { filterRecords, formatKpiValue, insightsFromRecords, recentRecords, recordTitle, recordsFromAnalysis, type AppRecord } from './records'
import { currentPeriodKey, formatMoney } from './semantics'

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
  ['Produkt', '#/'],
  ['Så fungerar det', '#/sa-fungerar-det'],
  ['Användningsområden', '#/anvandning'],
  ['Priser', '#/priser'],
  ['FAQ', '#/faq'],
] as const

type AppRoute =
  | { name: 'home'; focus?: string }
  | { name: 'how' }
  | { name: 'pricing' }
  | { name: 'faq' }
  | { name: 'apps' }
  | { name: 'new' }
  | { name: 'app'; id: string }

const parseRoute = (): AppRoute => {
  const raw = location.hash.replace(/^#/, '').replace(/^\//, '')
  if (raw === 'apps') return { name: 'apps' }
  if (raw === 'apps/new') return { name: 'new' }
  const appMatch = raw.match(/^apps\/([^/?#]+)/)
  if (appMatch?.[1] && appMatch[1] !== 'new') return { name: 'app', id: decodeURIComponent(appMatch[1]) }
  if (raw === 'priser') return { name: 'pricing' }
  if (raw === 'sa-fungerar-det' || raw === 'process') return { name: 'how' }
  if (raw === 'faq' || raw === 'fragor') return { name: 'faq' }
  if (raw === 'anvandning') return { name: 'home', focus: 'anvandning' }
  if (raw === 'produkt') return { name: 'home', focus: 'produkt' }
  return { name: 'home' }
}

const overlayHashes = new Set(['cta', 'login', 'upload', 'top'])
const isOverlayHash = () => overlayHashes.has(location.hash.replace(/^#/, '').replace(/^\//, ''))
const isProductRoute = (route: AppRoute) => route.name === 'apps' || route.name === 'new' || route.name === 'app'
const isMarketingPage = (route: AppRoute) => route.name === 'how' || route.name === 'pricing' || route.name === 'faq'

const pageTitle = (route: AppRoute) => {
  if (route.name === 'how') return 'Så fungerar det — Flowly'
  if (route.name === 'pricing') return 'Priser — Flowly'
  if (route.name === 'faq') return 'FAQ — Flowly'
  if (route.name === 'home' && route.focus === 'anvandning') return 'Användningsområden — Flowly'
  return 'Flowly — Från Excel till arbetsapp'
}

const currentNavHref = () => {
  const route = parseRoute()
  if (route.name === 'how') return '#/sa-fungerar-det'
  if (route.name === 'pricing') return '#/priser'
  if (route.name === 'faq') return '#/faq'
  if (route.name === 'home' && route.focus === 'anvandning') return '#/anvandning'
  return '#/'
}

const flowMark = (size: 'sm' | '' = '') => `
  <span class="brand-mark${size ? ` ${size}` : ''}" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="4.4" cy="12" r="2.3" fill="currentColor"/>
      <circle cx="19.6" cy="6.2" r="2.3" fill="currentColor"/>
      <circle cx="19.6" cy="17.8" r="2.3" fill="currentColor"/>
      <path d="M6.6 12h5.2L17.4 7.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.8 12 17.4 16.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
`

const pageAtmosphere = () => `
  <div class="page-atmosphere" aria-hidden="true">
    <div class="atm-grid"></div>
    <div class="atm-glow atm-glow-hero"></div>
  </div>
`

const header = () => `
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#/" aria-label="Flowly startsida">${flowMark()}<span class="brand-word">Flowly</span></a>
      <nav class="desktop-nav" aria-label="Huvudmeny">${navMap.map(([label, href]) => `<a href="${href}" class="${currentNavHref() === href ? 'is-active' : ''}">${label}</a>`).join('')}</nav>
      <div class="header-actions">
        <a class="login-link" href="#login">Logga in</a>
        <a class="button button-primary button-small" href="#cta">Kom igång</a>
      </div>
      <button class="icon-button mobile-menu-trigger" type="button" aria-label="Öppna meny">${icon('menu')}</button>
    </div>
  </header>
  <a class="mobile-sticky-cta" href="#cta">Kom igång ${icon('arrow', 15)}</a>
  <div class="mobile-menu" aria-hidden="true">
    <button class="icon-button mobile-menu-close" type="button" aria-label="Stäng meny">${icon('close')}</button>
    ${navMap.map(([label, href]) => `<a href="${href}" class="${currentNavHref() === href ? 'is-active' : ''}">${label}</a>`).join('')}
    <a href="#login">Logga in</a>
    <a class="mobile-cta" href="#cta">Kom igång ${icon('arrow', 16)}</a>
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
    ['9', 'Maja Ek', '36', 'Nova', '35', 'Väntar'],
    ['10', 'Oscar Dahl', '36', 'Atlas', '40', 'Godkänd'],
  ]
  return `
    <div class="xl-grid">
      <div class="xl-cols"><i></i><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>
      ${rows.map((row, i) => `<div class="xl-row${i === 0 ? ' is-head' : ''}${i === 2 ? ' is-active' : ''}">${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}
    </div>
  `
}

const lpChrome = (title: string, extra = '') => `
  <div class="lp-ui-bar">
    <span class="lp-ui-brand">${flowMark('sm')} ${title}</span>
    <span class="lp-ui-dots"><i></i><i></i><i></i></span>
  </div>
  ${extra}
`

const formMock = () => `
  <div class="lp-ui">
    ${lpChrome('Ny tidrapport')}
    <div class="lp-ui-body">
      <label class="lp-field"><span>Vecka</span><span class="lp-input">36</span></label>
      <label class="lp-field"><span>Projekt</span><span class="lp-input">Atlas</span></label>
      <label class="lp-field"><span>Timmar</span><span class="lp-input">38</span></label>
      <label class="lp-field"><span>Kommentar</span><span class="lp-input is-muted">Möten + leverans</span></label>
      <div class="lp-form-actions">
        <span class="lp-ghost">Spara utkast</span>
        <span class="lp-solid">Skicka till chef</span>
      </div>
    </div>
  </div>
`

const workflowMock = () => `
  <div class="lp-ui">
    ${lpChrome('Arbetsflöde')}
    <div class="lp-ui-body lp-nodes">
      <div class="lp-node"><small>01</small><strong>Anställd fyller i</strong><em>Formulär</em></div>
      <i></i>
      <div class="lp-node is-on"><small>02</small><strong>Chef granskar</strong><em>Godkännande</em></div>
      <i></i>
      <div class="lp-node"><small>03</small><strong>Ekonomi exporterar</strong><em>Excel</em></div>
    </div>
  </div>
`

const dashMock = () => `
  <div class="lp-ui lp-dash">
    ${lpChrome('Nordmark AB')}
    <div class="lp-dash-body">
      <aside>
        <a class="is-on">${icon('chart', 13)} Översikt</a>
        <a>${icon('clipboard', 13)} Uppgifter</a>
        <a>${icon('check', 13)} Godkännanden</a>
        <a>${icon('users', 13)} Team</a>
      </aside>
      <div>
        <div class="lp-stats">
          <div><small>Status</small><strong>23 / 25</strong><span>klara denna vecka</span></div>
          <div><small>Uppgifter</small><strong>3</strong><span>väntar på dig</span></div>
          <div><small>Inskickat</small><strong>18</strong><span>sedan måndag</span></div>
        </div>
        <div class="lp-row"><span>${av('AA', 'peach')} Anna Andersson</span><b>38 h</b><em class="ok">Godkänd</em></div>
        <div class="lp-row is-focus"><span>${av('EJ', 'blue')} Erik Johansson</span><b>40 h</b><em class="wait">Granskas</em></div>
        <div class="lp-row"><span>${av('SN', 'sand')} Sara Nilsson</span><b>36 h</b><em class="ok">Godkänd</em></div>
        <div class="lp-activity">
          <small>Senaste aktivitet</small>
          <p>Lisa godkände Annas rapport · 09:21</p>
          <p>Erik skickade in vecka 36 · 10:02</p>
        </div>
      </div>
    </div>
  </div>
`

const approvalMock = () => `
  <div class="lp-ui">
    ${lpChrome('Godkännanden')}
    <div class="lp-ui-body">
      <div class="lp-pipe">
        <span>Skickad</span>
        <i></i>
        <span class="is-on">Granskas</span>
        <i></i>
        <span>Godkänd</span>
      </div>
      <div class="lp-row is-focus"><span>${av('EJ', 'blue')} Erik Johansson · Nova</span><b>40 h</b></div>
      <div class="lp-row"><span>${av('JL', 'sage')} Johan Lind · Nova</span><b>32 h</b></div>
      <div class="lp-form-actions">
        <span class="lp-ghost">Avvisa</span>
        <span class="lp-solid">Godkänn</span>
      </div>
    </div>
  </div>
`

const activityMock = () => `
  <div class="lp-ui">
    ${lpChrome('Vad som händer')}
    <div class="lp-ui-body">
      <div class="lp-feed">
        <div><b>09:21</b><p>Lisa godkände tidrapport · Anna Andersson</p></div>
        <div><b>10:02</b><p>Erik skickade in vecka 36 · Nova</p></div>
        <div><b>10:14</b><p>Ekonomi exporterade 23 godkända rader</p></div>
        <div><b>11:03</b><p>Johan väntar på godkännande</p></div>
      </div>
    </div>
  </div>
`

const messyExcel = () => `
  <div class="lp-mess-stack">
    <div class="lp-file-row">
      <article class="lp-file">${icon('file', 14)} rapport_v3.xlsx</article>
      <article class="lp-file is-dup">${icon('file', 14)} rapport_final.xlsx</article>
      <article class="lp-file is-dup">${icon('file', 14)} rapport_FINAL2.xlsx</article>
    </div>
    <div class="lp-tiny-xl">
      <div class="lp-tiny-bar"><span>X</span> tidrapportering.xlsx <em>4 versioner</em></div>
      ${excelGrid()}
    </div>
  </div>
`

const hero = () => `
  <section class="hero" id="top">
    <div class="hero-aura" aria-hidden="true"></div>
    <div class="hero-split">
      <div class="hero-copy reveal">
        <p class="lp-kicker">Excel → arbetsapp</p>
        <h1>Förvandla ert Excel-kaos till en <em>riktig app.</em></h1>
        <ul class="hero-points">
          <li>${icon('check', 16)} Börja med filen ni redan har</li>
          <li>${icon('check', 16)} Formulär, godkännanden och dashboard</li>
          <li>${icon('check', 16)} Inget nytt ERP-system att byta till</li>
        </ul>
        <div class="hero-actions">
          <a class="button button-primary" href="#cta">Kom igång gratis</a>
        </div>
        <p class="trust-note">${icon('check', 14)} Ingen kod. Ingen lång implementation.</p>
      </div>
      <div class="hero-visual reveal">
        <div class="hero-app-shot" aria-hidden="true">${dashMock()}</div>
        <div class="hero-float-card">
          <span class="hero-float-file">${icon('file', 16)} tidrapportering.xlsx</span>
          <i></i>
          <span>Blir en webbapp teamet kan använda</span>
        </div>
      </div>
    </div>
  </section>
`

const liveDemoShell = () => `
  <section class="lp-livedemo" id="produkt">
    <div class="lp-wrap">
      <div class="lp-intro">
        <p class="lp-kicker">Interaktiv demo</p>
        <h2>Klicka runt i webbappen.</h2>
        <p class="lp-lead">Detta är en förhandsvisning med exempeldata. Ni kan öppna sidor och titta — men inte lägga till, spara eller ändra något på riktigt.</p>
      </div>
    </div>
    <div class="lp-demo-banner" role="status">
      <strong>DEMO</strong>
      <span>Exempelapp · Tidrapportering · Inget sparas · Ni kan inte lägga till poster</span>
      <a class="button button-primary button-small" href="#cta">Skapa er egen app</a>
    </div>
    <div class="lp-demo-app" id="live-demo" data-demo-view="overview"></div>
    <p class="lp-demo-note">All data är påhittad för demonstrationen. För att bygga er egen app behövs ett konto.</p>
  </section>
`

const liveDemoData = () => [
  { id: 'anna', name: 'Anna Andersson', project: 'Atlas', hours: 38, status: 'Godkänd', time: '09:14', initials: 'AA', tone: 'peach' },
  { id: 'erik', name: 'Erik Johansson', project: 'Nova', hours: 40, status: 'Väntar', time: '10:02', initials: 'EJ', tone: 'blue' },
  { id: 'sara', name: 'Sara Nilsson', project: 'Atlas', hours: 36, status: 'Godkänd', time: '08:51', initials: 'SN', tone: 'sand' },
  { id: 'johan', name: 'Johan Lind', project: 'Nova', hours: 32, status: 'Väntar', time: '17:41', initials: 'JL', tone: 'sage' },
  { id: 'maria', name: 'Maria Berg', project: 'Atlas', hours: 40, status: 'Godkänd', time: '08:12', initials: 'MB', tone: 'peach' },
]

type DemoView = 'overview' | 'inbox' | 'approvals' | 'team' | 'activity'

const renderLiveDemoView = (view: DemoView, selectedId = 'erik') => {
  const rows = liveDemoData()
  const waiting = rows.filter((row) => row.status === 'Väntar').length
  const done = rows.filter((row) => row.status === 'Godkänd').length
  const selected = rows.find((row) => row.id === selectedId) ?? rows[1]
  const nav = [
    ['overview', 'chart', 'Översikt'],
    ['inbox', 'clipboard', 'Rapporter'],
    ['approvals', 'check', 'Godkännanden'],
    ['team', 'users', 'Team'],
    ['activity', 'eye', 'Aktivitet'],
  ] as const

  const body = view === 'overview' ? `
    <div class="lp-demo-head"><div><small>Nordmark AB · Demo</small><h3>Veckans tidrapporter</h3></div><span class="lp-demo-pill">${done} av ${rows.length} klara</span></div>
    <div class="lp-stats">
      <div><small>Status</small><strong>${done} / ${rows.length}</strong><span>godkända</span></div>
      <div><small>Väntar</small><strong>${waiting}</strong><span>på godkännande</span></div>
      <div><small>Inskickat</small><strong>${rows.length}</strong><span>denna vecka</span></div>
    </div>
    ${rows.slice(0, 4).map((row) => `<button type="button" class="lp-demo-row${row.id === selectedId ? ' is-on' : ''}" data-demo-open="${row.id}"><span>${av(row.initials, row.tone)} ${row.name}</span><b>${row.hours} h</b><em class="${row.status === 'Godkänd' ? 'ok' : 'wait'}">${row.status}</em></button>`).join('')}
  ` : view === 'inbox' ? `
    <div class="lp-demo-head"><div><small>Rapporter</small><h3>Alla inskickade</h3></div><button type="button" class="lp-demo-locked" data-demo-locked="add">${icon('plus', 14)} Ny rapport</button></div>
    <div class="lp-demo-table">
      <div class="lp-demo-thead"><span>Namn</span><span>Projekt</span><span>Timmar</span><span>Status</span></div>
      ${rows.map((row) => `<button type="button" class="lp-demo-trow${row.id === selectedId ? ' is-on' : ''}" data-demo-open="${row.id}"><span>${av(row.initials, row.tone)} ${row.name}</span><span>${row.project}</span><span>${row.hours} h</span><em class="${row.status === 'Godkänd' ? 'ok' : 'wait'}">${row.status}</em></button>`).join('')}
    </div>
  ` : view === 'approvals' ? `
    <div class="lp-demo-head"><div><small>Godkännanden</small><h3>${waiting} väntar i demon</h3></div></div>
    <div class="lp-pipe"><span>Skickad</span><i></i><span class="is-on">Granskas</span><i></i><span>Godkänd</span></div>
    ${rows.filter((row) => row.status === 'Väntar').map((row) => `<div class="lp-demo-row is-on"><span>${av(row.initials, row.tone)} ${row.name} · ${row.project}</span><b>${row.hours} h</b><button type="button" class="lp-demo-locked" data-demo-locked="approve">Godkänn</button></div>`).join('')}
    <p class="lp-demo-hint">Godkännanden går inte att genomföra i demon.</p>
  ` : view === 'team' ? `
    <div class="lp-demo-head"><div><small>Team</small><h3>Vilka som använder appen</h3></div><button type="button" class="lp-demo-locked" data-demo-locked="invite">${icon('plus', 14)} Bjud in</button></div>
    ${[['AA','peach','Anna Andersson','Anställd'],['EJ','blue','Erik Johansson','Anställd'],['LL','sand','Lisa Lind','Chef'],['KE','sage','Karin Ek','Ekonomi']].map(([ini, tone, name, role]) => `<div class="lp-demo-row"><span>${av(String(ini), String(tone))} ${name}</span><em>${role}</em></div>`).join('')}
  ` : `
    <div class="lp-demo-head"><div><small>Aktivitet</small><h3>Vad som händer</h3></div></div>
    <div class="lp-feed">
      <div><b>09:21</b><p>Lisa godkände tidrapport · Anna Andersson</p></div>
      <div><b>10:02</b><p>Erik skickade in vecka 36 · Nova</p></div>
      <div><b>10:14</b><p>Ekonomi exporterade 23 godkända rader</p></div>
      <div><b>11:03</b><p>Johan väntar på godkännande</p></div>
    </div>
  `

  const detail = selected ? `
    <aside class="lp-demo-detail">
      <small>Vald rapport · skrivskyddad</small>
      <h4>${selected.name}</h4>
      <p>${selected.project} · ${selected.hours} timmar · ${selected.time}</p>
      <label>Vecka<input value="36" readonly /></label>
      <label>Projekt<input value="${selected.project}" readonly /></label>
      <label>Timmar<input value="${selected.hours}" readonly /></label>
      <button type="button" class="lp-demo-locked" data-demo-locked="edit">Redigera fält</button>
    </aside>
  ` : ''

  return `
    <div class="lp-demo-chrome">
      <span>${flowMark('sm')} Flowly demo</span>
      <strong>Ni tittar på en demo</strong>
      <em>Inget konto · Inget sparas</em>
    </div>
    <div class="lp-demo-body">
      <aside>
        <p>Nordmark AB</p>
        ${nav.map(([id, ic, label]) => `<button type="button" data-demo-view="${id}" class="${view === id ? 'is-on' : ''}">${icon(ic, 14)} ${label}${id === 'approvals' && waiting ? `<b>${waiting}</b>` : ''}</button>`).join('')}
      </aside>
      <div class="lp-demo-main">${body}</div>
      ${view === 'inbox' || view === 'overview' ? detail : ''}
    </div>
  `
}

const valueStrip = () => `
  <section class="lp-strip">
    <div class="lp-wrap">
      <p class="lp-kicker reveal">Från Excel till fungerande arbetsflöde</p>
      <div class="lp-strip-inner reveal">
        ${[
          [icon('file', 16), 'Excel', 'Filen ni redan har'],
          [icon('layers', 16), 'Struktur', 'Kolumner blir fält'],
          [icon('clipboard', 16), 'Formulär', 'Teamet fyller i'],
          [icon('check', 16), 'Godkännanden', 'Rätt person signerar'],
          [icon('chart', 16), 'Dashboard', 'Alla ser läget'],
        ].map(([ic, title, note], index) => `<div class="lp-strip-item">${index ? '<i aria-hidden="true"></i>' : ''}<span>${ic}</span><b>${title}</b><small>${note}</small></div>`).join('')}
      </div>
    </div>
  </section>
`

const chaos = () => `
  <section class="lp-section lp-problem" id="exempel">
    <div class="lp-wrap">
      <div class="lp-split">
        <div class="lp-copy reveal">
          <p class="lp-kicker">Problemet</p>
          <h2>Excel fungerar.<br /><em>Tills det inte gör det.</em></h2>
          <p class="lp-lead">Det börjar med en enkel fil. Sedan kommer versionerna, mejlen och osäkerheten om vem som gjort vad.</p>
          <div class="lp-problem-list">
            ${[
              'Flera versioner av samma fil',
              'Information som försvinner i Teams och mejl',
              'Manuella uppdateringar',
              'Svårt att veta vem som gjort vad',
              'Inga tydliga godkännanden',
              'Svårt att följa processen',
            ].map((item) => `<div>${icon('file', 14)}<span>${item}</span></div>`).join('')}
          </div>
        </div>
        <div class="reveal lp-mess" id="chaos-stage">
          ${messyExcel()}
          <div class="lp-mess-notes">
            <span>${icon('message', 13)} Kan du kolla senaste filen?</span>
            <span>${icon('mail', 13)} Fwd: tidrapport v.36</span>
          </div>
        </div>
      </div>
    </div>
  </section>
`

const transform = () => `
  <section class="lp-section lp-transform-band">
    <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Förvandlingen</p>
        <h2>Gör Excel till en <em>riktig arbetsapp.</em></h2>
      </div>
      <div class="lp-transform reveal">
        <div class="lp-transform-col">
          <h3>Så ser det ut idag</h3>
          ${messyExcel()}
        </div>
        <div class="lp-mid">${flowMark()}<b>Flowly</b><i></i></div>
        <div class="lp-transform-col is-app">
          <h3>Så kan det se ut imorgon</h3>
          ${dashMock()}
        </div>
      </div>
    </div>
  </section>
`

type ExcelAnalysis = WorkbookAnalysis

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

const analyzeExcelFile = async (file: File): Promise<ExcelAnalysis> => parseWorkbook(file)

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
  ownerId: string
  workspaceId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'active'
  sourceFileName: string
  config: {
    topic: string
    customTopic: string
    fields: WorkflowField[]
    approver: string
    afterApproval: string
    published: boolean
    saved: boolean
    analysis?: ExcelAnalysis
    spec?: AppSpec
    records: AppRecord[]
    reports: Report[]
    builderTab: 'form' | 'workflow' | 'approvals' | 'team'
  }
}
type FlowlyStore = {
  users: FlowlyUser[]
  workspaces: FlowlyWorkspace[]
  apps: FlowlyApp[]
  session: { userId: string | null }
}
type ProductState = {
  screen: 'onboarding' | 'projects' | 'dashboard' | 'workflows' | 'builder' | 'use' | 'approvals' | 'team' | 'settings' | 'reports' | 'group'
  builderTab: 'form' | 'workflow' | 'approvals' | 'team'
  onboardingStep: 1 | 2 | 3 | 4
  onboardingError: string
  analysisProgress: string[]
  topic: string
  customTopic: string
  analysis?: ExcelAnalysis
  spec?: AppSpec
  fields: WorkflowField[]
  selectedField: number
  approver: string
  afterApproval: string
  saved: boolean
  published: boolean
  reports: Report[]
  records: AppRecord[]
  recordQuery: string
  recordFilter: string
  periodFilter: string
  categoryFilter: string
  groupViewId: string
  draftDefaults: Record<string, string>
  editingRecordId: string | null
  currentAppId: string | null
  userName: string
  workspaceName: string
  authReady: boolean
  appsStatus: 'idle' | 'loading' | 'ready' | 'error'
}

const FLOWLY_STORE_KEY = 'flowly-store-v1'

const emptyStore = (): FlowlyStore => ({ users: [], workspaces: [], apps: [], session: { userId: null } })

const legacyRecords = (app: FlowlyApp): AppRecord[] => {
  if (Array.isArray(app.config?.records) && app.config.records.length) return app.config.records
  const fromReports = Array.isArray(app.config?.reports)
    ? app.config.reports.map((report) => ({
      id: String(report.id),
      values: { ...report.values, ...(report.status ? { Status: report.status } : {}) },
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      source: 'user' as const,
    }))
    : []
  if (fromReports.length) return fromReports
  const analysis = app.config?.analysis
  if (!analysis?.columns?.length || !analysis.rows?.length) return []
  const now = app.createdAt || new Date().toISOString()
  return analysis.rows.map((row, index) => ({
    id: `${app.id}-row-${index}`,
    values: Object.fromEntries(analysis.columns.map((column, columnIndex) => [column, row[columnIndex] ?? ''])),
    createdAt: now,
    updatedAt: now,
    source: 'excel' as const,
  }))
}

const migrateApp = (app: FlowlyApp, workspaces: FlowlyWorkspace[]): FlowlyApp => {
  const workspace = workspaces.find((entry) => entry.id === app.workspaceId)
  const records = legacyRecords(app)
  const analysis = app.config?.analysis
  const customTopic = app.config?.customTopic || app.description || ''
  const topic = app.config?.topic || app.name
  const spec = app.config?.spec || (analysis ? generateAppSpec({ useCase: topic, explanation: customTopic, analysis }) : undefined)
  return {
    ...app,
    ownerId: app.ownerId || workspace?.ownerId || '',
    config: {
      topic,
      customTopic,
      fields: Array.isArray(app.config?.fields) && app.config.fields.length
        ? app.config.fields
        : spec ? specToWorkflowFields(spec) : [],
      approver: app.config?.approver || 'Chef',
      afterApproval: app.config?.afterApproval || 'Markera som klar',
      published: Boolean(app.config?.published),
      saved: Boolean(app.config?.saved),
      analysis,
      spec,
      records,
      reports: Array.isArray(app.config?.reports) ? app.config.reports : [],
      builderTab: app.config?.builderTab || 'form',
    },
  }
}

const readFlowlyStore = (): FlowlyStore => {
  try {
    const saved = localStorage.getItem(FLOWLY_STORE_KEY)
    if (!saved) return emptyStore()
    const parsed = JSON.parse(saved) as Partial<FlowlyStore>
    const workspaces = Array.isArray(parsed.workspaces) ? parsed.workspaces : []
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      workspaces,
      apps: Array.isArray(parsed.apps) ? parsed.apps.map((app) => migrateApp(app as FlowlyApp, workspaces)) : [],
      session: { userId: parsed.session?.userId ?? null },
    }
  } catch {
    return emptyStore()
  }
}

const writeFlowlyStore = (store: FlowlyStore) => localStorage.setItem(FLOWLY_STORE_KEY, JSON.stringify(store))

const updateStore = (recipe: (store: FlowlyStore) => void): FlowlyStore => {
  const store = readFlowlyStore()
  recipe(store)
  writeFlowlyStore(store)
  return store
}

const hashPassword = async (password: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`)

const setSessionUser = (userId: string | null) => {
  updateStore((store) => {
    store.session.userId = userId
  })
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

const getOwnedApps = (): FlowlyApp[] => {
  const user = getCurrentUser()
  if (!user) return []
  return readFlowlyStore()
    .apps
    .filter((app) => app.ownerId === user.id)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
}

const getOwnedApp = (appId: string | null | undefined): FlowlyApp | null => {
  const user = getCurrentUser()
  if (!user || !appId) return null
  const app = readFlowlyStore().apps.find((entry) => entry.id === appId)
  if (!app || app.ownerId !== user.id) return null
  return app
}

const getCurrentWorkspaceApps = (): FlowlyApp[] => getOwnedApps()

const ensureCurrentWorkspace = (user: FlowlyUser): FlowlyWorkspace => {
  const existing = readFlowlyStore().workspaces.find((workspace) => workspace.ownerId === user.id)
  if (existing) return existing
  const workspace: FlowlyWorkspace = {
    id: makeId(),
    ownerId: user.id,
    name: `${user.name.split(' ')[0] || 'Flowly'} workspace`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  updateStore((store) => {
    if (!store.workspaces.some((entry) => entry.ownerId === user.id)) store.workspaces.push(workspace)
  })
  return readFlowlyStore().workspaces.find((entry) => entry.ownerId === user.id) ?? workspace
}

const upsertWorkflowApp = (app: FlowlyApp) => {
  updateStore((store) => {
    const existingIndex = store.apps.findIndex((entry) => entry.id === app.id)
    if (existingIndex >= 0) store.apps[existingIndex] = app
    else store.apps.push(app)
  })
  return app
}

const resetWorkspaceHomeState = () => {
  productState.currentAppId = null
  productState.topic = ''
  productState.customTopic = ''
  productState.onboardingError = ''
  productState.analysisProgress = []
  productState.fields = []
  productState.selectedField = 0
  productState.approver = 'Chef'
  productState.afterApproval = 'Markera som klar'
  productState.saved = false
  productState.published = false
  productState.analysis = undefined
  productState.spec = undefined
  productState.reports = []
  productState.records = []
  productState.recordQuery = ''
  productState.recordFilter = ''
  productState.periodFilter = ''
  productState.categoryFilter = ''
  productState.groupViewId = ''
  productState.draftDefaults = {}
  productState.editingRecordId = null
  productState.builderTab = 'form'
  productState.onboardingStep = 1
}

const loadAppIntoState = (app: FlowlyApp | null) => {
  if (!app) {
    resetWorkspaceHomeState()
    return
  }
  productState.currentAppId = app.id
  productState.topic = app.config.topic || app.name
  productState.customTopic = app.config.customTopic || ''
  productState.fields = app.config.fields.length ? app.config.fields : []
  productState.approver = app.config.approver || 'Chef'
  productState.afterApproval = app.config.afterApproval || 'Markera som klar'
  productState.saved = app.config.saved
  productState.published = app.config.published
  productState.analysis = app.config.analysis
  productState.spec = app.config.spec
  productState.reports = app.config.reports || []
  productState.records = app.config.records || []
  productState.recordQuery = ''
  productState.recordFilter = ''
  productState.periodFilter = ''
  productState.categoryFilter = ''
  productState.groupViewId = ''
  productState.draftDefaults = {}
  productState.editingRecordId = null
  productState.builderTab = app.config.builderTab || 'form'
  productState.userName = getCurrentUser()?.name || productState.userName
  productState.workspaceName = getCurrentWorkspace()?.name || productState.workspaceName
}

const productState: ProductState = {
  screen: 'projects', builderTab: 'form', onboardingStep: 1, onboardingError: '', analysisProgress: [],
  topic: '', customTopic: '', fields: [], selectedField: 0,
  approver: 'Chef', afterApproval: 'Markera som klar', saved: false, published: false, reports: [], records: [],
  recordQuery: '', recordFilter: '', periodFilter: '', categoryFilter: '', groupViewId: '', draftDefaults: {}, editingRecordId: null, currentAppId: null,
  userName: 'Flowly användare', workspaceName: 'Flowly workspace', authReady: false, appsStatus: 'idle',
}

const persistProductState = () => {}

const currentUserProfile = () => getCurrentUser()
const currentWorkspaceProfile = () => getCurrentWorkspace()
const saveCurrentWorkflow = () => {
  const user = currentUserProfile()
  const workspace = currentWorkspaceProfile() || (user ? ensureCurrentWorkspace(user) : null)
  if (!user || !workspace) return null

  const existing = getOwnedApp(productState.currentAppId)
  const appId = existing?.id ?? makeId()
  const nextApp: FlowlyApp = {
    id: appId,
    ownerId: user.id,
    workspaceId: workspace.id,
    name: productState.spec?.name || productState.topic || existing?.name || 'Nytt arbetsflöde',
    description: productState.customTopic || existing?.description || `Arbetsflöde byggt från ${productState.analysis?.fileName || 'Excel'}`,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: productState.published ? 'active' : 'draft',
    sourceFileName: productState.analysis?.fileName || existing?.sourceFileName || 'excel-fil.xlsx',
    config: {
      topic: productState.topic,
      customTopic: productState.customTopic,
      fields: productState.fields,
      approver: productState.approver,
      afterApproval: productState.afterApproval,
      published: productState.published,
      saved: true,
      analysis: productState.analysis,
      spec: productState.spec,
      records: productState.records,
      reports: productState.reports,
      builderTab: productState.builderTab,
    },
  }
  productState.currentAppId = nextApp.id
  productState.saved = true
  productState.published = nextApp.status === 'active'
  upsertWorkflowApp(nextApp)
  loadAppIntoState(nextApp)
  return nextApp
}


const setAppHash = (path: string) => {
  const next = path.startsWith('#') ? path : `#${path}`
  if (location.hash !== next) history.replaceState(null, '', next)
}

const formatRelativeDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'nyligen'
  const start = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const diff = Math.round((start(new Date()) - start(date)) / 86400000)
  if (diff === 0) return 'idag'
  if (diff === 1) return 'igår'
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

const topicIcon = (topic: string): IconName => {
  if (topic.includes('Tid')) return 'clock'
  if (topic.includes('Beställ')) return 'box'
  if (topic.includes('Projekt')) return 'chart'
  if (topic.includes('Kvalitet')) return 'shield'
  return 'clipboard'
}

const authModal = () => `
  <div class="auth-overlay" id="auth-overlay" hidden>
    <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" class="icon-button auth-close" aria-label="Stäng">${icon('close', 17)}</button>
      <span class="brand auth-brand">${flowMark()}<span class="brand-word">Flowly</span></span>
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

const onboardingSteps = () => `<div class="product-stepper">${[['01', 'Användning'], ['02', 'Excel'], ['03', 'Analys'], ['04', 'Skapa app']].map(([number, label], index) => `<span class="${index + 1 <= productState.onboardingStep ? 'is-active' : ''}"><b>${number}</b>${label}</span>`).join('')}</div>`

const productSidebar = () => {
  const currentUser = currentUserProfile()
  const workspace = currentWorkspaceProfile()
  const initials = currentUser?.name?.split(' ')?.slice(0, 2).map((segment) => segment[0]?.toUpperCase() ?? '').join('') || 'FU'
  const inApp = Boolean(productState.currentAppId) && productState.screen !== 'projects'
  const spec = productState.spec
  const waiting = spec?.statusField
    ? productState.records.filter((record) => /väntar|vant|öppen|oppen|pågående|pagaende|ny|planerad/i.test(record.values[spec.statusField!] || '')).length
    : 0
  const navFromSpec = spec?.experience?.navigation
  const appNav: Array<[ProductState['screen'], IconName, string, string]> = navFromSpec?.length
    ? navFromSpec.map((item) => [item.screen, item.icon, item.label, item.groupId || ''])
    : [
      ['dashboard', 'chart', 'Översikt', ''],
      ['use', 'clipboard', spec ? spec.entityNamePlural[0].toUpperCase() + spec.entityNamePlural.slice(1) : 'Poster', ''],
    ]
  if (!appNav.some((item) => item[0] === 'builder')) appNav.push(['builder', 'settings', 'Fält', ''])
  if (!appNav.some((item) => item[0] === 'team')) appNav.push(['team', 'users', 'Team', ''])
  if (spec?.features.includes('approvals') && !appNav.some((item) => item[0] === 'approvals')) {
    appNav.splice(Math.max(appNav.length - 2, 1), 0, ['approvals', 'check', 'Godkännanden', ''])
  }
  const navActive = (screen: ProductState['screen'], groupId: string) => {
    if (screen === 'group') return productState.screen === 'group' && productState.groupViewId === groupId
    return productState.screen === screen
  }
  return `
    <aside class="product-sidebar">
      <a class="product-brand" href="#/apps" data-product-action="back-to-apps">${flowMark()}<strong>Flowly</strong></a>
      <div class="workspace-switcher">${av(initials.slice(0, 2).toUpperCase() || 'FU', 'sand')}<span><small>Workspace</small>${escapeHtml(workspace?.name || 'Flowly workspace')}</span></div>
      <nav class="product-nav">
        <p>Workspace</p>
        <button type="button" data-product-action="back-to-apps" class="${productState.screen === 'projects' ? 'is-active' : ''}">${icon('layers', 16)}Mina appar</button>
        ${inApp ? `<p class="nav-spacer">App</p>${appNav.map(([screen, ic, label, groupId]) => `<button type="button" data-product-screen="${screen}" ${groupId ? `data-group-id="${escapeHtml(groupId)}"` : ''} class="${navActive(screen, groupId) ? 'is-active' : ''}">${icon(ic, 16)}${label}${screen === 'approvals' && waiting ? `<b>${waiting}</b>` : ''}</button>`).join('')}` : ''}
        <p class="nav-spacer">Konto</p>
        <button type="button" data-product-screen="settings" class="${productState.screen === 'settings' ? 'is-active' : ''}">${icon('settings', 16)}Inställningar</button>
      </nav>
      <div class="sidebar-bottom"><span>${av(initials.slice(0, 2).toUpperCase() || 'FU', 'peach')}<span><strong>${escapeHtml(currentUser?.name || 'Flowly användare')}</strong><small>Inloggad</small></span></span><button type="button" data-product-action="logout" aria-label="Logga ut">${icon('arrow', 15)}</button></div>
    </aside>
  `
}

const productHeader = (title: string, description: string) => `<header class="product-header"><div>${productState.currentAppId && productState.screen !== 'projects' ? `<button type="button" class="text-link apps-back-link" data-product-action="back-to-apps">${icon('arrow', 14)} Mina appar</button>` : ''}<p class="product-kicker">Flowly workspace</p><h1>${title}</h1><p>${description}</p></div><div class="product-header-actions"><span class="workspace-status"><i></i> Sparat workspace</span><button type="button" class="icon-button">${icon('bell', 16)}</button></div></header>`

const workflowFieldsFromAnalysis = (analysis: ExcelAnalysis): WorkflowField[] => analysis.columns.map((name) => ({
  name,
  type: matchesColumn(name, ['tim', 'antal', 'sum', 'kostnad']) ? 'Number' : matchesColumn(name, ['datum', 'date']) ? 'Date' : matchesColumn(name, ['godkänd', 'godkand', 'status']) ? 'Status' : 'Text',
  required: !matchesColumn(name, ['kommentar', 'comment']),
  value: '',
}))

const analysisStageList = [
  ['file', 'Läser Excel-filen'],
  ['columns', 'Identifierar struktur och sektioner'],
  ['types', 'Hittar beräkningar och kategorier'],
  ['explanation', 'Läser din beskrivning'],
  ['workflow', 'Designar appen kring hur du arbetar'],
  ['ready', 'Förbereder din app'],
] as const

const onboardingView = () => {
  const topics = ['Tidrapportering', 'Beställningar', 'Kvalitetskontroller', 'Avvikelsehantering', 'Projektuppföljning', 'Annat']
  if (productState.onboardingStep === 1) return `
    <div class="onboarding-panel">
      <div class="onboarding-copy">
        <p class="product-kicker">Steg 01 · Användning</p>
        <h1>Vad använder ni Excel-filen till?</h1>
        <p>Välj det som ligger närmast. Beskriv sedan processen med egna ord — det styr hur Flowly bygger appen.</p>
      </div>
      <div class="topic-grid">${topics.map((topic) => `<button type="button" class="topic-card ${productState.topic === topic ? 'is-selected' : ''}" data-topic="${topic}"><span>${icon(topic === 'Tidrapportering' ? 'clock' : topic === 'Beställningar' ? 'box' : topic === 'Projektuppföljning' ? 'chart' : topic === 'Kvalitetskontroller' ? 'shield' : 'clipboard', 18)}</span><strong>${topic}</strong><small>${topic === 'Annat' ? 'Beskriv själv' : 'Bygg från en befintlig process'}</small></button>`).join('')}</div>
      <label class="explanation-label">Berätta lite mer<textarea class="custom-topic" placeholder="Till exempel: Vi använder detta för att hålla koll på våra kurser. Vi behöver se kursnamn, lärare, antal elever, startdatum och status.">${escapeHtml(productState.customTopic)}</textarea></label>
      ${productState.onboardingError ? `<p class="form-error">${escapeHtml(productState.onboardingError)}</p>` : ''}
      <button type="button" class="button button-primary onboarding-next" ${productState.topic ? '' : 'disabled'}>Fortsätt till Excel ${icon('arrow', 15)}</button>
    </div>`
  if (productState.onboardingStep === 2) return `
    <div class="onboarding-panel">
      <div class="onboarding-copy">
        <p class="product-kicker">Steg 02 · Excel</p>
        <h1>Ladda upp er Excel-fil</h1>
        <p>Flowly läser struktur, kategorier och beräkningar lokalt. Filen är källan — appen blir arbetsytan.</p>
      </div>
      <label class="product-upload-zone" for="product-file-upload"><input id="product-file-upload" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" /><span class="upload-symbol">${icon('upload', 25)}</span><strong>Släpp din Excel-fil här</strong><small>eller välj fil från datorn</small><em>.xlsx / .xls</em></label>
      <div class="product-upload-result" aria-live="polite"></div>
      <button type="button" class="text-link onboarding-back" data-product-action="back-onboarding">Tillbaka</button>
    </div>`
  if (productState.onboardingStep === 3) return `
    <div class="onboarding-panel">
      <div class="onboarding-copy">
        <p class="product-kicker">Steg 03 · Analys</p>
        <h1>Analyserar din Excel-fil…</h1>
        <p>Flowly läser filen och din beskrivning för att ta fram appens struktur.</p>
      </div>
      <ol class="analysis-steps product-analysis-steps">
        ${analysisStageList.map(([id, label]) => {
          const done = productState.analysisProgress.includes(id)
          const active = !done && analysisStageList.findIndex((item) => !productState.analysisProgress.includes(item[0])) >= 0 && analysisStageList.find((item) => !productState.analysisProgress.includes(item[0]))?.[0] === id
          return `<li class="${done ? 'is-done' : active ? 'is-active' : ''}"><span>${done ? '✓' : active ? '→' : '·'}</span> ${label}</li>`
        }).join('')}
      </ol>
    </div>`
  const spec = productState.spec
  const analysis = productState.analysis
  const extraSheets = (analysis?.sheetNames || []).filter((name) => name !== analysis?.primarySheet)
  const matrix = spec?.experience?.layout === 'period-matrix'
  const groupCount = spec?.experience?.groups.length || 0
  const categoryCount = spec?.experience?.groups.reduce((sum, group) => sum + group.series.filter((item) => item.role === 'data').length, 0) || 0
  const summaryLine = matrix
    ? `Vi hittade <strong>${groupCount} sektioner</strong> och <strong>${categoryCount} kategorier</strong> över ${spec?.experience?.periods.length || 0} perioder i ${escapeHtml(analysis?.fileName || 'Excel-filen')}.`
    : `Vi hittade <strong>${analysis?.rowCount ?? 0} ${escapeHtml(spec?.entityNamePlural || 'rader')}</strong> i ${escapeHtml(analysis?.fileName || 'Excel-filen')}${analysis?.truncated ? ' (visar de första 5 000)' : ''}.`
  return `
    <div class="onboarding-panel onboarding-finished">
      <div class="onboarding-copy">
        <p class="product-kicker">Steg 04 · Skapa app</p>
        <h1>Flowly har förstått din Excel-fil.</h1>
        <p>Kontrollera sammanfattningen innan du skapar appen. Den fylls med de riktiga värdena från filen — inte med påhittad data.</p>
      </div>
      <div class="analysis-summary">
        <p class="product-kicker">Vi tror att din app handlar om</p>
        <h2>${escapeHtml(spec?.understoodAs || productState.topic || 'Ert arbetsflöde')}</h2>
        <p>${summaryLine}</p>
        ${extraSheets.length ? `<p class="sheet-note">Fler ark i filen: ${extraSheets.map(escapeHtml).join(', ')}. MVP:n använder <strong>${escapeHtml(analysis?.primarySheet || '')}</strong>.</p>` : ''}
        <div class="summary-fields">${(spec?.fields || []).map((field) => `<span>${escapeHtml(field.name)}<small>${field.type}</small></span>`).join('')}</div>
        <div class="summary-actions"><p class="product-kicker">Flowly föreslår</p><ul>${(spec?.suggestedActions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      <button type="button" class="button button-primary onboarding-next">Skapa app ${icon('arrow', 15)}</button>
      <button type="button" class="text-link onboarding-back" data-product-action="back-onboarding">Tillbaka till uppladdning</button>
    </div>`
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
  const apps = getOwnedApps()
  return apps.map((app) => `
    <article class="workflow-product-card">
      <div class="workflow-card-top"><span class="card-icon">${icon(topicIcon(app.config.topic || app.name), 16)}</span><span class="status-pill ${app.status === 'active' ? 'active' : 'draft'}">${app.status === 'active' ? 'Aktiv' : 'Utkast'}</span></div>
      <h3>${escapeHtml(app.name)}</h3>
      <p>${escapeHtml(app.description || 'Byggt från Excel')}</p>
      <small>Senast ändrad ${formatRelativeDate(app.updatedAt)}${app.sourceFileName ? ` · ${escapeHtml(app.sourceFileName)}` : ''} · ${app.config.records?.length ?? 0} poster</small>
      <div class="workflow-card-actions">
        <button type="button" class="button button-primary button-small" data-product-action="open-app" data-app-id="${app.id}">Öppna app ${icon('arrow', 14)}</button>
        <button type="button" class="text-link" data-product-action="delete-app" data-app-id="${app.id}">Ta bort</button>
      </div>
    </article>
  `).join('')
}

const appsLoadingView = () => `<div class="workflow-product-grid apps-skeleton" aria-busy="true">${[0, 1, 2].map(() => '<article class="workflow-product-card skeleton-card"><i></i><i></i><i></i></article>').join('')}</div>`

const appsErrorView = () => `<div class="empty-product-state"><span class="empty-state-icon">${icon('shield', 22)}</span><h3>Det gick inte att hämta dina appar.</h3><p>Kontrollera att du är inloggad och försök igen.</p><button type="button" class="button button-primary" data-product-action="retry-apps">Försök igen</button></div>`

const appsEmptyView = () => `<div class="empty-product-state"><span class="empty-state-icon">${icon('upload', 22)}</span><h3>Du har inte skapat någon app ännu.</h3><p>Förvandla din första Excel-fil till en riktig app.</p><button type="button" class="button button-primary" data-product-action="new-workflow">${icon('plus', 14)} Skapa ny app</button></div>`

const projectsView = () => {
  const apps = getOwnedApps()
  const user = currentUserProfile()
  const body = productState.appsStatus === 'loading'
    ? appsLoadingView()
    : productState.appsStatus === 'error'
      ? appsErrorView()
      : apps.length
        ? `<div class="workflow-product-grid">${appCards()}</div>`
        : appsEmptyView()
  return `<div class="product-page"><header class="product-header"><div><p class="product-kicker">Flowly workspace</p><h1>Mina appar</h1><p>${user?.name ? `${escapeHtml(user.name.split(' ')[0])}, hantera dina appar och fortsätt där du slutade.` : 'Hantera dina appar och fortsätt där du slutade.'}</p></div><div class="product-header-actions"><button type="button" class="button button-primary button-small" data-product-action="new-workflow">${icon('plus', 14)} Skapa ny app</button></div></header><div class="product-section-heading"><div><p class="product-kicker">Appar</p><h2>Alla dina appar</h2></div></div>${body}</div>`
}

const appTitle = () => productState.spec?.name || productState.topic || 'Arbetsflöde'

const isMatrixApp = () => productState.spec?.experience?.layout === 'period-matrix'

const quickActionButtons = () => {
  const actions = productState.spec?.experience?.quickActions || []
  if (!actions.length) {
    return `<button type="button" class="button button-primary button-small" data-product-action="new-record">${icon('plus', 14)} Ny ${escapeHtml(productState.spec?.entityName.toLocaleLowerCase('sv-SE') || 'post')}</button>`
  }
  return actions.map((action, index) => `<button type="button" class="${index === 0 ? 'button button-primary button-small' : 'button button-light button-small'}" data-product-action="quick-add" ${action.groupId ? `data-group-id="${escapeHtml(action.groupId)}"` : ''}>${icon('plus', 14)} ${escapeHtml(action.label)}</button>`).join('')
}

const renderExperienceChart = (chart: ExperienceChart) => {
  const spec = productState.spec
  const records = productState.records
  if (!spec) return ''
  if (chart.kind === 'groups-by-period') {
    const insights = insightsFromRecords(records, spec)
    const periods = spec.experience?.periods || []
    const groupIds = chart.groupIds || spec.experience?.groups.map((group) => group.id) || []
    const max = Math.max(1, ...groupIds.flatMap((id) => periods.map((period) => insights.periodTotals[id]?.[period] || 0)))
    return `<section class="flow-card"><div class="flow-card-head"><p class="product-kicker">Över tid</p><h2>${escapeHtml(chart.title)}</h2></div>
      <div class="flow-chart">${periods.map((period) => `<div class="flow-chart-col"><div class="bars">${groupIds.map((id, index) => `<i class="tone-${index}" style="height:${Math.max(2, ((insights.periodTotals[id]?.[period] || 0) / max) * 100)}%"></i>`).join('')}</div><small>${escapeHtml(period)}</small></div>`).join('')}</div>
      <div class="flow-chart-legend">${groupIds.map((id, index) => `<span class="tone-${index}">${escapeHtml(spec.experience?.groups.find((group) => group.id === id)?.title || id)}</span>`).join('')}</div>
    </section>`
  }
  if (chart.kind === 'series-totals') {
    const insights = insightsFromRecords(records, spec)
    const groupId = chart.groupIds?.[0] || spec.experience?.groups[0]?.id || ''
    const rows = Object.entries(insights.categoryTotals[groupId] || {}).sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...rows.map((row) => row[1]))
    if (!rows.length) return `<section class="flow-card"><div class="flow-card-head"><h2>${escapeHtml(chart.title)}</h2></div><div class="quiet-empty">${escapeHtml(spec.experience?.emptyPrompt || 'Ingen data ännu.')}</div></section>`
    return `<section class="flow-card"><div class="flow-card-head"><p class="product-kicker">Fördelning</p><h2>${escapeHtml(chart.title)}</h2></div>
      <div class="flow-bars">${rows.map(([name, value]) => `<div class="flow-bar-row"><span>${escapeHtml(name)}</span><b><i style="width:${Math.max(4, (value / max) * 100)}%"></i></b><em>${escapeHtml(formatMoney(value))}</em></div>`).join('')}</div>
    </section>`
  }
  if (chart.kind === 'status-distribution') {
    const field = spec.statusField
    const options = spec.fields.find((item) => item.key === field)?.options || []
    const rows = options.map((option) => [option, records.filter((record) => record.values[field!] === option).length] as const)
    const max = Math.max(1, ...rows.map((row) => row[1]))
    return `<section class="flow-card"><div class="flow-card-head"><p class="product-kicker">Status</p><h2>${escapeHtml(chart.title)}</h2></div>
      <div class="flow-bars">${rows.map(([name, value]) => `<div class="flow-bar-row"><span>${escapeHtml(name)}</span><b><i style="width:${Math.max(4, (value / max) * 100)}%"></i></b><em>${value}</em></div>`).join('')}</div>
    </section>`
  }
  return ''
}

const activityRow = (record: AppRecord) => {
  const spec = productState.spec
  const amount = record.values.amount || record.values.Belopp || Object.values(record.values)[1] || ''
  const meta = spec?.experience?.layout === 'period-matrix'
    ? `${record.values.period || ''} · ${record.source === 'user' ? 'Tillagd' : 'Från Excel'}`
    : (record.source === 'excel' ? 'Från Excel' : 'Tillagd')
  return `<div class="reports-table-row"><div><strong>${escapeHtml(recordTitle(record, spec))}</strong><small>${escapeHtml(meta)}</small></div><span>${escapeHtml(amount ? (spec?.experience?.layout === 'period-matrix' ? formatMoney(Number(amount) || 0) : amount) : '—')}</span><button type="button" class="text-link" data-product-action="edit-record" data-record-id="${record.id}">Öppna ${icon('arrow', 13)}</button></div>`
}

const dashboardView = () => {
  if (!productState.currentAppId) return projectsView()
  const spec = productState.spec
  const records = productState.records
  const experience = spec?.experience
  const kpis = experience?.kpis?.length
    ? experience.kpis
    : (spec?.metrics || [{ id: 'count', label: 'Poster', kind: 'count' as const }]).map((metric) => ({ ...metric, format: 'number' as const }))
  const recent = recentRecords(records, 8)
  const charts = experience?.charts || []
  const subtitle = spec?.description && spec.description.length > 140 ? spec.description.slice(0, 140) + '…' : (spec?.description || 'Byggt från er Excel-fil och er beskrivning.')
  return `<div class="product-page">${productHeader(appTitle(), subtitle)}
    <div class="understood-banner">
      <strong>${escapeHtml(spec?.understoodAs || 'Flowly har byggt en app från din Excel-fil.')}</strong>
      <span>${isMatrixApp() ? 'Siffrorna räknas om när du lägger till eller tar bort poster.' : `Visar ${records.length} ${spec?.entityNamePlural || 'rader'} från ${escapeHtml(productState.analysis?.fileName || 'Excel-filen')}.`}</span>
    </div>
    <div class="flow-quick-row">${quickActionButtons()}</div>
    <div class="metric-grid metric-grid-${Math.min(kpis.length || 1, 4)}">${kpis.map((kpi) => {
      const value = formatKpiValue(kpi, records, spec)
      const negative = String(value).startsWith('−')
      return `<div class="${negative ? 'is-negative' : ''}"><span class="metric-icon">${icon('chart', 16)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(kpi.label)}</small></div>`
    }).join('')}</div>
    <div class="flow-dashboard-grid">${charts.map(renderExperienceChart).join('')}</div>
    <div class="product-section-heading"><div><p class="product-kicker">Senaste</p><h2>Aktivitet</h2></div>${isMatrixApp() ? '' : `<button type="button" class="button button-primary button-small" data-product-screen="use">Visa alla ${icon('arrow', 14)}</button>`}</div>
    ${recent.length ? `<div class="reports-table"><div class="reports-table-head"><span>${escapeHtml(spec?.entityName || 'Post')}</span><span>Belopp</span><span></span></div>${recent.map(activityRow).join('')}</div>` : `<div class="quiet-empty"><h3>${escapeHtml(experience?.emptyPrompt || 'Inga rader importerades.')}</h3><div class="flow-quick-row">${quickActionButtons()}</div></div>`}
  </div>`
}

const groupView = () => {
  const spec = productState.spec
  const group = spec?.experience?.groups.find((item) => item.id === productState.groupViewId)
  if (!group) return dashboardView()
  const insights = insightsFromRecords(productState.records, spec)
  const extra = {
    group: group.title,
    ...(productState.periodFilter ? { period: productState.periodFilter } : {}),
    ...(productState.categoryFilter ? { category: productState.categoryFilter } : {}),
  }
  const rows = filterRecords(productState.records, productState.recordQuery, undefined, undefined, extra)
  const categories = Object.entries(insights.categoryTotals[group.id] || {}).sort((a, b) => b[1] - a[1])
  const periods = spec?.experience?.periods || []
  const average = group.series.filter((item) => item.role === 'data').length
    ? (insights.groupTotals[group.id] || 0) / Math.max(1, periods.length)
    : 0
  return `<div class="product-page">${productHeader(group.title, `Totalt ${formatMoney(insights.groupTotals[group.id] || 0)} · snitt ${formatMoney(average)} per period.`)}
    <div class="flow-quick-row"><button type="button" class="button button-primary button-small" data-product-action="quick-add" data-group-id="${escapeHtml(group.id)}">${icon('plus', 14)} ${escapeHtml(spec?.experience?.quickActions.find((action) => action.groupId === group.id)?.label || `Lägg till ${group.title}`)}</button></div>
    <div class="flow-filter-chips"><button type="button" class="${productState.periodFilter ? '' : 'is-active'}" data-period-filter="">Alla</button>${periods.map((period) => `<button type="button" class="${productState.periodFilter === period ? 'is-active' : ''}" data-period-filter="${escapeHtml(period)}">${escapeHtml(period)}</button>`).join('')}</div>
    <div class="flow-category-grid">${categories.map(([name, value]) => `<button type="button" class="flow-category-card ${productState.categoryFilter === name ? 'is-active' : ''}" data-category-filter="${escapeHtml(name)}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(formatMoney(value))}</span></button>`).join('') || `<div class="quiet-empty">${escapeHtml(spec?.experience?.emptyPrompt || 'Inget här ännu.')}</div>`}</div>
    <div class="records-toolbar">
      <input type="search" class="records-search" data-record-query placeholder="Sök…" value="${escapeHtml(productState.recordQuery)}" />
    </div>
    ${rows.length ? `<div class="records-table-wrap"><table class="records-table"><thead><tr><th>Kategori</th><th>Period</th><th>Belopp</th><th>Anteckning</th><th></th></tr></thead><tbody>${rows.map((record) => `<tr><td>${escapeHtml(record.values.category || '')}</td><td>${escapeHtml(record.values.period || '')}</td><td>${escapeHtml(formatMoney(Number(record.values.amount || 0)))}</td><td>${escapeHtml(record.values.note || '—')}</td><td class="record-row-actions"><button type="button" class="text-link" data-product-action="edit-record" data-record-id="${record.id}">Redigera</button><button type="button" class="text-link" data-product-action="delete-record" data-record-id="${record.id}">Ta bort</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="quiet-empty"><h3>Inga poster ${productState.periodFilter || productState.categoryFilter ? 'för filtret' : 'ännu'}.</h3><button type="button" class="button button-primary button-small" data-product-action="quick-add" data-group-id="${escapeHtml(group.id)}">${icon('plus', 14)} Lägg till</button></div>`}
  </div>`
}

const reportsView = () => {
  const spec = productState.spec
  const charts = spec?.experience?.charts || []
  return `<div class="product-page">${productHeader('Rapporter', 'Trender och fördelning baserat på dina riktiga poster.')}
    <div class="flow-dashboard-grid">${charts.map(renderExperienceChart).join('') || '<div class="quiet-empty">Inga rapporter behövs för den här appen ännu.</div>'}</div>
  </div>`
}

const reportsTable = () => productState.reports.length ? `<div class="reports-table"><div class="reports-table-head"><span>Rapport</span><span>Status</span><span>Åtgärd</span></div>${productState.reports.map((report) => `<div class="reports-table-row"><div><strong>${escapeHtml(report.values.Namn || report.values.Name || 'Rapport')}</strong><small>${escapeHtml(productState.topic || 'Arbetsflöde')} · ${escapeHtml(report.values.Datum || 'Idag')}</small></div><span class="status-pill ${report.status === 'Godkänd' ? 'active' : report.status === 'Avvisad' ? 'rejected' : 'waiting'}">${report.status}</span><button type="button" class="text-link" data-product-screen="approvals">Öppna ${icon('arrow', 13)}</button></div>`).join('')}</div>` : '<div class="quiet-empty">Inga inskickade rapporter ännu.</div>'

const workflowsView = () => `<div class="product-page">${productHeader('Mina arbetsflöden', 'Bygg, publicera och använd era processer på ett ställe.')}<div class="workflow-product-grid">${appCards()}</div></div>`

const fieldInput = (field: { key?: string; name: string; type: string; required: boolean; options?: string[] }, value: string) => {
  const name = field.key || field.name
  if (field.type === 'date' || field.type === 'Date') return `<input name="${escapeHtml(name)}" type="date" value="${escapeHtml(value)}" ${field.required ? 'required' : ''} />`
  if (field.type === 'number' || field.type === 'Number') return `<input name="${escapeHtml(name)}" type="number" step="any" value="${escapeHtml(value)}" ${field.required ? 'required' : ''} />`
  if ((field.type === 'select' || field.type === 'Status') && field.options?.length) {
    return `<select name="${escapeHtml(name)}" ${field.required ? 'required' : ''}><option value="">Välj</option>${field.options.map((option) => `<option ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>`
  }
  return `<input name="${escapeHtml(name)}" type="text" value="${escapeHtml(value)}" ${field.required ? 'required' : ''} />`
}

const recordEditor = () => {
  const spec = productState.spec
  const group = spec?.experience?.groups.find((item) => item.id === productState.draftDefaults.group || item.title === productState.draftDefaults.group)
  const fields = (spec?.fields || productState.fields.map((field) => ({ key: field.name, name: field.name, type: field.type.toLowerCase(), required: field.required, options: undefined as string[] | undefined }))).map((field) => {
    if (field.key === 'category' && group) {
      return { ...field, options: group.series.filter((item) => item.role === 'data').map((item) => item.name) }
    }
    return field
  })
  const existing = productState.editingRecordId && productState.editingRecordId !== 'new'
    ? productState.records.find((record) => record.id === productState.editingRecordId)
    : undefined
  const values = { ...productState.draftDefaults, ...(existing?.values || {}) }
  return `<form class="record-form">${fields.map((field) => `<label>${escapeHtml(field.name)}${fieldInput(field, values[field.key || field.name] || '')}</label>`).join('')}<p class="form-error" aria-live="polite"></p><div class="record-form-actions"><button type="submit" class="button button-primary">Spara ${icon('arrow', 15)}</button><button type="button" class="button button-light" data-product-action="close-record">Avbryt</button></div></form>`
}

const useWorkflowView = () => {
  const spec = productState.spec
  const statusField = spec?.statusField
  const statusOptions = spec?.fields.find((field) => field.key === statusField)?.options || []
  const rows = filterRecords(productState.records, productState.recordQuery, statusField, productState.recordFilter || undefined)
  const columns = (spec?.fields || []).slice(0, 6)
  if (productState.editingRecordId) {
    return `<div class="product-page use-page">${productHeader(productState.editingRecordId === 'new' ? `Ny ${spec?.entityName || 'post'}` : 'Redigera', spec?.description || '')}<div class="use-form-card record-editor-card"><div class="use-form-heading"><h2>${productState.editingRecordId === 'new' ? `Ny ${escapeHtml(spec?.entityName.toLocaleLowerCase('sv-SE') || 'post')}` : 'Redigera'}</h2></div>${recordEditor()}</div></div>`
  }
  return `<div class="product-page use-page">${productHeader(spec ? spec.entityNamePlural[0].toUpperCase() + spec.entityNamePlural.slice(1) : 'Poster', `Visar ${rows.length} av ${productState.records.length} ${spec?.entityNamePlural || 'rader'} från Excel.`)}
    <div class="records-toolbar">
      <input type="search" class="records-search" data-record-query placeholder="Sök…" value="${escapeHtml(productState.recordQuery)}" />
      ${statusField && statusOptions.length ? `<select data-record-filter><option value="">Alla</option>${statusOptions.map((option) => `<option ${productState.recordFilter === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>` : ''}
      <button type="button" class="button button-primary button-small" data-product-action="new-record">${icon('plus', 14)} Ny ${escapeHtml(spec?.entityName.toLocaleLowerCase('sv-SE') || 'post')}</button>
    </div>
    ${rows.length ? `<div class="records-table-wrap"><table class="records-table"><thead><tr>${columns.map((field) => `<th>${escapeHtml(field.name)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((record) => `<tr>${columns.map((field) => `<td>${escapeHtml(record.values[field.key] || '—')}</td>`).join('')}<td class="record-row-actions"><button type="button" class="text-link" data-product-action="edit-record" data-record-id="${record.id}">Redigera</button><button type="button" class="text-link" data-product-action="delete-record" data-record-id="${record.id}">Ta bort</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="quiet-empty">Inga poster matchar sökningen.</div>'}
  </div>`
}

const approvalRows = () => {
  const spec = productState.spec
  const statusField = spec?.statusField
  return productState.records.map((record) => {
    const status = statusField ? record.values[statusField] || '—' : '—'
    const waiting = /väntar|vant|öppen|oppen|pågående|pagaende|ny|planerad|granskas/i.test(status)
    const actions = waiting && statusField
      ? `<button type="button" class="approve-row" data-record-status="Godkänd" data-record-id="${record.id}">Godkänn</button><button type="button" class="reject-row" data-record-status="Avvisad" data-record-id="${record.id}">Avvisa</button>`
      : '<small>Inga åtgärder</small>'
    return `<article class="approval-product-card"><div class="approval-person"><span class="preview-avatar">${escapeHtml(recordTitle(record, spec).slice(0, 2).toUpperCase())}</span><div><strong>${escapeHtml(recordTitle(record, spec))}</strong><small>${escapeHtml(appTitle())}</small></div></div><span class="status-pill ${/godk|klar|avslut/i.test(status) ? 'active' : /avvis|avvik/i.test(status) ? 'rejected' : 'waiting'}">${escapeHtml(status)}</span><div class="approval-actions-product">${actions}</div></article>`
  }).join('')
}

const approvalsView = () => {
  const spec = productState.spec
  const empty = '<div class="empty-product-state"><span class="empty-state-icon">✓</span><h3>Inget väntar just nu</h3><p>När statusfältet används visas posterna här.</p></div>'
  return `<div class="product-page">${productHeader('Godkännanden', spec?.features.includes('approvals') ? 'Granska poster som väntar på nästa steg.' : 'Den här appen använder inte ett godkännandeflöde.')}<div class="product-section-heading"><div><p class="product-kicker">Inkorg</p><h2>${escapeHtml(spec?.entityNamePlural || 'Poster')}</h2></div><button type="button" class="button button-light button-small" data-product-action="export">Exportera till Excel</button></div><div class="approval-list">${productState.records.length ? approvalRows() : empty}</div></div>`
}

const teamView = () => `<div class="product-page">${productHeader('Team', 'Samarbete i appen kommer i nästa steg.')}<div class="empty-product-state"><span class="empty-state-icon">${icon('users', 22)}</span><h3>Kommer snart</h3><p>Team, inbjudningar och roller är inte en del av den här MVP:n. Appen tillhör just nu ditt konto.</p></div></div>`

const settingsView = () => `<div class="product-page">${productHeader('Inställningar', 'Grundläggande inställningar för ert workspace.')}<section class="settings-card"><p class="product-kicker">Workspace</p><h2>${escapeHtml(productState.workspaceName)}</h2><p>Inloggad som ${escapeHtml(productState.userName)}.</p></section></div>`

const productContent = () => {
  if (productState.screen === 'projects') return projectsView()
  if (productState.screen === 'builder') return builderView()
  if (productState.screen === 'use') return useWorkflowView()
  if (productState.screen === 'group') return groupView()
  if (productState.screen === 'reports') return reportsView()
  if (productState.screen === 'approvals') return approvalsView()
  if (productState.screen === 'workflows') return workflowsView()
  if (productState.screen === 'team') return teamView()
  if (productState.screen === 'settings') return settingsView()
  return dashboardView()
}

const productShell = () => productState.screen === 'onboarding' ? `<div class="onboarding-shell"><div class="onboarding-top"><button type="button" class="brand" data-product-action="back-to-apps">${flowMark()}Flowly</button><div class="onboarding-top-actions"><button type="button" class="text-link" data-product-action="back-to-apps">${icon('arrow', 14)} Mina appar</button><button type="button" class="text-link" data-product-action="logout">Logga ut</button></div></div>${onboardingSteps()}${onboardingView()}</div>` : `<div class="product-shell">${productSidebar()}<main class="product-main">${productContent()}</main></div>`

const steps = () => `
  <section class="lp-section lp-how" id="process">
    <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Så fungerar det</p>
        <h2>Tre steg. <em>Ett arbetsflöde.</em></h2>
        <p class="lp-lead">Börja med filen ni redan använder. Flowly gör den till något teamet faktiskt kan arbeta i.</p>
      </div>
      <div class="lp-steps">
        <article class="lp-step reveal" id="upload">
          <div>
            <span class="lp-step-num">01</span>
            <h3>Ladda upp er Excel-fil</h3>
            <p>Visa oss filen som processen redan lever i. Flowly läser kolumner, rader och struktur lokalt i webbläsaren.</p>
            <label class="upload-zone" for="file-upload">
              <input id="file-upload" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
              <span class="upload-symbol">${icon('upload', 22)}</span>
              <strong class="upload-label">Släpp din Excel-fil här</strong>
              <small>eller välj fil från datorn · .xlsx eller .xls</small>
            </label>
          </div>
          <div class="lp-step-visual">
            <div class="lp-ui">
              ${lpChrome('tidrapportering.xlsx')}
              <div class="lp-ui-body">${excelGrid()}</div>
            </div>
          </div>
        </article>
        <article class="lp-step reveal">
          <div>
            <span class="lp-step-num">02</span>
            <h3>Bygg ert arbetsflöde</h3>
            <p>Beskriv hur filen används idag. Flowly föreslår formulär, roller och godkännandesteg som ni kan justera.</p>
          </div>
          <div class="lp-step-visual">${workflowMock()}</div>
        </article>
        <article class="lp-step reveal">
          <div>
            <span class="lp-step-num">03</span>
            <h3>Börja använda er app</h3>
            <p>Teamet fyller i, chefer godkänner och ni ser statusen utan att öppna Excel. Exporten finns kvar när ni behöver den.</p>
          </div>
          <div class="lp-step-visual">${dashMock()}</div>
        </article>
      </div>
      ${uploadResult()}
    </div>
  </section>
`

const dashboard = () => `
  <section class="lp-show">
    <div class="lp-wrap lp-split">
      <div class="lp-copy reveal">
        <p class="lp-kicker">Formulär</p>
        <h2>Ett formulär som <em>faktiskt fungerar.</em></h2>
        <p class="lp-lead">Förvandla manuella Excel-rader till tydliga formulär som teamet faktiskt kan använda.</p>
      </div>
      <div class="reveal">${formMock()}</div>
    </div>
  </section>
  <section class="lp-show lp-show-alt">
    <div class="lp-wrap lp-split reverse">
      <div class="reveal">${dashMock()}</div>
      <div class="lp-copy reveal">
        <p class="lp-kicker">Dashboard</p>
        <h2>Allt på <em>ett ställe.</em></h2>
        <p class="lp-lead">Status, uppgifter, inskickningar, statistik och senaste aktivitet — utan att öppna en ny fil.</p>
      </div>
    </div>
  </section>
  <section class="lp-show">
    <div class="lp-wrap lp-split">
      <div class="lp-copy reveal">
        <p class="lp-kicker">Godkännanden</p>
        <h2>Godkännanden utan <em>mejltrådar.</em></h2>
        <p class="lp-lead">Skickad, granskas, godkänd. Rätt person ser rätt sak, och ni slipper jaga signaturer i inkorgen.</p>
      </div>
      <div class="reveal">${approvalMock()}</div>
    </div>
  </section>
  <section class="lp-show lp-show-alt">
    <div class="lp-wrap lp-split reverse">
      <div class="reveal">${activityMock()}</div>
      <div class="lp-copy reveal">
        <p class="lp-kicker">Synlighet</p>
        <h2>Alla vet <em>vad som händer.</em></h2>
        <p class="lp-lead">En gemensam bild av processen. Vem som skickat, vem som väntar och vad som redan är klart.</p>
      </div>
    </div>
  </section>
  <section class="story-section product-section band-dark lp-product-frame">
    <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Produkten</p>
        <h2>Så ser arbetsdagen ut i <em>Flowly.</em></h2>
      </div>
    </div>
    <div class="product-frame reveal" id="product-demo">
      <div class="frame-bar">
        <span class="frame-url">app.flowly.se / nordmark / godkännanden</span>
        <span class="frame-meta">${icon('search', 13)} ${icon('bell', 13)}</span>
      </div>
      <div class="dashboard-shell">
        <aside class="dashboard-sidebar">
          <div class="dash-brand">${flowMark()} Flowly</div>
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
          <div class="dash-mobile-top"><span class="mini-brand">${flowMark('sm')} Flowly</span>${av('AA', 'peach')}</div>
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
    ['clock', 'Tidrapportering', 'Byt ut manuella tidrapporter mot ett enkelt arbetsflöde.', 'timesheet'],
    ['box', 'Orderhantering', 'Samla order, status och uppföljning på ett ställe.', 'orders'],
    ['shield', 'Kvalitetskontroller', 'Digitalisera checklistor och kontroller.', 'quality'],
    ['layers', 'Avvikelser', 'Registrera, hantera och följa upp avvikelser.', 'deviation'],
    ['chart', 'Projektuppföljning', 'Samla projektdata och status utan flera Excel-filer.', 'project'],
    ['clipboard', 'Interna checklistor', 'Gör återkommande processer enkla att följa.', 'checks'],
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
    <section class="lp-section lp-usecases" id="anvandning">
      <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Användningsområden</p>
        <h2>Vad kan ni bygga med <em>Flowly?</em></h2>
        <p class="lp-lead">Samma produkt. Olika processer. Börja med det arbetsflöde som skapar mest manuellt arbete.</p>
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
      </div>
    </section>
  `
}

const integration = () => `
  <section class="lp-break">
    <div class="lp-wrap lp-split">
      <div class="reveal">
        <p class="lp-kicker">Börja litet</p>
        <h2>Ni behöver inte byta allt.<br />Börja med en enda Excel-fil.</h2>
        <p>Flowly är inte ett nytt ERP-system. Det är ett enklare lager för de processer som idag hamnar mellan Excel, mejl och era befintliga system.</p>
      </div>
      <div class="reveal">${formMock()}</div>
    </div>
  </section>
  <section class="lp-section">
    <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Funktioner</p>
        <h2>Det ni behöver. <em>Inget mer.</em></h2>
      </div>
      <div class="lp-feature-grid">
        ${[
          ['file', 'Excel → App', 'Börja med det ni redan använder.'],
          ['clipboard', 'Anpassade formulär', 'Skapa formulär för exakt ert arbetsflöde.'],
          ['users', 'Roller & användare', 'Alla får rätt åtkomst.'],
          ['check', 'Godkännanden', 'Skapa tydliga steg i processen.'],
          ['chart', 'Dashboard', 'Se vad som händer utan att öppna Excel.'],
          ['upload', 'Export', 'Behåll möjligheten att arbeta vidare med data.'],
        ].map(([ic, title, body]) => `<article class="lp-card reveal"><span class="lp-feat-icon">${icon(ic as IconName, 18)}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}
      </div>
    </div>
  </section>
  <section class="lp-proof">
    <div class="lp-wrap">
      <div class="lp-proof-box reveal">
        <p class="lp-kicker">Tidigt skede</p>
        <h2>Byggt för företag som fortfarande lever i Excel.</h2>
        <p>Flowly formas kring riktiga arbetsflöden — tidrapporter, kontroller, ordrar och uppföljning som idag sköts i kalkylark. Inga påhittade kundcase. Bara produkten, så långt den faktiskt finns.</p>
      </div>
    </div>
  </section>
`

const pricing = () => `
  <section class="lp-section lp-pricing" id="priser">
    <div class="lp-wrap">
    <div class="lp-intro reveal">
      <p class="lp-kicker">Priser</p>
      <h2>Växla upp när <em>ni är redo.</em></h2>
      <p class="lp-lead">Börja litet. Bygg vidare när processen växer.</p>
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
      <a class="button button-primary" href="#cta">Kom igång gratis ${icon('arrow', 16)}</a>
    </div>
    </div>
  </section>
`

const roles = () => ''

const faq = () => `
  <section class="lp-section lp-faq" id="faq">
    <div class="lp-wrap">
      <div class="lp-intro reveal">
        <p class="lp-kicker">Frågor</p>
        <h2>Det ni undrar <em>innan ni börjar.</em></h2>
      </div>
      <div class="faq-list reveal">
        ${[
          ['Måste vi sluta använda Excel?', 'Nej. Flowly börjar med de Excel-filer ni redan använder. Ni kan fortsätta exportera tillbaka när ni behöver.'],
          ['Behöver vi byta vårt nuvarande system?', 'Nej. Flowly är inte ett nytt ERP-system. Det är ett lager för de manuella processerna som idag hamnar mellan Excel, mejl och era befintliga system.'],
          ['Kan vi börja med en enda process?', 'Ja. Det är det tänkta sättet. Välj det arbetsflöde som skapar mest manuellt arbete och börja där.'],
          ['Kan flera personer använda samma app?', 'Ja. Olika personer kan ha olika roller — till exempel fylla i, godkänna eller exportera.'],
          ['Vad händer med vår befintliga Excel-fil?', 'Ni laddar upp den så att Flowly kan läsa kolumner och struktur. Filen blir utgångspunkten för formulär och arbetsflöde, inte något ni måste slänga.'],
          ['Kan vi exportera data tillbaka till Excel?', 'Ja. I MVP:n kan godkända underlag exporteras tillbaka till Excel när ni behöver arbeta vidare i filen eller skicka den vidare.'],
        ].map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join('')}
      </div>
    </div>
  </section>
`

const cta = () => `
  <section class="final-cta" id="cta">
    <div class="lp-wrap cta-inner reveal">
      <div class="lp-cta-copy">
        <p class="lp-kicker">Nästa steg</p>
        <h2>Har ni en Excel-fil som borde vara en app?</h2>
        <p>Ladda upp den och börja bygga ert arbetsflöde med Flowly.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#cta">Kom igång gratis ${icon('arrow', 16)}</a>
          <a class="button button-ghost lp-ghost-light" href="#/sa-fungerar-det">Se hur det fungerar</a>
        </div>
      </div>
      <div class="lp-cta-visual">${dashMock()}</div>
    </div>
  </section>
`

const pageHead = (kicker: string, title: string, lead: string) => `
  <section class="lp-pagehead">
    <div class="lp-wrap">
      <p class="lp-kicker">${kicker}</p>
      <h1>${title}</h1>
      <p class="lp-lead">${lead}</p>
    </div>
  </section>
`

const homeMain = () => `${hero()}${liveDemoShell()}${valueStrip()}${chaos()}${transform()}${dashboard()}${useCases()}${integration()}${cta()}`
const howMain = () => `${pageHead('Så fungerar det', 'Från Excel-fil till arbetsapp.', 'Tre steg. Ett arbetsflöde som teamet faktiskt kan använda.')}${steps()}${cta()}`
const pricingMain = () => `${pageHead('Priser', 'Växla upp när ni är redo.', 'Börja litet. Bygg vidare när processen växer.')}${pricing()}${cta()}`
const faqMain = () => `${pageHead('FAQ', 'Det ni undrar innan ni börjar.', 'Korta svar på de vanligaste frågorna om Flowly.')}${faq()}${cta()}`

const marketingMain = () => {
  const route = parseRoute()
  if (route.name === 'how') return howMain()
  if (route.name === 'pricing') return pricingMain()
  if (route.name === 'faq') return faqMain()
  return homeMain()
}

const footer = () => `
  <footer class="site-footer">
    <div class="footer-top">
      <a class="brand" href="#/">${flowMark()}<span class="brand-word">Flowly</span></a>
      <nav class="footer-links" aria-label="Sidfot">
        <a href="#/">Produkt</a>
        <a href="#/sa-fungerar-det">Så fungerar det</a>
        <a href="#/anvandning">Användningsområden</a>
        <a href="#/priser">Priser</a>
        <a href="#/faq">FAQ</a>
        <a href="#login">Logga in</a>
        <a href="#cta">Kom igång</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Flowly</span>
      <span>Från Excel till arbetsapp</span>
    </div>
  </footer>
`

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `${header()}${pageAtmosphere()}<main>${marketingMain()}</main>${footer()}`
app.insertAdjacentHTML('beforeend', authModal())

const authOverlay = () => document.querySelector<HTMLElement>('#auth-overlay')
let bindMarketingPage = () => {}

const headerOffset = () => (document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 72) + 16

const scrollMarketing = (focus?: string) => {
  const top = (() => {
    if (!focus) return 0
    const el = document.getElementById(focus)
    if (!el) return 0
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset())
  })()
  window.scrollTo({ top, behavior: 'instant' })
}

const renderLanding = () => {
  document.body.classList.remove('is-product-mode')
  app.innerHTML = `${header()}${pageAtmosphere()}<main>${marketingMain()}</main>${footer()}`
  app.insertAdjacentHTML('beforeend', authModal())
  bindMarketingPage()
  const route = parseRoute()
  document.title = pageTitle(route)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    scrollMarketing(route.name === 'home' ? route.focus : undefined)
  }))
}

const renderProduct = () => {
  const currentUser = currentUserProfile()
  if (!currentUser) {
    renderLanding()
    return
  }

  const workspace = currentWorkspaceProfile() || ensureCurrentWorkspace(currentUser)
  productState.userName = currentUser.name
  productState.workspaceName = workspace.name
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
  const confirmField = overlay.querySelector<HTMLElement>('.confirm-field')
  const submit = overlay.querySelector<HTMLButtonElement>('[data-auth-submit]')
  const forgot = overlay.querySelector<HTMLElement>('.forgot-link')
  if (title) title.textContent = mode === 'signup' ? 'Skapa ditt Flowly-konto' : 'Logga in i Flowly'
  if (description) description.textContent = mode === 'signup' ? 'Skapa ett gratis konto och bygg ert första arbetsflöde.' : 'Fortsätt där ni slutade och öppna ert workspace.'
  if (nameField) {
    nameField.hidden = mode === 'login'
    nameField.querySelector('input')?.toggleAttribute('required', mode === 'signup')
  }
  if (confirmField) {
    confirmField.hidden = mode === 'login'
    confirmField.querySelector('input')?.toggleAttribute('required', mode === 'signup')
  }
  if (submit) submit.innerHTML = `${mode === 'signup' ? 'Skapa konto' : 'Logga in'} ${icon('arrow', 15)}`
  if (forgot) forgot.hidden = mode === 'signup'
}

const closeAuth = () => { const overlay = authOverlay(); if (overlay) overlay.hidden = true }

const showAppsDashboard = () => {
  resetWorkspaceHomeState()
  productState.screen = 'projects'
  productState.appsStatus = 'ready'
  setAppHash('/apps')
  renderProduct()
}

const beginOnboarding = () => {
  resetWorkspaceHomeState()
  productState.screen = 'onboarding'
  productState.onboardingStep = 1
  setAppHash('/apps/new')
  closeAuth()
  renderProduct()
}

const openUserApp = (appId: string, screen: ProductState['screen'] = 'dashboard') => {
  const app = getOwnedApp(appId)
  if (!app) {
    console.error('Flowly: kunde inte öppna appen. Fel user eller saknad app.', { appId, userId: getCurrentUser()?.id })
    showAppsDashboard()
    return
  }
  loadAppIntoState(app)
  productState.screen = screen === 'projects' || screen === 'onboarding' ? 'dashboard' : screen
  setAppHash(`/apps/${app.id}`)
  renderProduct()
}

const deleteUserApp = (appId: string) => {
  const app = getOwnedApp(appId)
  if (!app) {
    console.error('Flowly: kunde inte ta bort appen. Fel user eller saknad app.', { appId, userId: getCurrentUser()?.id })
    return
  }
  if (!window.confirm(`Är du säker på att du vill ta bort ${app.name}?\n\nDetta går inte att ångra.`)) return
  updateStore((store) => {
    store.apps = store.apps.filter((entry) => entry.id !== appId || entry.ownerId !== getCurrentUser()?.id)
  })
  if (productState.currentAppId === appId) resetWorkspaceHomeState()
  showAppsDashboard()
}

const loadUserApps = () => {
  const user = getCurrentUser()
  if (!user) {
    productState.appsStatus = 'error'
    return []
  }
  try {
    productState.appsStatus = 'loading'
    ensureCurrentWorkspace(user)
    const apps = getOwnedApps()
    productState.appsStatus = 'ready'
    return apps
  } catch (error) {
    console.error('Flowly: det gick inte att hämta appar.', error)
    productState.appsStatus = 'error'
    return []
  }
}

const applyAuthenticatedRoute = () => {
  const user = getCurrentUser()
  if (!user) {
    renderLanding()
    return
  }
  productState.authReady = true
  productState.userName = user.name
  const workspace = ensureCurrentWorkspace(user)
  productState.workspaceName = workspace.name
  loadUserApps()

  const route = parseRoute()
  if (isMarketingPage(route) || (route.name === 'home' && route.focus)) {
    renderLanding()
    return
  }
  if (route.name === 'new') {
    if (productState.screen !== 'onboarding') {
      resetWorkspaceHomeState()
      productState.screen = 'onboarding'
      productState.onboardingStep = 1
    }
    renderProduct()
    return
  }
  if (route.name === 'app') {
    const app = getOwnedApp(route.id)
    if (!app) {
      console.error('Flowly: appen tillhör inte den inloggade användaren.', { appId: route.id, userId: user.id })
      showAppsDashboard()
      return
    }
    loadAppIntoState(app)
    if (productState.screen === 'projects' || productState.screen === 'onboarding') productState.screen = 'dashboard'
    renderProduct()
    return
  }
  showAppsDashboard()
}

const enterAuthenticatedWorkspace = () => {
  productState.authReady = true
  loadUserApps()
  showAppsDashboard()
}

const handleProductFile = async (file: File | undefined) => {
  if (!file) return
  productState.onboardingStep = 3
  productState.analysisProgress = []
  renderProduct()
  const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  try {
    productState.analysisProgress = ['file']
    renderProduct()
    await paint()
    const analysis = await parseWorkbook(file, productState.customTopic)
    productState.analysis = analysis
    productState.analysisProgress = ['file', 'columns', 'types']
    renderProduct()
    await paint()
    productState.analysisProgress = ['file', 'columns', 'types', 'explanation']
    renderProduct()
    await paint()
    const spec = generateAppSpec({
      useCase: productState.topic,
      explanation: productState.customTopic,
      analysis,
    })
    productState.spec = spec
    productState.fields = specToWorkflowFields(spec)
    productState.records = recordsFromAnalysis(analysis, makeId, spec)
    productState.analysisProgress = ['file', 'columns', 'types', 'explanation', 'workflow', 'ready']
    renderProduct()
    await paint()
    productState.onboardingStep = 4
    productState.published = true
    renderProduct()
  } catch (error) {
    const copy = excelErrorCopy(error)
    productState.onboardingStep = 2
    renderProduct()
    const result = document.querySelector<HTMLElement>('.product-upload-result')
    if (result) result.innerHTML = renderAnalysisError(copy.title, copy.message)
  }
}

const exportReports = () => {
  const spec = productState.spec
  const rows = productState.records.map((record) => record.values)
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'Inga poster ännu' }])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, (spec?.entityNamePlural || productState.topic || 'Flowly').slice(0, 31))
  XLSX.writeFile(book, `${(spec?.name || productState.topic || 'flowly-app').toLocaleLowerCase('sv-SE').replace(/\s+/g, '-')}.xlsx`)
}

let liveDemoView: DemoView = 'overview'
let liveDemoSelected = 'erik'
const paintLiveDemo = () => {
  const liveDemoRoot = document.querySelector<HTMLElement>('#live-demo')
  if (!liveDemoRoot) return
  liveDemoRoot.dataset.demoView = liveDemoView
  liveDemoRoot.innerHTML = renderLiveDemoView(liveDemoView, liveDemoSelected)
}
const showDemoLock = (action: string) => {
  const messages: Record<string, string> = {
    add: 'Detta är en demo. Ni kan inte lägga till rapporter här.',
    approve: 'Detta är en demo. Godkännanden sparas inte.',
    invite: 'Detta är en demo. Ni kan inte bjuda in användare här.',
    edit: 'Detta är en demo. Fälten är skrivskyddade.',
  }
  document.querySelector('.lp-demo-toast')?.remove()
  const toast = document.createElement('div')
  toast.className = 'lp-demo-toast'
  toast.setAttribute('role', 'status')
  toast.textContent = messages[action] || 'Detta är en demo. Inget sparas.'
  document.body.append(toast)
  window.setTimeout(() => toast.remove(), 3200)
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const cta = target.closest<HTMLAnchorElement>('a[href="#cta"], a[href="#login"]')
  if (cta) {
    event.preventDefault()
    openAuth(cta.getAttribute('href') === '#login' ? 'login' : 'signup')
  }
  if (target.closest('.auth-close')) closeAuth()
  const authTab = target.closest<HTMLButtonElement>('[data-auth-mode]')
  if (authTab) openAuth((authTab.dataset.authMode as 'signup' | 'login') || 'signup')
  if (!target.closest('#live-demo')) return
  const viewBtn = target.closest<HTMLButtonElement>('[data-demo-view]')
  if (viewBtn?.dataset.demoView) {
    liveDemoView = viewBtn.dataset.demoView as DemoView
    paintLiveDemo()
    return
  }
  const openBtn = target.closest<HTMLButtonElement>('[data-demo-open]')
  if (openBtn?.dataset.demoOpen) {
    liveDemoSelected = openBtn.dataset.demoOpen
    if (liveDemoView === 'overview') liveDemoView = 'inbox'
    paintLiveDemo()
    return
  }
  const locked = target.closest<HTMLButtonElement>('[data-demo-locked]')
  if (locked) {
    event.preventDefault()
    showDemoLock(locked.dataset.demoLocked || 'edit')
  }
})

document.addEventListener('submit', async (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement) || !form.matches('[data-auth-form]')) return
  event.preventDefault()
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
    updateStore((next) => {
      next.users.push(user)
      next.session.userId = user.id
    })
    ensureCurrentWorkspace(user)
    closeAuth()
    enterAuthenticatedWorkspace()
    return
  }

  if (!emailRegex.test(email)) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  const store = readFlowlyStore()
  const user = store.users.find((entry) => entry.email.toLowerCase() === email)
  if (!user) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  const passwordHash = await hashPassword(password)
  if (user.passwordHash !== passwordHash) { if (error) error.textContent = 'Fel email eller lösenord.'; return }
  setSessionUser(user.id)
  ensureCurrentWorkspace(user)
  closeAuth()
  enterAuthenticatedWorkspace()
})

app.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  if (target.id === 'product-file-upload' && target instanceof HTMLInputElement) void handleProductFile(target.files?.[0])
  if (target.matches('[data-approval="approver"]')) { productState.approver = target.value; if (productState.currentAppId) saveCurrentWorkflow() }
  if (target.matches('input[name="after-approval"]')) { productState.afterApproval = target.value; if (productState.currentAppId) saveCurrentWorkflow() }
  if (target.matches('[data-record-filter]')) {
    productState.recordFilter = target.value
    renderProduct()
  }
})

app.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement
  if (!target.matches('[data-record-query]')) return
  productState.recordQuery = target.value
  const start = target.selectionStart
  renderProduct()
  const input = document.querySelector<HTMLInputElement>('[data-record-query]')
  input?.focus()
  if (typeof start === 'number') input?.setSelectionRange(start, start)
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
  if (!form.matches('.record-form')) return
  event.preventDefault()
  if (!form.checkValidity()) {
    form.querySelector<HTMLElement>('.form-error')!.textContent = 'Fyll i alla obligatoriska fält.'
    form.reportValidity()
    return
  }
  const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
  const now = new Date().toISOString()
  if (productState.editingRecordId && productState.editingRecordId !== 'new') {
    const record = productState.records.find((item) => item.id === productState.editingRecordId)
    if (record) {
      record.values = values
      record.updatedAt = now
    }
  } else {
    productState.records.push({ id: makeId(), values, createdAt: now, updatedAt: now, source: 'user' })
  }
  productState.editingRecordId = null
  productState.draftDefaults = {}
  if (isMatrixApp()) {
    productState.screen = productState.groupViewId ? 'group' : 'dashboard'
  }
  saveCurrentWorkflow()
  renderProduct()
})

app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const actionButton = target.closest<HTMLElement>('[data-product-action]')
  const action = actionButton?.dataset.productAction
  if (actionButton instanceof HTMLAnchorElement) event.preventDefault()
  const screenButton = target.closest<HTMLElement>('[data-product-screen]')
  if (screenButton) {
    const nextScreen = screenButton.dataset.productScreen as ProductState['screen']
    if (nextScreen === 'projects') { showAppsDashboard(); return }
    if (nextScreen === 'settings' || productState.currentAppId) {
      productState.screen = nextScreen
      productState.groupViewId = screenButton.dataset.groupId || ''
      productState.editingRecordId = null
      productState.categoryFilter = ''
      productState.periodFilter = ''
      if (productState.currentAppId) setAppHash(`/apps/${productState.currentAppId}`)
      renderProduct()
    }
    return
  }
  const topic = target.closest<HTMLElement>('[data-topic]')
  if (topic) {
    productState.customTopic = document.querySelector<HTMLTextAreaElement>('.custom-topic')?.value ?? productState.customTopic
    productState.topic = topic.dataset.topic || ''
    productState.onboardingError = ''
    renderProduct()
    return
  }
  if (target.closest('.onboarding-next')) {
    if (productState.onboardingStep === 1) {
      productState.customTopic = document.querySelector<HTMLTextAreaElement>('.custom-topic')?.value.trim() || ''
      if (!productState.customTopic) {
        productState.onboardingError = 'Berätta kort vad ni använder Excel-filen till. Det styr hur appen byggs.'
        renderProduct()
        return
      }
      productState.onboardingError = ''
      productState.onboardingStep = 2
      renderProduct()
    } else if (productState.onboardingStep === 4) {
      const created = saveCurrentWorkflow()
      productState.screen = 'dashboard'
      if (created) setAppHash(`/apps/${created.id}`)
      renderProduct()
    }
    return
  }
  const field = target.closest<HTMLElement>('[data-field-index]')
  if (field) { productState.selectedField = Number(field.dataset.fieldIndex); renderProduct(); return }
  const builderTab = target.closest<HTMLElement>('[data-builder-tab]')
  if (builderTab) { productState.builderTab = (builderTab.dataset.builderTab as ProductState['builderTab']) || 'form'; saveCurrentWorkflow(); renderProduct(); return }
  if (action === 'back-onboarding') {
    productState.onboardingStep = productState.onboardingStep === 4 ? 2 : 1
    renderProduct()
    return
  }
  if (action === 'back-to-apps') { showAppsDashboard(); return }
  if (action === 'retry-apps') { loadUserApps(); renderProduct(); return }
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
    if (selected && nameInput && typeInput) {
      selected.name = nameInput.value.trim() || selected.name
      selected.type = typeInput.value
      const specField = productState.spec?.fields[productState.selectedField]
      if (specField) specField.name = selected.name
      if (productState.currentAppId) saveCurrentWorkflow()
      renderProduct()
    }
    return
  }
  if (action === 'preview') { productState.screen = 'use'; if (productState.currentAppId) saveCurrentWorkflow(); renderProduct(); return }
  if (target.closest('[data-toggle-required]')) { const selected = productState.fields[productState.selectedField]; if (selected) { selected.required = !selected.required; if (productState.currentAppId) saveCurrentWorkflow(); renderProduct() } return }
  if (action === 'remove-field') { productState.fields.splice(productState.selectedField, 1); productState.selectedField = Math.max(0, productState.selectedField - 1); if (productState.currentAppId) saveCurrentWorkflow(); renderProduct(); return }
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
  if (action === 'invite') {
    window.alert('Team och inbjudningar kommer snart.')
    return
  }
  if (action === 'new-record') { productState.screen = 'use'; productState.editingRecordId = 'new'; productState.draftDefaults = {}; renderProduct(); return }
  if (action === 'quick-add') {
    const groupId = actionButton?.dataset.groupId || ''
    const group = productState.spec?.experience?.groups.find((item) => item.id === groupId)
    productState.draftDefaults = {
      group: group?.title || '',
      period: (productState.spec?.experience?.periods || []).includes(currentPeriodKey()) ? currentPeriodKey() : (productState.spec?.experience?.periods[0] || ''),
    }
    if (groupId) productState.groupViewId = groupId
    productState.screen = 'use'
    productState.editingRecordId = 'new'
    renderProduct()
    return
  }
  const periodChip = target.closest<HTMLElement>('[data-period-filter]')
  if (periodChip) {
    productState.periodFilter = periodChip.dataset.periodFilter || ''
    renderProduct()
    return
  }
  const categoryChip = target.closest<HTMLElement>('[data-category-filter]')
  if (categoryChip) {
    const next = categoryChip.dataset.categoryFilter || ''
    productState.categoryFilter = productState.categoryFilter === next ? '' : next
    renderProduct()
    return
  }
  if (action === 'edit-record') {
    productState.screen = 'use'
    productState.editingRecordId = actionButton?.dataset.recordId || target.closest<HTMLElement>('[data-record-id]')?.dataset.recordId || null
    renderProduct()
    return
  }
  if (action === 'close-record') {
    productState.editingRecordId = null
    productState.draftDefaults = {}
    if (isMatrixApp()) productState.screen = productState.groupViewId ? 'group' : 'dashboard'
    renderProduct()
    return
  }
  if (action === 'delete-record') {
    const recordId = actionButton?.dataset.recordId || target.closest<HTMLElement>('[data-record-id]')?.dataset.recordId
    const record = productState.records.find((item) => item.id === recordId)
    if (!record) return
    if (!window.confirm(`Ta bort ${recordTitle(record, productState.spec)}?`)) return
    productState.records = productState.records.filter((item) => item.id !== recordId)
    saveCurrentWorkflow()
    renderProduct()
    return
  }
  if (action === 'export') { exportReports(); return }
  if (action === 'logout') {
    setSessionUser(null)
    productState.authReady = false
    productState.appsStatus = 'idle'
    resetWorkspaceHomeState()
    productState.screen = 'projects'
    history.replaceState(null, '', location.pathname + location.search)
    renderLanding()
    return
  }
  const statusAction = target.closest<HTMLElement>('[data-record-status]')
  if (statusAction) {
    const record = productState.records.find((item) => item.id === statusAction.dataset.recordId)
    const statusField = productState.spec?.statusField
    if (record && statusField) {
      record.values[statusField] = statusAction.dataset.recordStatus || record.values[statusField]
      record.updatedAt = new Date().toISOString()
      saveCurrentWorkflow()
      renderProduct()
    }
  }
})

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduceMotion) document.documentElement.classList.add('reduce-motion')

bindMarketingPage = () => {
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  },
  { threshold: 0, rootMargin: '0px 0px -8% 0px' },
)
document.querySelectorAll('.reveal').forEach((el) => {
  const rect = el.getBoundingClientRect()
  if (rect.bottom > 0 && rect.top < window.innerHeight) el.classList.add('is-visible')
  observer.observe(el)
})
document.documentElement.classList.add('js-ready')

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
const heroEl = document.querySelector<HTMLElement>('.hero')
const onScroll = () => {
  const pastHero = (heroEl?.getBoundingClientRect().bottom ?? 80) < 80
  headerEl?.classList.toggle('is-scrolled', pastHero)
}
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

paintLiveDemo()

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
    const copy = excelErrorCopy(error)
    showUploadResult(renderAnalysisError(copy.title, copy.message))
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
  ['top', '#/'],
  ['produkt', '#/'],
  ['anvandning', '#/anvandning'],
]
const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-menu a')
if (parseRoute().name === 'home') {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const match = navTargets.find(([id]) => id === entry.target.id)
        if (!match) return
        navLinks.forEach((link) => {
          const href = link.getAttribute('href')
          if (href === '#cta' || href === '#login') return
          link.classList.toggle('is-active', href === match[1])
        })
      })
    },
    { rootMargin: '-42% 0px -48% 0px', threshold: 0 },
  )
  navTargets.forEach(([id]) => {
    const section = document.getElementById(id)
    if (section) navObserver.observe(section)
  })
}
}

const initializeFlowly = () => {
  productState.authReady = true
  const currentUser = currentUserProfile()
  const route = parseRoute()
  if (!currentUser) {
    if (isProductRoute(route)) history.replaceState(null, '', location.pathname + location.search)
    renderLanding()
    return
  }
  applyAuthenticatedRoute()
}

const syncHomeFocus = (route: Extract<AppRoute, { name: 'home' }>) => {
  document.title = pageTitle(route)
  document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href')
    if (href === '#cta' || href === '#login') return
    link.classList.toggle('is-active', href === currentNavHref())
  })
  scrollMarketing(route.focus)
}

window.addEventListener('hashchange', () => {
  if (isOverlayHash()) return
  const route = parseRoute()
  if (isProductRoute(route)) {
    if (getCurrentUser()) applyAuthenticatedRoute()
    else {
      history.replaceState(null, '', location.pathname + location.search)
      renderLanding()
    }
    return
  }
  if (getCurrentUser() && route.name === 'home' && !route.focus) {
    applyAuthenticatedRoute()
    return
  }
  if (route.name === 'home' && document.querySelector('.hero') && !document.body.classList.contains('is-product-mode')) {
    syncHomeFocus(route)
    return
  }
  renderLanding()
})

initializeFlowly()
