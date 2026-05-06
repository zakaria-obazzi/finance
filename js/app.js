/**
 * Financial Assistant — Application Logic
 * =========================================
 * NLP engine, stats computation, chart rendering,
 * insights, budget tracking, and transaction history.
 *
 * Developer: Your Name Here
 */

'use strict';

// ============================================================
// STATE
// ============================================================
let txs = [], budgets = {}, darkMode = false, charts = {};

// ============================================================
// CONSTANTS
// ============================================================
const ICONS = {
  'Groceries': '🛒', 'Food & Dining': '🍽️', 'Transportation': '🚗',
  'Utilities': '💡', 'Housing': '🏠', 'Shopping': '🛍️',
  'Entertainment': '🎬', 'Health & Fitness': '💪', 'Electronics': '💻',
  'Salary': '💼', 'Freelance': '🧑‍💻', 'Investment': '📈',
  'Education': '📚', 'Travel': '✈️', 'Savings': '🏦',
  'Other': '📌', 'Balance Reset': '🎯'
};

const PALETTE = [
  '#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#60a5fa'
];

// ============================================================
// NLP ENGINE — KEYWORDS & PATTERNS
// ============================================================
const INC_KW = [
  'earned','earn','earning','earns','income','salary','salaries','wage','wages',
  'received','receive','receiving','got paid','get paid','got','made','make','making',
  'sold','sell','selling','bonus','bonuses','profit','profits','gained','gain',
  'paid me','payment received','payment','refund','refunded','reimbursement','reimbursed',
  'freelance income','freelance payment','gig','side job','side hustle',
  'gift','gifted','inheritance','interest','dividend','dividends','return','returns',
  'paycheck','payday','commission','commissions','revenue','revenues',
  'proceeds','payout','cashback','cash back','allowance','stipend','grant',
  'pension','social security','rental income','rent received','tip received'
];

const INC_PAT = [
  /earn(?:ed|ing|s)?\s+\$?([\d.,]+)/i,
  /(?:got|get)\s+(?:paid\s+)?\$?([\d.,]+)/i,
  /made\s+\$?([\d.,]+)/i,
  /received?\s+\$?([\d.,]+)/i,
  /sold\s+.{0,30}for\s+\$?([\d.,]+)/i,
  /\$?([\d.,]+)\s+(?:income|salary|paycheck|bonus|refund|commission)/i
];

const EXP_KW = [
  'spent','spend','spending','spends','cost','costs','costing',
  'pay','paying','paid for','expense','expenses','bought','buy','buying',
  'purchase','purchased','purchasing','charged','charge','charges','fee','fees',
  'subscription','subscriptions','rent','mortgage','loan','loan payment','installment',
  'bill','bills','lost','fine','penalty','overdue','withdrawal','withdrew',
  'invested','investment','donated','donation','charity','tax','taxes','vat',
  'insurance premium','premium','tip','tipped','debt','repaid','repayment','ordered','order'
];

const EXP_PAT = [
  /spent\s+\$?([\d.,]+)/i,
  /cost(?:ed|s)?\s+(?:me\s+)?\$?([\d.,]+)/i,
  /(?:pay(?:ing)?|paid\s+for)\s+\$?([\d.,]+)/i,
  /bought\s+.{0,30}for\s+\$?([\d.,]+)/i,
  /\$?([\d.,]+)\s+(?:on|for)\s+/i
];

const Q_KW = [
  'how much', "what is my", "what's my", 'show me', 'show my', 'tell me', 'give me',
  'balance', 'overview', 'summary', 'breakdown', 'statistics', 'stats', 'report', 'analytics',
  'how many transactions', 'list transactions', 'total spending', 'total income', 'total expenses',
  'net worth', 'savings rate', 'average expense', 'savings tips', 'tip', 'advice', 'help'
];

