const http = require('http'), fs = require('fs'), path = require('path'), S = require('./scenario');
const O = S.opts.map((o, i) => ({ ...o, id: i }));
let G, C = [], tm;

function reset() {
  clearTimeout(tm);
  G = { on: 0, ph: 1, price: S.price, offer: 0, hrs: S.hrs, f: {}, log: [], n: 0, used: {}, end: null, deal: 0, t0: 0 };
}
reset();

const good = o => (o.e === 'accept' ? G.offer >= S.min : o.g);
const hash = o => (o.id * 9301 + G.n * 49297 + 7) % 233280;
const avail = r => O.filter(o => o.s === r && o.p.includes(G.ph) && !G.used[o.id] && (o.e !== 'accept' || G.offer > 0)).sort((a, b) => hash(a) - hash(b));
function hand(r) {
  const l = avail(r), g = l.find(good);
  if (!g) return l.slice(0, 3);
  return [g, ...l.filter(o => o !== g).slice(0, 2)].sort((a, b) => hash(b) - hash(a));
}
const finish = why => { G.end = why; clearTimeout(tm); };

function pick(r, id) {
  if (!G.on || G.end) return;
  const o = hand(r).find(x => x.id === id);
  if (!o) return;
  G.used[id] = 1; G.n++;
  G.log.push({ r, txt: o.txt, t: o.t, g: good(o) ? 1 : 0, w: o.w || '' });
  if (o.k) G.f[r[0] + o.k] = 1;
  if (o.o) G.offer = o.o;
  if (o.d) G.price = Math.round(G.price * (1 - o.d / 100) / 1000) * 1000;
  if (o.h) G.hrs += o.h;
  if (o.e === 'walk') return finish('walk');
  if (o.e === 'accept') { G.deal = G.offer; G.ph = 3; }
  if (o.e === 'pay') { G.deal = G.price; G.ph = 3; }
  if (G.ph === 1 && G.f.rsample && G.f.rtest) G.ph = 2;
  if (G.hrs <= 0) return finish('leak');
  if (G.ph === 3 && G.f.rdel && G.f.bver) finish('done');
}

function state(r) {
  const f = G.f, d = G.deal, n = v => v.toLocaleString('en');
  const ch = r === 'blue'
    ? [['Vyžiadať vzorku odcudzených dát', f.bask1], ['Vyžiadať test dešifrovania', f.bask2], ['Predĺžiť deadline', f.btime],
       ['Dohoda najviac ' + n(S.bmax) + ' USD', d && d <= S.bmax], ['Overiť decryptor na teste', f.bver]]
    : [['Dokázať, že máte dáta (vzorka)', f.rsample], ['Dokázať dešifrovanie (test)', f.rtest], ['Použiť tlak alebo hrozbu', f.rpress],
       ['Dohoda aspoň ' + n(S.min + 10000) + ' USD', d && d >= S.min + 10000], ['Doručiť decryptor', f.rdel]];
  return JSON.stringify({
    role: r, on: G.on, ph: G.ph, price: G.price, offer: G.offer, hrs: G.hrs, deal: d, intro: S.intro, secret: S.secret[r],
    log: G.log.map(l => ({ r: l.r, txt: l.txt })),
    hand: G.on && !G.end ? hand(r).map(o => ({ id: o.id, txt: o.txt })) : [],
    ch: ch.map(c => [c[0], !!c[1]]),
    left: G.on ? Math.max(0, S.dur - (Date.now() - G.t0)) : S.dur,
    end: G.end && { txt: S.endTxt[G.end], rep: G.log.map(l => ({ r: l.r, txt: l.txt, tn: S.T[l.t][0], ls: S.T[l.t][1], g: l.g, w: l.w })) }
  });
}
const bc = () => C.forEach(c => c.res.write('data:' + state(c.role) + '\n\n'));
setInterval(() => C.forEach(c => c.res.write(': ping\n\n')), 20000);

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
      if (u.pathname === '/start' && !G.on) { G.on = 1; G.t0 = Date.now(); tm = setTimeout(() => { finish('time'); bc(); }, S.dur); }
      if (u.pathname === '/reset') reset();
      bc(); res.end('ok');
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }
}).listen(process.env.PORT || 3000, () => console.log('Beží na porte', process.env.PORT || 3000));
