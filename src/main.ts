import './style.css'

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
          <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" />
          <span class="upload-symbol">${icon('upload', 22)}</span>
          <strong class="upload-label">Släpp din .xlsx-fil här</strong>
          <small>eller klicka för att välja</small>
        </label>
        <small class="upload-note">Börja med filen ni redan använder.</small>
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

const uploadZone = document.querySelector<HTMLLabelElement>('.upload-zone')
const uploadInput = document.querySelector<HTMLInputElement>('#file-upload')
const uploadLabel = document.querySelector<HTMLElement>('.upload-label')

uploadInput?.addEventListener('change', () => {
  if (uploadInput.files?.[0] && uploadLabel) uploadLabel.textContent = uploadInput.files[0].name
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
  if (file && uploadLabel) uploadLabel.textContent = file.name
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