const CATS = {
  'Groceries': ['grocery','groceries','supermarket','hypermarket','whole foods','safeway','kroger','costco','walmart','lidl','aldi','produce','vegetables','veggies','fruits','meat','fish','dairy','bread','eggs','milk','cheese','yogurt','cereal'],
  'Food & Dining': ['food','eat','eating','ate','dine','dining','restaurant','cafe','cafeteria','bistro','diner','eatery','coffee','starbucks','dunkin','pizza','burger','sushi','tacos','sandwich','noodles','pasta','lunch','dinner','breakfast','brunch','meal','meals','snack','dessert','ice cream','smoothie','takeout','take-out','take out','delivery','order food','doordash','uber eats','grubhub','instacart','postmates'],
  'Transportation': ['gas','fuel','petrol','diesel','car','vehicle','auto','automobile','uber','lyft','taxi','cab','rideshare','ride','public transport','public transit','transit','bus','train','metro','subway','tram','rail','flight','airline','plane ticket','airfare','parking','parking meter','garage','toll','tolls','highway fee','car maintenance','oil change','tire','mechanic','repair','bike','bicycle','scooter','motorcycle','registration','car insurance'],
  'Utilities': ['electricity','electric bill','power bill','water bill','water usage','gas bill','natural gas','internet','wifi','broadband','cable','cable tv','satellite','phone bill','mobile bill','cell bill','utility','utilities','verizon','at&t','comcast','spectrum','t-mobile','trash','garbage','recycling'],
  'Housing': ['rent','rental','renting','lease','mortgage','home loan','house payment','property tax','hoa','condo fee','home repair','home improvement','renovation','plumber','electrician','handyman','contractor','furniture','appliance','cleaning','housekeeping','home insurance','renters insurance'],
  'Shopping': ['shop','shopping','clothes','clothing','outfit','dress','shirt','pants','jeans','jacket','coat','shoes','sneakers','boots','sandals','accessories','bag','handbag','backpack','wallet','amazon','ebay','etsy','aliexpress','mall','department store','retail','boutique','gift','present','souvenir'],
  'Entertainment': ['movie','movies','cinema','film','theatre','theater','concert','show','event','festival','performance','game','games','gaming','video game','steam','playstation','xbox','nintendo','streaming','netflix','hulu','disney+','hbo','apple tv','prime video','spotify','apple music','youtube premium','fun','outing','night out','date night','bowling','golf','mini golf','escape room','amusement park','hobby','hobbies','craft','art supplies','instrument'],
  'Health & Fitness': ['gym','fitness','workout','exercise','yoga','pilates','personal trainer','coach','doctor','physician','specialist','hospital','clinic','urgent care','medicine','medication','prescription','drug','pharmacy','walgreens','cvs','dental','dentist','orthodontist','teeth','vision','optometrist','glasses','contacts','mental health','therapy','therapist','counseling','psychiatrist','massage','spa','wellness','chiropractor','supplement','vitamins','protein powder','health insurance','medical insurance','copay','deductible','veterinary','vet','pet care','pet food','pet medicine'],
  'Electronics': ['laptop','computer','pc','desktop','macbook','iphone','android','smartphone','cell phone','mobile phone','tablet','ipad','kindle','headphones','earbuds','airpods','speaker','monitor','screen','tv','television','keyboard','mouse','webcam','microphone','charger','cable','adapter','battery','printer','scanner','router','modem','camera','gopro','drone','device','gadget','tech','electronics','apple store','best buy'],
  'Salary': ['salary','paycheck','paystub','work income','wages','hourly pay','overtime','raise','employment income','employer','w2','direct deposit'],
  'Freelance': ['freelance','freelancing','freelancer','gig','side gig','side hustle','side job','client','project payment','contract work','consulting','fiverr','upwork','toptal'],
  'Investment': ['stocks','stock','shares','equity','bonds','etf','mutual fund','index fund','crypto','bitcoin','ethereum','investment','investing','portfolio','brokerage','robinhood','fidelity','vanguard','schwab','dividends','capital gains','returns','interest'],
  'Education': ['tuition','school','university','college','course','class','training','workshop','bootcamp','books','textbook','study materials','udemy','coursera','skillshare','masterclass','student loan','scholarship','grant'],
  'Travel': ['travel','trip','vacation','holiday','hotel','motel','airbnb','hostel','resort','flight','plane','airfare','booking','luggage','suitcase','passport','visa','travel insurance','tour','excursion','sightseeing'],
  'Savings': ['savings','save','saving','saved','emergency fund','rainy day fund','piggy bank','deposit','put away','401k','ira','roth ira','retirement fund'],
  'Other': []
};

