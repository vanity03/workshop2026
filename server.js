const http = require('http'), fs = require('fs'), path = require('path'), S = require('./scenario');
const O = S.opts.map((o, i) => ({ ...o, id: i }));
let G, C = [], tm;

function reset() {
  clearTimeout(tm);
  G = { on: 0, ph: 1, price: S.price, offer: 0, hrs: S.hrs, f: {}, log: [], n: 0, used: {}, end: null, deal: 0, t0: 0, turn: 'blue', last: { c: 'demand' } };
}
reset();

const good = o => (o.e === 'ok' ? G.price <= S.bmax : o.e === 'racc' ? G.offer >= S.min : o.e === 'pay' ? 0 : o.g);
const hash = o => (o.id * 9301 + G.n * 49297 + 7) % 233280;
const free = o => o.rep || !G.used[o.id];
const cond = o => (!o.need || G.f[o.need]) && (!o.not || !G.f[o.not]) && (o.o === undefined || (o.o > G.offer && o.o < G.price)) && (o.np === undefined || (o.np < G.price && G.price > (o.pa || 0)));

function hand(r) {
  if (!G.on || G.end || r !== G.turn) return [];
  const base = O.filter(o => o.s === r && o.p.includes(G.ph) && free(o) && cond(o));
  const L = base.filter(o => o.to.includes(G.last.c)).sort((a, b) => hash(a) - hash(b));
  const gs = L.filter(good), bs = L.filter(o => !good(o));
  let h = gs.length >= 2 && bs.length ? [gs[0], gs[1], bs[0]] : gs.length >= 2 ? gs.slice(0, 3) : gs.length === 1 ? [gs[0], ...bs.slice(0, 2)] : bs.slice(0, 3);
  if (h.length < 3) h = h.concat(base.filter(o => o.to.includes('*') && !h.includes(o))).slice(0, 3);
  return h.sort((a, b) => hash(b) - hash(a));
}
const finish = why => { G.end = why; clearTimeout(tm); };

function pick(r, id) {
  if (!G.on || G.end || r !== G.turn) return;
  const o = hand(r).find(x => x.id === id);
  if (!o) return;
  const g = good(o) ? 1 : 0;
  G.used[id] = 1; G.n++;
  G.log.push({ r, txt: o.txt, t: o.t, g, w: o.w || '', att: o.att ? S.A[o.att] : null });
  if (o.k) G.f[r[0] + o.k] = 1;
  if (o.o) G.offer = o.o;
  if (o.np) G.price = o.np;
  if (o.reneg) { G.price += 30000; G.deal = 0; }
  if (o.h) G.hrs += o.h;
  if (o.e === 'walk') return finish('walk');
  if (o.e === 'ok') G.deal = G.price;
  if (o.e === 'pay') { G.deal = G.price; G.ph = 3; }
  if (o.e === 'racc') { G.deal = G.offer; G.ph = 3; }
  if (o.e === 'wal') G.ph = 3;
  if (G.ph === 1 && ((G.f.rsample && G.f.rtest) || o.o)) G.ph = 2;
  if (G.ph < 3) G.hrs -= S.hpt;
  if (G.hrs <= 0 && G.ph < 3) { G.hrs = 0; return finish('leak'); }
  G.last = { c: o.c };
  G.turn = r === 'blue' ? 'red' : 'blue';
  if (G.ph === 3 && G.f.rdel && G.f.bver && G.f.rconf) finish('done');
}

function state(r) {
  const f = G.f, d = G.deal, n = v => v.toLocaleString('en');
  const ch = r === 'blue'
    ? [['Vyžiadať vzorku odcudzených dát', f.bask1], ['Vyžiadať test dešifrovania', f.bask2], ['Predĺžiť deadline', f.btime],
       ['Dohoda najviac ' + n(S.bmax) + ' USD', d && d <= S.bmax], ['Overiť dekryptor na teste', f.bver], ['Získať potvrdenie o zmazaní dát', f.rconf]]
    : [['Dokázať, že máte dáta (vzorka)', f.rsample], ['Dokázať dešifrovanie (test)', f.rtest], ['Použiť tlak alebo hrozbu', f.rpress],
       ['Dohoda aspoň ' + n(S.min + 10000) + ' USD', d && d >= S.min + 10000], ['Doručiť dekryptor', f.rdel], ['Potvrdiť zmazanie dát', f.rconf]];
  return JSON.stringify({
    role: r, on: G.on, ph: G.ph, price: G.price, offer: G.offer, hrs: G.hrs, deal: d, intro: S.intro, secret: S.secret[r], turn: G.turn,
    log: G.log.map(l => ({ r: l.r, txt: l.txt, att: l.att })),
    hand: hand(r).map(o => ({ id: o.id, txt: o.txt })),
    ch: ch.map(c => [c[0], !!c[1]]),
    left: G.on ? Math.max(0, S.dur - (Date.now() - G.t0)) : S.dur,
    end: G.end && { txt: S.endTxt[G.end], rep: G.log.filter(l => !l.auto).map(l => ({ r: l.r, txt: l.txt, tn: S.T[l.t][0], ls: S.T[l.t][1], g: l.g, w: l.w })) }
  });
}
const bc = () => C.forEach(c => c.res.write('data:' + state(c.role) + '\n\n'));
setInterval(() => C.forEach(c => c.res.write(': ping\n\n')), 20000);

function start() {
  G.on = 1; G.t0 = Date.now();
  G.log.push({ r: 'red', txt: S.open, t: 'press', g: 1, auto: 1, att: null });
  G.last = { c: 'demand' }; G.turn = 'blue';
  tm = setTimeout(() => { finish('time'); bc(); }, S.dur);
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/events') {
    const role = u.searchParams.get('role') === 'red' ? 'red' : 'blue';
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const c = { role, res }; C.push(c);
    res.write('data:' + state(role) + '\n\n');
    req.on('close', () => { C = C.filter(x => x !== c); });
  } else if (req.method === 'POST') {
    let b = '';
    req.on('data', d => (b += d));
    req.on('end', () => {
      let j = {}; try { j = JSON.parse(b || '{}'); } catch (e) {}
      if (u.pathname === '/pick') pick(j.role, j.id);
      if (u.pathname === '/start' && !G.on) start();
      if (u.pathname === '/reset') reset();
      bc(); res.end('ok');
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }
}).listen(process.env.PORT || 3000, () => console.log('Beží na porte', process.env.PORT || 3000));

module.exports = { state: () => JSON.parse(state('blue')) };
