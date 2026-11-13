// AI TRADE section: a hamster "trades" a simulated market.
// Every number here comes from a seeded random walk; nothing is real market data.
(function () {
  'use strict';

  const root = document.querySelector('.trade-demo');
  if (!root) return;

  const part = (name) => root.querySelector('[data-trade="' + name + '"]');
  const el = {
    pos: part('pos'),
    pnl: part('pnl'),
    tpCount: part('tp-count'),
    coins: part('coins'),
    wins: part('wins'),
    gain: part('gain'),
    candles: part('candles'),
    tpLine: part('tp-line'),
    tpLabel: part('tp-label'),
    entryLine: part('entry-line'),
    entryLabel: part('entry-label'),
    lastLine: part('last-line'),
    price: part('price'),
    log: part('log'),
  };

  const CANDLES = 56;
  const TICKS_PER_CANDLE = 6;
  const TICK_MS = 700;
  const BASE = 165;
  const TAKE_PROFIT = 0.3;
  const STOP_LOSS = -0.2;
  const ENTRY_MOMENTUM = 0.12;
  const MAX_COINS = 10;
  const LOG_LINES = 3;

  // mulberry32: the first frame is the same on every load
  let seed = BASE;
  function rnd() {
    let t = (seed = (seed + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // While the hamster holds a position the walk leans upward, so it earns over time.
  const HOLD_DRIFT = 0.04;
  const step = (p) => p + (rnd() - 0.5) * 0.3 + (BASE - p) * 0.02 + (sim.pos ? HOLD_DRIFT : 0);
  const signed = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
  const pad2 = (v) => String(v).padStart(2, '0');
  const clock = (sec) =>
    pad2(Math.floor(sec / 3600) % 24) + ':' + pad2(Math.floor(sec / 60) % 60) + ':' + pad2(sec % 60);
  const isUp = (c) => c.c >= c.o;

  const sim = {
    candles: [{ o: BASE, h: BASE, l: BASE, c: BASE, mark: '' }],
    ticks: 0,
    shifted: false,
    clock: 9 * 3600,
    pos: null,
    pnl: 0,
    wins: 0,
    tps: 0,
    flash: 0,
    lastGain: 0,
    logs: [],
  };

  function log(tag, text) {
    sim.logs.push({ time: clock(sim.clock), tag: tag, text: text });
    while (sim.logs.length > LOG_LINES) sim.logs.shift();
  }

  // Decide once per closed candle: enter long on two rising candles with enough
  // momentum; exit at the take-profit target, the stop, or on two falling candles.
  function decide() {
    const cs = sim.candles;
    const last = cs[cs.length - 1];
    const prev = cs[cs.length - 2];
    if (!sim.pos) {
      if (prev && isUp(last) && isUp(prev) && last.c - prev.o > ENTRY_MOMENTUM) {
        sim.pos = { entry: last.c, tp: last.c + TAKE_PROFIT };
        last.mark = 'B';
        log('BUY', 'momentum ' + signed(last.c - prev.o) + ' → long @ ' + last.c.toFixed(2) +
          ' · TP ' + sim.pos.tp.toFixed(2));
      }
      return;
    }
    const d = last.c - sim.pos.entry;
    let tag = '';
    let why = '';
    if (last.c >= sim.pos.tp) { tag = 'TP'; why = 'take profit hit'; }
    else if (d <= STOP_LOSS) { tag = 'SL'; why = 'stop loss'; }
    else if (prev && !isUp(last) && !isUp(prev)) { tag = 'SELL'; why = 'trend reversal'; }
    if (!tag) return;
    sim.pnl += d;
    if (tag === 'TP') sim.tps += 1;
    if (d > 0) {
      sim.wins += 1;
      sim.flash = 4;
      sim.lastGain = d;
    }
    sim.pos = null;
    last.mark = tag === 'TP' ? 'TP' : 'S';
    log(tag, why + ' → close @ ' + last.c.toFixed(2) + ' (' + signed(d) + ')');
  }

  function advance() {
    const cs = sim.candles;
    const last = cs[cs.length - 1];
    const next = step(last.c);
    sim.clock += 10;
    sim.ticks += 1;
    sim.shifted = false;
    if (sim.flash > 0) sim.flash -= 1;
    if (sim.ticks > TICKS_PER_CANDLE) {
      decide();
      cs.push({ o: last.c, h: Math.max(last.c, next), l: Math.min(last.c, next), c: next, mark: '' });
      while (cs.length > CANDLES) cs.shift();
      sim.ticks = 1;
      sim.shifted = true;
    } else {
      last.c = next;
      last.h = Math.max(last.h, next);
      last.l = Math.min(last.l, next);
    }
  }

  // --- DOM ---

  const candleEls = [];
  for (let i = 0; i < CANDLES; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'trade-candle';
    const wick = document.createElement('i');
    wick.className = 'trade-wick';
    const body = document.createElement('i');
    body.className = 'trade-body';
    const mark = document.createElement('span');
    mark.className = 'trade-mark';
    mark.hidden = true;
    wrap.append(wick, body, mark);
    el.candles.append(wrap);
    candleEls.push({ wrap: wrap, wick: wick, body: body, mark: mark });
  }

  const MARK_CLASS = { B: 'is-buy', S: 'is-sell', TP: 'is-tp' };
  const TAG_CLASS = { BUY: 'is-buy', TP: 'is-tp' };

  function logRow(time, tag, tagClass, text, live) {
    const row = document.createElement('div');
    row.className = 'trade-log-row' + (live ? ' is-live' : '');
    const t = document.createElement('span');
    t.className = 'trade-log-time';
    t.textContent = time;
    const g = document.createElement('span');
    g.className = 'trade-log-tag ' + tagClass;
    g.textContent = tag;
    const m = document.createElement('span');
    m.className = 'trade-log-text';
    m.textContent = text;
    if (live) {
      const cursor = document.createElement('span');
      cursor.className = 'trade-cursor';
      m.append(cursor);
    }
    row.append(t, g, m);
    return row;
  }

  function render() {
    const cs = sim.candles;
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of cs) {
      lo = Math.min(lo, c.l);
      hi = Math.max(hi, c.h);
    }
    if (sim.pos) hi = Math.max(hi, sim.pos.tp);
    const pad = (hi - lo) * 0.16 || 0.1;
    lo -= pad;
    hi += pad;
    const pct = (v) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
    const y = (v) => pct(v).toFixed(2) + '%';
    const lastIndex = cs.length - 1;
    const fade = Math.max(1, Math.round(cs.length * 0.3));

    candleEls.forEach((ce, i) => {
      const c = cs[i];
      ce.wrap.hidden = !c;
      if (!c) return;
      const top = Math.max(c.o, c.c);
      const bottom = Math.min(c.o, c.c);
      ce.wrap.classList.toggle('is-up', isUp(c));
      ce.wrap.classList.toggle('is-live', i === lastIndex && !sim.shifted);
      ce.wrap.style.opacity = Math.min(1, 0.2 + (0.8 * i) / fade).toFixed(2);
      ce.wick.style.bottom = y(c.l);
      ce.wick.style.height = (pct(c.h) - pct(c.l)).toFixed(2) + '%';
      ce.body.style.bottom = y(bottom);
      ce.body.style.height = (pct(top) - pct(bottom)).toFixed(2) + '%';
      ce.mark.hidden = !c.mark;
      if (c.mark) {
        ce.mark.className = 'trade-mark ' + MARK_CLASS[c.mark];
        ce.mark.textContent = c.mark;
        ce.mark.style.bottom = c.mark === 'B' ? y(c.l) : y(c.h);
      }
    });

    const last = cs[lastIndex];
    const open = sim.pos ? last.c - sim.pos.entry : 0;
    const total = sim.pnl + open;

    el.lastLine.style.bottom = y(last.c);
    el.price.style.bottom = y(last.c);
    el.price.textContent = last.c.toFixed(2);

    const holding = !!sim.pos;
    el.tpLine.hidden = el.tpLabel.hidden = el.entryLine.hidden = el.entryLabel.hidden = !holding;
    if (holding) {
      el.tpLine.style.bottom = el.tpLabel.style.bottom = y(sim.pos.tp);
      el.entryLine.style.bottom = el.entryLabel.style.bottom = y(sim.pos.entry);
      el.tpLabel.textContent = 'TP ' + sim.pos.tp.toFixed(2);
      el.entryLabel.textContent = 'ENTRY ' + sim.pos.entry.toFixed(2);
    }

    el.pos.textContent = holding ? 'LONG @ ' + sim.pos.entry.toFixed(2) : 'FLAT';
    el.pos.classList.toggle('is-on', holding);
    el.pnl.textContent = signed(total);
    el.pnl.classList.toggle('is-on', total >= 0);
    el.tpCount.textContent = String(sim.tps);

    const coins = Math.min(sim.wins, MAX_COINS);
    while (el.coins.children.length < coins) {
      const coin = document.createElement('i');
      coin.className = 'trade-coin';
      el.coins.append(coin);
    }
    el.wins.textContent = '×' + sim.wins;
    el.gain.textContent = signed(sim.lastGain);
    el.gain.classList.toggle('is-on', sim.flash > 0);

    const momentum = last.c - cs[Math.max(0, lastIndex - 2)].o;
    const thinking = holding
      ? 'holding long · unrealized ' + signed(open) + ' · TP まで ' + Math.max(0, sim.pos.tp - last.c).toFixed(2)
      : 'scanning ' + cs.length + ' bars · momentum ' + signed(momentum) + ' · waiting for entry';
    const rows = sim.logs.map((l) => logRow(l.time, l.tag, TAG_CLASS[l.tag] || '', l.text, false));
    rows.push(logRow(clock(sim.clock), 'HAM', 'is-buy', thinking, true));
    el.log.replaceChildren(...rows);
  }

  // Fill the chart before the first paint so it never starts empty.
  for (let i = 0; i < CANDLES * TICKS_PER_CANDLE; i++) advance();
  sim.shifted = false;
  sim.flash = 0;
  render();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(() => {
    if (document.hidden) return;
    advance();
    render();
  }, TICK_MS);
})();