// ============================================================
// NLP — AMOUNT EXTRACTION
// ============================================================
function extractAmt(text) {
  const patterns = [
    /\$\s?([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*dollars?/i,
    /([\d,]+\.?\d*)\s*(?:bucks|k\b|thousand|million)/i,
    /([\d,]+\.?\d*)/
  ];
  for (let p of patterns) {
    const m = text.match(p);
    if (m) {
      let a = parseFloat(m[1].replace(/,/g, ''));
      if (/\d\s*k\b/i.test(text))  a *= 1000;
      if (/\d\s*m\b/i.test(text))  a *= 1000000;
      return a;
    }
  }
  return null;
}

// ============================================================
// NLP — MESSAGE PARSER
// ============================================================
function parseMsg(text) {
  const lc = text.toLowerCase().trim();

  // Balance reset intent
  if (
    /balance\s+(?:is|=|:)\s*\$?([\d.,]+)/i.test(lc) ||
    /(?:set|my)\s+(?:opening\s+)?balance\s+(?:to|at|is)?\s*\$?([\d.,]+)/i.test(lc)
  ) {
    const a = extractAmt(text);
    if (a !== null) return {
      intent: 'set_balance', type: 'balance_reset', amount: a,
      category: 'Balance Reset',
      description: `Opening balance $${a.toFixed(2)}`,
      confidence: 0.97, entities: {}
    };
  }

  // Question intent
  const hasAmount = extractAmt(text) !== null;
  const hasTx  = INC_KW.some(k => lc.includes(k)) || EXP_KW.some(k => lc.includes(k));
  const isQ    = Q_KW.some(k => lc.includes(k)) ||
                 /^(?:what|how|show|tell|give|list|display)/i.test(lc) ||
                 /\?$/.test(lc);
  if (isQ && (!hasAmount || !hasTx)) {
    return { intent: 'question', type: 'query', confidence: 0.92, entities: {} };
  }

  // Transaction intent
  const amt = extractAmt(text);
  if (!amt || amt <= 0) return null;

  let is = 0, es = 0;
  for (let p of INC_PAT) if (p.test(lc)) is += 2.5;
  for (let p of EXP_PAT) if (p.test(lc)) es += 2.5;
  for (let k of INC_KW) if (lc.includes(k)) is += 1 + k.split(' ').length * 0.4;
  for (let k of EXP_KW) if (lc.includes(k)) es += 1 + k.split(' ').length * 0.4;

  const type = is > es ? 'income' : 'expense';
  const conf = Math.min(0.97, 0.55 + Math.max(is, es) * 0.04);

  // Category detection
  let bestCat = 'Other', bestScore = 0;
  for (let [cat, kws] of Object.entries(CATS)) {
    let score = 0;
    for (let k of kws) if (lc.includes(k)) score += k.length + k.split(' ').length;
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }

  const isRecurring = /\b(?:every|monthly|weekly|recurring|subscription|annually|yearly)\b/i.test(lc);
  return {
    intent: type === 'income' ? 'earn' : 'spend',
    type, amount: amt, category: bestCat, description: text,
    confidence: conf,
    entities: {
      isRecurring,
      hasPrep: /\s(?:on|for|at|in|from)\s/i.test(text)
    }
  };
}

// ============================================================
// STATS COMPUTATION
// ============================================================
function stats() {
  let ob = 0, inc = 0, exp = 0, ic = 0, ec = 0, bigA = 0, bigC = '—', cats = {};
  let fd = null, ld = null;

  txs.forEach(t => {
    const d = new Date(t.ts);
    if (!fd || d < fd) fd = d;
    if (!ld || d > ld) ld = d;
    if (t.type === 'balance_reset') {
      ob = t.amount; inc = 0; exp = 0; ic = 0; ec = 0; bigA = 0; bigC = '—'; cats = {};
    } else if (t.type === 'income') {
      inc += t.amount; ic++;
    } else if (t.type === 'expense') {
      exp += t.amount; ec++;
      cats[t.category] = (cats[t.category] || 0) + t.amount;
      if (t.amount > bigA) { bigA = t.amount; bigC = t.category; }
    }
  });

  const bal = ob + inc - exp;
  const sr  = inc > 0 ? (inc - exp) / inc * 100 : 0;
  const avg = ec > 0 ? exp / ec : 0;
  const days  = fd && ld ? Math.max(1, Math.round((ld - fd) / 864e5) + 1) : 1;
  const daily = exp / days;
  const run   = bal > 0 && daily > 0 ? Math.floor(bal / daily) : null;

  return { ob, inc, exp, ic, ec, bigA, bigC, bal, sr, avg, days, daily, run, cats };
}

// ============================================================
// RENDER — STAT CARDS
// ============================================================
function updateStats() {
  const s = stats();
  set('sInc',  '$' + s.inc.toFixed(2));
  set('sIncC', s.ic + ' entr' + (s.ic !== 1 ? 'ies' : 'y'));
  set('sExp',  '$' + s.exp.toFixed(2));
  set('sExpC', s.ec + ' entr' + (s.ec !== 1 ? 'ies' : 'y'));
  set('sBal',  '$' + s.bal.toFixed(2));
  set('sBalS', s.bal > 0 ? '▲ positive' : s.bal < 0 ? '▼ negative' : 'break even');
  set('sSav',  s.sr.toFixed(1) + '%');
  set('sAvg',  '$' + s.avg.toFixed(2));
  set('sBig',  '$' + s.bigA.toFixed(2));
  set('sBigC', s.bigC);
  set('sDay',  '$' + s.daily.toFixed(2));
  set('sRun',  s.run !== null ? s.run + ' days' : '—');
  set('sCnt',  txs.filter(t => t.type !== 'balance_reset').length);
  set('sCntS', s.inc > 0 ? 'Saved: $' + (s.inc - s.exp).toFixed(2) : '—');

  const be = document.getElementById('sBal');
  if (be) be.style.color = s.bal < 0 ? '#ef4444' : s.bal > 0 ? '#10b981' : 'inherit';
  const se = document.getElementById('sSav');
  if (se) se.style.color = s.sr < 0 ? '#ef4444' : s.sr > 20 ? '#10b981' : '#f59e0b';

  renderAlerts(s);
  renderBudget(s.cats);
}

// ============================================================
// RENDER — ALERTS
// ============================================================
function renderAlerts(s) {
  const w = document.getElementById('alertsWrap');
  let h = '';
  if (s.inc > 0 && s.exp / s.inc > 0.9)
    h += `<div class="al al-d">🚨 Spending ${(s.exp / s.inc * 100).toFixed(0)}% of income — critical overspend.</div>`;
  else if (s.inc > 0 && s.exp / s.inc > 0.8)
    h += `<div class="al al-w">⚠️ Spending ${(s.exp / s.inc * 100).toFixed(0)}% of income. Target: under 80%.</div>`;
  if (s.run !== null && s.run < 30)
    h += `<div class="al al-d">⏳ Only ~${s.run} days of runway left at $${s.daily.toFixed(2)}/day.</div>`;
  else if (s.run !== null && s.run < 90)
    h += `<div class="al al-w">⏰ ~${s.run} days of runway. Consider building your emergency fund.</div>`;
  if (s.inc > 0 && s.sr > 25)
    h += `<div class="al al-g">🌟 Saving ${s.sr.toFixed(1)}% of income — excellent financial discipline!</div>`;

  Object.entries(budgets).forEach(([cat, lim]) => {
    const sp = s.cats[cat] || 0;
    if (sp > lim) h += `<div class="al al-w">${ICONS[cat] || '📌'} ${cat}: $${sp.toFixed(2)} spent — over $${lim} budget.</div>`;
  });
  w.innerHTML = h;
}

// ============================================================
// RENDER — CHARTS
// ============================================================
function updateCharts() {
  const s  = stats();
  const dm = darkMode;
  const gc = dm ? '#2d3748' : '#f0f0f0';
  const tc = dm ? '#94a3b8' : '#666';
  const bc = dm ? '#1a1a2e' : '#fff';

  // Doughnut — expenses by category
  const cl = Object.keys(s.cats), cd = Object.values(s.cats);
  rebuild('cCat', {
    type: 'doughnut',
    data: {
      labels: cl.length ? cl : ['No data'],
      datasets: [{ data: cd.length ? cd : [1], backgroundColor: PALETTE, borderWidth: 2, borderColor: bc }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 5, color: tc } },
        tooltip: { callbacks: { label: c => ` ${c.label}: $${c.raw.toFixed(2)}` } }
      }
    }
  });

  // Bar — income / expenses / balance
  rebuild('cIE', {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Balance'],
      datasets: [{
        label: '$',
        data: [s.inc, s.exp, s.bal],
        backgroundColor: ['#10b981', '#ef4444', s.bal >= 0 ? '#667eea' : '#f97316'],
        borderRadius: 8, borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` $${c.raw.toFixed(2)}` } } },
      scales: {
        y: { ticks: { callback: v => '$' + v, color: tc }, grid: { color: gc } },
        x: { ticks: { color: tc }, grid: { display: false } }
      }
    }
  });

  // Line — cumulative balance trend
  let run = 0;
  const tl = [], td = [];
  txs.forEach(t => {
    const d   = new Date(t.ts);
    const lbl = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
                d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    if (t.type === 'balance_reset')  run  = t.amount;
    else if (t.type === 'income')    run += t.amount;
    else if (t.type === 'expense')   run -= t.amount;
    tl.push(lbl); td.push(+run.toFixed(2));
  });
  if (!tl.length) { tl.push('Start'); td.push(0); }

  rebuild('cTrend', {
    type: 'line',
    data: {
      labels: tl,
      datasets: [{
        label: 'Balance', data: td,
        borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)',
        borderWidth: 2, fill: true, tension: 0.35,
        pointRadius: td.length < 25 ? 3 : 1,
        pointBackgroundColor: td.map(v => v >= 0 ? '#667eea' : '#ef4444')
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` $${c.raw.toFixed(2)}` } } },
      scales: {
        x: { ticks: { font: { size: 9 }, maxRotation: 30, color: tc }, grid: { display: false } },
        y: { ticks: { callback: v => '$' + v, color: tc }, grid: { color: gc } }
      }
    }
  });

  // Grouped bar — monthly income vs expenses
  const mo = {};
  txs.filter(t => t.type === 'income' || t.type === 'expense').forEach(t => {
    const d = new Date(t.ts);
    const k = d.toLocaleDateString(undefined, { year: '2-digit', month: 'short' });
    if (!mo[k]) mo[k] = { i: 0, e: 0 };
    if (t.type === 'income') mo[k].i += t.amount; else mo[k].e += t.amount;
  });
  const mk = Object.keys(mo);

  rebuild('cMonthly', {
    type: 'bar',
    data: {
      labels: mk.length ? mk : ['No data'],
      datasets: [
        { label: 'Income',   data: mk.map(k => mo[k].i), backgroundColor: 'rgba(16,185,129,0.8)',  borderRadius: 5, borderWidth: 0 },
        { label: 'Expenses', data: mk.map(k => mo[k].e), backgroundColor: 'rgba(239,68,68,0.8)',   borderRadius: 5, borderWidth: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 11 }, color: tc } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${c.raw.toFixed(2)}` } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { display: false } },
        y: { ticks: { callback: v => '$' + v, color: tc }, grid: { color: gc } }
      }
    }
  });
}

function rebuild(id, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(el.getContext('2d'), cfg);
}

// ============================================================
// RENDER — INSIGHTS
// ============================================================
function updateInsights() {
  const panel = document.getElementById('insightsPanel');
  const s     = stats();
  const cnt   = txs.filter(t => t.type === 'income' || t.type === 'expense').length;

  if (!cnt) {
    panel.innerHTML = '<div class="none">Add transactions to unlock insights.</div>';
    return;
  }

  let h = '';

  // Net Balance
  const bc = s.bal >= 0 ? '#10b981' : '#ef4444';
  h += `<div class="ic" style="border-left-color:${bc}">
    <div class="ititle">💰 Net Balance</div>
    <div class="ival" style="color:${bc}">$${s.bal.toFixed(2)}</div>
    <div class="idesc">${s.bal >= 0
      ? `You're ahead by $${s.bal.toFixed(2)}`
      : `You're $${Math.abs(s.bal).toFixed(2)} in deficit — reduce expenses or increase income.`}</div>
  </div>`;

  // Savings Rate
  const src  = s.sr > 20 ? '#10b981' : s.sr > 0 ? '#f59e0b' : '#ef4444';
  const srmsg = s.sr > 30 ? '🌟 Excellent — building wealth fast!'
    : s.sr > 20 ? '✅ Above 20% target.'
    : s.sr > 10 ? '⚠️ Decent — push toward 20%.'
    : s.sr > 0  ? '❌ Under 10% — cut discretionary spending.'
    : '❌ Expenses exceed income.';
  h += `<div class="ic" style="border-left-color:${src}">
    <div class="ititle">📈 Savings Rate</div>
    <div class="ival" style="color:${src}">${s.sr.toFixed(1)}%</div>
    <div class="idesc">${srmsg}</div>
    <div class="bw"><div class="bf" style="width:${Math.min(100, Math.max(0, s.sr)).toFixed(1)}%;background:${src}"></div></div>
  </div>`;

  // Spending Velocity
  h += `<div class="ic" style="border-left-color:#06b6d4">
    <div class="ititle">⚡ Spending Velocity</div>
    <div class="ival" style="color:#06b6d4">$${s.daily.toFixed(2)}<span style="font-size:13px;font-weight:500">/day</span></div>
    <div class="idesc">$${(s.daily * 7).toFixed(2)}/week · $${(s.daily * 30).toFixed(2)}/month projected · tracked over <strong>${s.days} day${s.days !== 1 ? 's' : ''}</strong></div>
  </div>`;

  // Financial Runway
  if (s.run !== null) {
    const rc   = s.run > 180 ? '#10b981' : s.run > 60 ? '#f59e0b' : '#ef4444';
    const rmsg = s.run < 30  ? '🚨 Act now — build income or cut spending.'
      : s.run < 90 ? '⚠️ Build your emergency fund (3–6 months target).'
      : '✅ Healthy runway.';
    h += `<div class="ic" style="border-left-color:${rc}">
      <div class="ititle">⏳ Financial Runway</div>
      <div class="ival" style="color:${rc}">${s.run} days</div>
      <div class="idesc">~${Math.round(s.run / 30)} month${Math.round(s.run / 30) !== 1 ? 's' : ''} at $${s.daily.toFixed(2)}/day. ${rmsg}</div>
    </div>`;
  }

  // 50/30/20 Rule
  if (s.inc > 0) {
    const needsCats = ['Groceries','Utilities','Housing','Transportation','Health & Fitness'];
    const wantsCats = ['Food & Dining','Entertainment','Shopping','Travel','Electronics'];
    let n = 0, w = 0;
    const sv = Math.max(0, s.inc - s.exp);
    Object.entries(s.cats).forEach(([cat, amt]) => {
      if (needsCats.includes(cat)) n += amt;
      else if (wantsCats.includes(cat)) w += amt;
      else n += amt;
    });
    const np = n / s.inc * 100, wp = w / s.inc * 100, sp = sv / s.inc * 100;
    h += `<div class="ic" style="border-left-color:#8b5cf6">
      <div class="ititle">🎯 50/30/20 Rule Analysis</div>
      <div class="idesc" style="margin-bottom:6px">Needs: 50% · Wants: 30% · Savings: 20%</div>
      <div class="rule-grid">
        <div class="ri" style="background:${np > 55 ? '#fee2e2' : '#f0fdf4'}">
          <div class="rp" style="color:${np > 55 ? '#ef4444' : '#10b981'}">${np.toFixed(0)}%</div>
          <div class="rl">Needs</div><div class="rt" style="color:${np > 50 ? '#ef4444' : '#10b981'}">Target 50%</div>
        </div>
        <div class="ri" style="background:${wp > 35 ? '#fef3c7' : '#f0fdf4'}">
          <div class="rp" style="color:${wp > 35 ? '#f59e0b' : '#10b981'}">${wp.toFixed(0)}%</div>
          <div class="rl">Wants</div><div class="rt" style="color:${wp > 30 ? '#f59e0b' : '#10b981'}">Target 30%</div>
        </div>
        <div class="ri" style="background:${sp < 15 ? '#fee2e2' : '#d1fae5'}">
          <div class="rp" style="color:${sp < 15 ? '#ef4444' : '#10b981'}">${sp.toFixed(0)}%</div>
          <div class="rl">Savings</div><div class="rt" style="color:${sp < 20 ? '#ef4444' : '#10b981'}">Target 20%</div>
        </div>
      </div>
    </div>`;
  }

  // Top spending categories
  const sorted = Object.entries(s.cats).sort((a, b) => b[1] - a[1]);
  if (sorted.length) {
    const mx = sorted[0][1];
    h += `<div class="ic">
      <div class="ititle">🏆 Spending Breakdown by Category</div>
      ${sorted.slice(0, 8).map(([cat, amt]) => {
        const pct = (amt / s.exp * 100).toFixed(1);
        const ob  = budgets[cat] && amt > budgets[cat];
        return `<div style="margin-top:9px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;color:var(--text)">
            <span style="font-weight:700">${ICONS[cat] || '📌'} ${cat}</span>
            <span style="color:var(--text-sub)">$${amt.toFixed(2)} (${pct}%)${ob ? ` ⚠️ over $${budgets[cat]}` : ''}</span>
          </div>
          <div class="bw"><div class="bf" style="width:${(amt / mx * 100).toFixed(1)}%;background:${ob ? '#ef4444' : '#667eea'}"></div></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  // Income Sources
  const incTxs = txs.filter(t => t.type === 'income');
  if (incTxs.length) {
    const ic2 = {};
    incTxs.forEach(t => { ic2[t.category] = (ic2[t.category] || 0) + t.amount; });
    const is = Object.entries(ic2).sort((a, b) => b[1] - a[1]);
    h += `<div class="ic" style="border-left-color:#10b981">
      <div class="ititle">💚 Income Sources</div>
      ${is.map(([cat, amt]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:13px;color:var(--text)">
        <span style="font-weight:600">${ICONS[cat] || '💚'} ${cat}</span>
        <span style="color:#10b981;font-weight:700">+$${amt.toFixed(2)}</span>
      </div>`).join('')}
    </div>`;
  }

  // Recurring / Subscription Tracker
  const recTxs  = txs.filter(t => t.type === 'expense' && t.entities && t.entities.isRecurring);
  if (recTxs.length) {
    const recTotal = recTxs.reduce((s, t) => s + t.amount, 0);
    h += `<div class="ic" style="border-left-color:#8b5cf6">
      <div class="ititle">🔁 Recurring / Subscription Tracker</div>
      <div class="ival" style="color:#8b5cf6">$${recTotal.toFixed(2)}</div>
      <div class="idesc">Across ${recTxs.length} recurring item${recTxs.length !== 1 ? 's' : ''} · ~$${(recTotal * 12).toFixed(0)}/year</div>
      ${recTxs.map(t => `<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px;color:var(--text)">
        <span>${ICONS[t.category] || '📌'} ${t.description.length > 35 ? t.description.slice(0, 35) + '…' : t.description}</span>
        <span style="color:#8b5cf6;font-weight:700">$${t.amount.toFixed(2)}</span>
      </div>`).join('')}
    </div>`;
  }

  // Transaction Overview
  h += `<div class="ic" style="border-left-color:#84cc16">
    <div class="ititle">📋 Transaction Overview</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px">
      <div style="text-align:center;background:#f0fdf4;border-radius:8px;padding:9px">
        <div style="font-size:20px;font-weight:800;color:#10b981">${txs.filter(t => t.type === 'income').length}</div>
        <div style="font-size:10px;color:var(--text-sub)">Income</div>
      </div>
      <div style="text-align:center;background:#fef2f2;border-radius:8px;padding:9px">
        <div style="font-size:20px;font-weight:800;color:#ef4444">${txs.filter(t => t.type === 'expense').length}</div>
        <div style="font-size:10px;color:var(--text-sub)">Expenses</div>
      </div>
      <div style="text-align:center;background:#f5f3ff;border-radius:8px;padding:9px">
        <div style="font-size:20px;font-weight:800;color:#8b5cf6">${txs.filter(t => t.entities && t.entities.isRecurring).length}</div>
        <div style="font-size:10px;color:var(--text-sub)">Recurring</div>
      </div>
    </div>
  </div>`;

  panel.innerHTML = h;
}

// ============================================================
// RENDER — BUDGET
// ============================================================
function renderBudget(cats) {
  const panel = document.getElementById('budgetPanel');
  const all   = [...new Set([...Object.keys(cats), ...Object.keys(budgets)])];
  if (!all.length) {
    panel.innerHTML = '<div class="none">No expenses logged yet. Add expenses to set category budgets.</div>';
    return;
  }
  let h = `<div style="padding:0 0 10px;font-size:12px;color:var(--text-sub)">Set monthly limits per category. Alerts fire automatically when exceeded.</div>`;
  h += all.sort().map(cat => {
    const sp  = cats[cat] || 0;
    const lim = budgets[cat] || 0;
    const pct = lim > 0 ? Math.min(100, sp / lim * 100) : 0;
    const col = pct > 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981';
    return `<div class="brow">
      <div style="font-size:20px">${ICONS[cat] || '📌'}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="flex:1;font-size:13px;font-weight:600;color:var(--text)">${cat}</div>
          <div style="font-size:11px;color:${col};font-weight:700">$${sp.toFixed(2)} spent${lim > 0 ? ` / $${lim} budget` : ''}</div>
          ${lim > 0 ? `<div style="font-size:11px;font-weight:700;color:${col}">${pct.toFixed(0)}%</div>` : ''}
        </div>
        ${lim > 0 ? `<div class="bbar"><div class="bfill" style="width:${pct.toFixed(1)}%;background:${col}"></div></div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-size:11px;color:var(--text-sub)">$</span>
        <input class="binput" type="number" min="0" placeholder="Limit"
               value="${lim || ''}" onchange="setBudget('${cat}', this.value)">
      </div>
    </div>`;
  }).join('');
  panel.innerHTML = h;
}

function setBudget(cat, v) {
  const n = parseFloat(v);
  if (!isNaN(n) && n > 0) budgets[cat] = n; else delete budgets[cat];
  updateStats();
}

// ============================================================
// RENDER — HISTORY
// ============================================================
function populateFilters() {
  const ms = document.getElementById('fMonth'), mc = ms.value;
  const months = new Set();
  txs.forEach(t => {
    const d = new Date(t.ts);
    months.add(d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'));
  });
  ms.innerHTML = '<option value="all">All months</option>' +
    [...months].sort().reverse().map(m => {
      const [y, mo] = m.split('-');
      const lbl = new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      return `<option value="${m}"${m === mc ? ' selected' : ''}>${lbl}</option>`;
    }).join('');

  const cs = document.getElementById('fCat'), cc = cs.value;
  const cats = new Set(txs.filter(t => t.category).map(t => t.category));
  cs.innerHTML = '<option value="all">All categories</option>' +
    [...cats].sort().map(c =>
      `<option value="${c}"${c === cc ? ' selected' : ''}>${ICONS[c] || '📌'} ${c}</option>`
    ).join('');
}

function renderHistory() {
  populateFilters();
  const list = document.getElementById('txList');
  const q  = (document.getElementById('searchBox').value || '').toLowerCase();
  const ft = document.getElementById('fType').value;
  const fm = document.getElementById('fMonth').value;
  const fc = document.getElementById('fCat').value;
  let filtered = [...txs].reverse();

  if (q)         filtered = filtered.filter(t => (t.description || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
  if (ft !== 'all') filtered = filtered.filter(t => t.type === ft);
  if (fm !== 'all') filtered = filtered.filter(t => {
    const d = new Date(t.ts);
    return (d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0')) === fm;
  });
  if (fc !== 'all') filtered = filtered.filter(t => t.category === fc);

  if (!filtered.length) {
    list.innerHTML = '<div class="none">No matching transactions.</div>';
    return;
  }

  const grp = {};
  filtered.forEach(t => {
    const k = new Date(t.ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!grp[k]) grp[k] = [];
    grp[k].push(t);
  });

  list.innerHTML = Object.entries(grp).map(([date, group]) => {
    const dt = group.reduce((s, t) => t.type === 'income' ? s + t.amount : t.type === 'expense' ? s - t.amount : s, 0);
    return `<div style="margin-bottom:5px">
      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:var(--text-sub);margin:10px 0 5px;padding:0 3px">
        <span>${date}</span>
        <span style="color:${dt >= 0 ? '#10b981' : '#ef4444'}">${dt >= 0 ? '+' : ''}$${dt.toFixed(2)}</span>
      </div>
      ${group.map(t => {
        const oi   = txs.indexOf(t);
        const time = new Date(t.ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const ic   = ICONS[t.category] || '📌';
        const cl   = (t.confidence || 0) >= 0.8 ? 'ch' : (t.confidence || 0) >= 0.6 ? 'cm' : 'cl';
        const clt  = (t.confidence || 0) >= 0.8 ? 'High' : (t.confidence || 0) >= 0.6 ? 'Med' : 'Low';

        if (t.type === 'balance_reset') return `
          <div class="tx">
            <div style="font-size:19px">🎯</div>
            <div class="txbody"><div class="txdesc">${esc(t.description)}</div>
              <div class="txmeta"><span class="tag rt">Balance Reset</span><span class="txd">${time}</span></div>
            </div>
            <div style="display:flex;align-items:center;gap:5px">
              <div class="txamt reset">$${t.amount.toFixed(2)}</div>
              <button class="del" onclick="delTx(${oi})">✕</button>
            </div>
          </div>`;

        return `
          <div class="tx ${t.type}">
            <div style="font-size:19px">${ic}</div>
            <div class="txbody">
              <div class="txdesc">${esc(t.description)}</div>
              <div class="txmeta">
                <span class="tag ${t.type === 'income' ? 'it' : 'et'}">${t.category}</span>
                ${t.entities && t.entities.isRecurring ? '<span class="tag rec">🔁 Recurring</span>' : ''}
                <span class="txd">${time}</span>
                <span class="cb ${cl}">${clt}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:5px">
              <div class="txamt ${t.type}">${t.type === 'income' ? '+' : '−'}$${t.amount.toFixed(2)}</div>
              <button class="del" onclick="delTx(${oi})">✕</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

// ============================================================
// SMART TIPS
// ============================================================
function smartTip(s) {
  const tips = [
    s.inc > 0 && s.exp / s.inc > 0.9
      ? "⚠️ Spending 90%+ of income. The 50/30/20 rule: needs≤50%, wants≤30%, savings≥20%." : null,
    s.cats['Entertainment'] && s.inc > 0 && s.cats['Entertainment'] / s.inc > 0.15
      ? "🎬 Entertainment exceeds 15% of income. A monthly subscription audit can reveal unused services." : null,
    s.cats['Food & Dining'] && s.inc > 0 && s.cats['Food & Dining'] / s.inc > 0.2
      ? "🍽️ Dining out is over 20% of income. Meal prepping 3 days/week can save $150–$300/month." : null,
    s.inc > 0 && s.sr < 0.1
      ? "💡 Savings rate under 10%. Automating a small fixed transfer on payday locks savings before you can spend." : null,
    s.inc > 0 && s.sr > 0.3
      ? "🎉 Savings rate above 30%! Consider investing surplus in index funds or topping up your emergency fund to 6 months." : null,
    s.run !== null && s.run < 60
      ? `⏳ Runway under 60 days. Prioritize high-impact expense cuts: subscriptions, dining out, and impulse purchases.` : null,
    s.cats['Shopping'] && s.inc > 0 && s.cats['Shopping'] / s.inc > 0.1
      ? "🛍️ Shopping is over 10% of income. Try a 24-hour waiting rule before non-essential purchases." : null,
  ].filter(Boolean);
  return tips.length ? tips[Math.floor(Math.random() * tips.length)] : null;
}

// ============================================================
// CHAT — SEND MESSAGE
// ============================================================
function send() {
  const inp = document.getElementById('ui');
  const msg = inp.value.trim();
  if (!msg) return;
  addUser(msg);
  inp.value = '';
  typing();

  setTimeout(() => {
    rmTyping();
    const p  = parseMsg(msg);
    const lc = msg.toLowerCase();

    if (!p) {
      addBot("🤔 I didn't catch that.\n\n**Income:** 'Earned $500', 'Got paid $2000', 'Sold phone $300'\n**Expenses:** 'Spent $50 groceries', 'Paid $100 rent', 'Netflix $15 monthly'\n**Info:** 'What's my balance?', 'Show summary', 'Give me savings tips'");
      return;
    }

    if (p.intent === 'question') {
      if (lc.includes('tip') || lc.includes('advice') || lc.includes('saving')) {
        const s2  = stats(), tip = smartTip(s2);
        addBot(tip || "💡 Add more transactions and I'll give personalized tips.\n\n**Universal tips:**\n• 50% needs · 30% wants · 20% savings\n• Automate savings transfers on payday\n• Audit subscriptions monthly — cancel unused ones\n• Cook at home 4+ days/week\n• Build a 3–6 month emergency fund before investing");
      } else if (lc.includes('chart') || lc.includes('graph')) {
        switchTab('charts');
        addBot("📈 Switched to **Charts** — 4 visualizations including monthly trends.");
      } else if (lc.includes('insight') || lc.includes('analyz')) {
        switchTab('insights');
        addBot("🔍 Switched to **Insights** — includes 50/30/20 analysis, runway, velocity & subscription tracker.");
      } else if (lc.includes('budget')) {
        switchTab('budget');
        addBot("🎯 Switched to **Budgets** — set per-category limits. I'll alert you when exceeded.");
      } else if (lc.includes('histor') || lc.includes('transaction') || lc.includes('list')) {
        switchTab('history');
        addBot("📋 Switched to **History** — search, filter by type, month & category.");
      } else {
        const s2 = stats();
        let sum = `**📊 Financial Summary**\n\n`;
        sum += `💚 Income: $${s2.inc.toFixed(2)} (${s2.ic} entries)\n`;
        sum += `🔴 Expenses: $${s2.exp.toFixed(2)} (${s2.ec} entries)\n`;
        sum += `${s2.bal >= 0 ? '🔵' : '⚠️'} Balance: $${s2.bal.toFixed(2)}\n`;
        sum += `📈 Savings Rate: ${s2.sr.toFixed(1)}% ${s2.sr >= 20 ? '✅' : s2.sr >= 10 ? '⚠️' : '❌'}\n`;
        sum += `⚡ Spend/Day: $${s2.daily.toFixed(2)}\n`;
        if (s2.run !== null) sum += `⏳ Runway: ~${s2.run} days\n`;
        const tc2 = Object.entries(s2.cats).sort((a, b) => b[1] - a[1])[0];
        if (tc2) sum += `🏆 Top Category: ${tc2[0]} ($${tc2[1].toFixed(2)})\n`;
        const bx = txs.filter(t => t.type === 'expense');
        if (bx.length) {
          const be = bx.reduce((m, t) => t.amount > m.amount ? t : m);
          sum += `💸 Biggest: $${be.amount.toFixed(2)} — ${be.description}`;
        }
        addBot(sum);
      }
      return;
    }

    if (p.intent === 'set_balance') {
      txs.push({ ...p, ts: new Date() });
      refresh();
      addBot(`🎯 Opening balance set to **$${p.amount.toFixed(2)}**. Tracking from here.`);
      return;
    }

    txs.push({ ...p, ts: new Date() });
    refresh();

    const s2   = stats();
    const note = `\n💳 Balance: **$${s2.bal.toFixed(2)}**`;
    const pool = p.type === 'income' ? [
      `💰 Income logged: **+$${p.amount.toFixed(2)}** (${p.category})${note}`,
      `✨ **+$${p.amount.toFixed(2)}** recorded — ${p.category}.${note}`,
      `🎉 **$${p.amount.toFixed(2)}** earned from ${p.category}!${note}`
    ] : [
      `💸 Expense tracked: **−$${p.amount.toFixed(2)}** · ${p.category}.${note}`,
      `📝 Logged **$${p.amount.toFixed(2)}** under ${p.category}.${note}`,
      `✅ **−$${p.amount.toFixed(2)}** recorded (${p.category}).${note}`
    ];

    let reply = pool[Math.floor(Math.random() * pool.length)];
    if (p.entities && p.entities.isRecurring)
      reply += `\n🔁 Flagged as **recurring** — tracked in the Subscriptions insight.`;

    const cnt = txs.filter(t => t.type !== 'balance_reset').length;
    if (cnt > 0 && cnt % 4 === 0) {
      const tip = smartTip(s2);
      if (tip) reply += `\n\n${tip}`;
    }
    addBot(reply);
  }, 550);
}

// ============================================================
// UI HELPERS
// ============================================================
function refresh() { updateStats(); updateCharts(); updateInsights(); renderHistory(); }

function delTx(i) { txs.splice(i, 1); refresh(); addBot("🗑️ Deleted — stats updated."); }

function clearAll() {
  if (!confirm('Clear ALL transactions? Cannot be undone.')) return;
  txs = []; budgets = {};
  refresh();
  addBot("🗑️ Cleared. Fresh start!");
}

function switchTab(n) {
  document.querySelectorAll('.tab').forEach((el, i) =>
    el.classList.toggle('active', ['charts','insights','budget','history'][i] === n)
  );
  document.querySelectorAll('.tc').forEach(el => el.classList.remove('active'));
  const tc = document.getElementById('tab-' + n);
  if (tc) tc.classList.add('active');
}

function fi(t) {
  const el = document.getElementById('ui');
  el.value = t;
  el.focus();
  el.setSelectionRange(t.length, t.length);
}

function toggleTheme() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  updateCharts();
}

function exportCSV() {
  if (!txs.length) { alert('No transactions to export.'); return; }
  const header = 'Date,Time,Type,Category,Description,Amount,Confidence,Recurring';
  const rows = txs.map(t => {
    const d = new Date(t.ts);
    return [
      d.toLocaleDateString(), d.toLocaleTimeString(),
      t.type, t.category,
      '"' + (t.description || '').replace(/"/g, '""') + '"',
      t.amount.toFixed(2),
      ((t.confidence || 0) * 100).toFixed(0) + '%',
      t.entities && t.entities.isRecurring ? 'Yes' : 'No'
    ].join(',');
  });
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'transactions_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function addUser(t) {
  const d  = document.getElementById('msgs');
  const el = document.createElement('div');
  el.className = 'msg user';
  el.innerHTML = `<div class="mc">${esc(t)}</div>`;
  d.appendChild(el);
  d.scrollTop = d.scrollHeight;
}

function addBot(t) {
  const d  = document.getElementById('msgs');
  const el = document.createElement('div');
  el.className = 'msg assistant';
  const f = esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  el.innerHTML = `<div class="avatar">🤖</div><div class="mc">${f}</div>`;
  d.appendChild(el);
  d.scrollTop = d.scrollHeight;
}

function typing() {
  const d  = document.getElementById('msgs');
  const el = document.createElement('div');
  el.className = 'msg assistant';
  el.id = 'typ';
  el.innerHTML = '<div class="avatar">🤖</div><div class="mc"><div class="typing"><div class="td"></div><div class="td"></div><div class="td"></div></div></div>';
  d.appendChild(el);
  d.scrollTop = d.scrollHeight;
}

function rmTyping() {
  const el = document.getElementById('typ');
  if (el) el.remove();
}

function set(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// INIT
// ============================================================
document.getElementById('ui').addEventListener('keydown', e => {
  if (e.key === 'Enter') send();
});

refresh();
addBot("👋 Welcome to your Financial Assistant!\n\n**What I can do:**\n• Log income & expenses from plain English\n• Auto-detect category (15 categories)\n• 4 charts: category, I/E comparison, trend, monthly\n• 50/30/20 rule analysis & spending velocity\n• Per-category budget limits with alerts\n• Recurring/subscription tracking\n• Financial runway calculator\n• Smart money tips based on your data\n• Search & filter transaction history\n• Export to CSV · Dark/Light mode\n\n💬 Try typing **'Earned $2000 salary'** to get started!");
