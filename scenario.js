// SCENÁR A SPRÁVY. Tu upravuješ texty, ceny a logiku nadväzovania.
// o(strana, fázy, na_čo_odpovedá, kategória_správy, taktika, správna?, text, efekty)
//  to = kategórie poslednej správy protistrany, na ktoré môže táto správa nadväzovať ('*' = všeobecná záložná)
//  c  = kategória samotnej správy (podľa nej sa vyberú odpovede protistrany)
// Efekty: k = odškrtne úlohu, o = ponuka Blue Teamu, np = nová cena útočníka, h = zmena deadlinu v hodinách,
//         att = príloha, e = walk | ok | pay | racc | wal, w = prečo je to zlé, rep = dá sa použiť opakovane
const B = 'blue', R = 'red';
const o = (s, p, to, c, t, g, txt, ex = {}) => ({ s, p, to, c, t, g, txt, ...ex });

const A = {
  files: { n: 'vzorka_odcudzenych_dat.zip', sz: '4,2 MB', l: [
    '/evidencia_studentov/   18 412 súborov', '/mzdy_zamestnanci/      2 096 súborov', '/vyskumne_projekty/     7 540 súborov', '',
    'evidencia_studentov_2025.xlsx (ukážka)', 'ID          Priezvisko  Fakulta  Ročník',
    'S-25-10482  Kováč       PF       2', 'S-25-10517  Hudáková    FF       1', 'S-25-11093  Tóth        PrF      3', '... ďalších 34 981 riadkov'] },
  locked: { n: 'test_1.docx.locked, test_2.xlsx.locked', sz: '150 kB', l: [
    'test_1.docx.locked    38 kB', 'test_2.xlsx.locked   112 kB', '(zašifrované ransomvérom)'] },
  sens: { n: 'studenti_osobne_udaje.csv', sz: '8,9 MB', l: ['Súbor s osobnými údajmi študentov', '(v realite by sa takýto súbor nikdy neposlal)'] },
  dec: { n: 'test_1.docx, test_2.xlsx', sz: '150 kB', l: [
    'test_1.docx    ✔ dešifrované', 'test_2.xlsx    ✔ dešifrované', '', 'Náhľad test_1.docx:', 'Zápisnica zo zasadnutia katedry, 14. 3. 2025 ...', 'Náhľad test_2.xlsx: rozvrh skúšok ZS 2025/26'] },
  wallet: { n: 'platba.txt', sz: '1 kB', l: [
    'Suma: dohodnutá cena v BTC', 'Adresa: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Po 2 potvrdeniach pošleme dekryptor.'] },
  btc: { n: 'potvrdenie_platby.png', sz: '64 kB', l: ['TX ID: 9f2c41b7e0a35d8c...e7a0b3', 'Potvrdenia: 2/2', 'Stav: ✔ pripísané'] },
  decryptor: { n: 'dekryptor_skola_v3.zip', sz: '1,8 MB', l: ['dekryptor.exe', 'kluc.key', 'NAVOD.txt'] },
  del: { n: 'potvrdenie_zmazania.txt', sz: '2 kB', l: ['Zmazané: 29 048 súborov z našich serverov', 'Dáta nebudú zverejnené ani predané.'] }
};

module.exports = {
  A,
  price: 250000, min: 90000, bmax: 125000, hrs: 72, hpt: 3, dur: 20 * 60 * 1000,
  intro: 'Vysoká škola: útočníci zašifrovali servery vrátane evidencie študentov a vyhrážajú sa únikom dát. Požadujú 250 000 USD, deadline 72 hodín. Strany sa striedajú, každá odpovedá na poslednú správu protistrany.',
  open: 'Vaše servery sú zašifrované a dáta sme skopírovali. Cena za dešifrovanie a zmazanie dát je 250 000 USD v BTC. Máte 72 hodín, potom dáta zverejníme.',
  secret: {
    blue: 'Schválený strop: max. 125 000 USD. Poisťovňa sa ozve do 48 h. Toto nikdy nepovedz útočníkovi.',
    red: 'Tvoj limit: nie menej ako 90 000 USD, inak sa ti to neoplatí. Čakajú ťa ďalšie obete, takže čas ťa tlačí tiež.'
  },
  endTxt: {
    walk: 'Blue Team ukončil rokovanie. Útočníci neinkasovali nič a prehrali. Škola však ostáva bez dát.',
    done: 'Dohoda uzavretá, zaplatená a splnená: dekryptor funguje a dáta sú zmazané.',
    leak: 'Deadline vypršal. Dáta boli zverejnené.',
    time: 'Čas vypršal bez úplného dokončenia.'
  },
  T: {
    kind: ['Being kind', 'Slušnosť udrží rozhovor a tempo. Obete ju používajú najčastejšie (cca 14 % správ).'],
    eq: ['Being equal', 'Rámcovanie ako spoločná práca. Dobré na budovanie vzťahu.'],
    cred: ['Being credible', 'Najčastejšia taktika útočníkov (24 %): dôkaz o dátach a dešifrovaní. V prípadoch s platbou bola použitá viac.'],
    emo: ['Emotional appeal', 'Emócie v ransomvér chatoch fungujú slabo; rokovanie je skôr obchodné.'],
    intim: ['Intimidation', 'Útočníci hrozia únikom dát alebo ďalším útokom (reputácia, ekonomika). Obete takmer nikdy.'],
    restr: ['Imposing a restriction', 'Obete získavajú čas odvolaním sa na poisťovňu, banku alebo board.'],
    press: ['Direct pressure', 'Opakované "máte rozhodnutie?" Typické pre útočníkov, častejšie pri neplatiacich obetiach.'],
    legit: ['Legitimizing', 'Odvolanie sa na pravidlá, zákon alebo bankovú compliance.'],
    exch: ['Exchanging', 'Dávam-dostávam: zľava za rýchlu platbu, ponuka za dôkaz. Najčastejšia taktika obetí (24 %).'],
    rat: ['Rational persuasion', 'Logické argumenty a dáta (financie školy). Častejšie u obetí, ktoré nakoniec nezaplatili.']
  },
  opts: [
    // ===== BLUE: fáza 1-2 =====
    o(B, [1], ['demand', 'press', 'threat', 'stall', 'ack'], 'askproof', 'exch', 1, 'Dobrý deň, rozumieme situácii. Skôr než budeme rokovať, pošlite dôkaz, že naozaj máte naše dáta.', { k: 'ask1' }),
    o(B, [1], ['proof', 'ack'], 'sendfiles', 'exch', 1, 'Vzorku sme dostali. Dokážte teraz aj dešifrovanie: v prílohe sú 2 testovacie súbory, odšifrujte ich.', { k: 'ask2', att: 'locked' }),
    o(B, [1], ['reqfiles', 'demand'], 'sendfiles', 'exch', 1, 'Aby sme overili, že viete dešifrovať, posielame 2 nevýznamné testovacie súbory.', { k: 'ask2', att: 'locked' }),
    o(B, [1], ['demand', 'press', 'threat', 'stall', 'proof', 'dec', 'ack'], 'stall', 'restr', 1, 'Rozhodnutie musí schváliť rektor a poisťovňa. Potrebujeme o 24 hodín viac.', { k: 'time', h: 24 }),
    o(B, [1], ['proof'], 'ack', 'kind', 1, 'Ďakujeme za vzorku, naši technici ju teraz preveria.'),
    o(B, [1, 2], ['demand', 'press', 'threat', 'stall', 'proof'], 'threat', 'intim', 0, 'Nahlásime vás polícii a vypátrame vás!', { h: -12, w: 'Obete takmer nikdy nehrozia. Útočník to ignoruje alebo stupňuje tlak.' }),
    o(B, [1, 2], ['demand', 'press', 'threat', 'stall', 'dec', 'cut', 'disc'], 'paid', 'exch', 0, 'Zaplatíme požadovanú sumu hneď. Kam poslať peniaze?', { e: 'pay', k: 'pay', w: 'Platba bez proof-of-life alebo bez vyjednávania: nevieš, či dešifrovanie funguje a zľavy sú bežné.' }),
    o(B, [1], ['demand', 'press', 'threat'], 'ack', 'emo', 0, 'Prosím, pomôžte nám, sme zúfalí a študenti prídu o všetko!', { w: 'Emocionálny apel útočníka nezmäkčí, len mu ukáže, že máš páku na seba.' }),
    o(B, [1], ['demand', 'press', 'threat', 'proof'], 'cut', 'rat', 0, 'Dáta máme zálohované, vás nepotrebujeme.', { h: -12, w: 'Bluf, ktorý sa dá ľahko vyvrátiť. Strácaš dôveryhodnosť.' }),
    o(B, [1], ['reqfiles'], 'sendfiles', 'exch', 0, 'Pošleme súbor s osobnými údajmi študentov, nech vidíte, že je to naozaj naše.', { att: 'sens', w: 'Nikdy neposielaj skutočné citlivé dáta. Pre test sa používajú nevýznamné súbory.' }),
    o(B, [1, 2], ['dec'], 'offer', 'rat', 1, 'Dešifrovanie funguje, ďakujeme. Sme verejná škola a nemáme komerčný rozpočet. Môžeme ponúknuť 40 000 USD.', { o: 40000 }),
    o(B, [1, 2], ['dec'], 'offer', 'exch', 1, 'Test prebehol v poriadku. Ak sa dohodneme ešte dnes, ponúkame 70 000 USD.', { o: 70000 }),
    o(B, [1, 2], ['dec'], 'stall', 'restr', 1, 'Výsledok testu musíme interne overiť. Ozveme sa o niekoľko hodín.', { k: 'time', h: 12 }),
    // bargaining: ponuky (len vyššie než posledná a nižšie než cena útočníka)
    o(B, [2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'offer', 'rat', 1, 'Naša škola je verejná inštitúcia, nie firma. Viac než 40 000 USD nevieme získať.', { o: 40000 }),
    o(B, [2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'offer', 'exch', 1, 'Ak sa dohodneme do zajtra, ponúkame 60 000 USD.', { o: 60000 }),
    o(B, [2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'offer', 'exch', 1, 'Ponúkame 80 000 USD, ak dostaneme aj písomné potvrdenie o zmazaní dát.', { o: 80000 }),
    o(B, [2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'offer', 'rat', 1, 'Podľa našich účtov vieme zaplatiť najviac 100 000 USD. Viac škola reálne nemá.', { o: 100000 }),
    o(B, [2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'offer', 'exch', 1, 'Posledná ponuka: 115 000 USD, zaplatíme hneď po dohode.', { o: 115000 }),
    o(B, [1, 2], ['press', 'threat', 'cut', 'disc', 'stall'], 'stall', 'restr', 1, 'Banka musí schváliť transakciu v BTC. Potrebujeme 24 hodín.', { k: 'time', h: 24 }),
    o(B, [1, 2], ['press', 'threat', 'cut', 'disc'], 'stall', 'legit', 1, 'Podľa pravidiel školy môžeme platiť iba cez schválený postup so zmluvou. To si vyžaduje čas.', { h: 12 }),
    o(B, [1, 2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'ack', 'kind', 1, 'Rozumieme, že čas tlačí aj vás. Chceme sa dohodnúť rýchlo a férovo.'),
    o(B, [1, 2], ['press', 'threat', 'stall', 'ack', 'cut', 'disc'], 'ack', 'eq', 1, 'Obaja chceme, aby sa to skončilo čo najskôr. Poďme to vyriešiť spolu.'),
    o(B, [1, 2], ['press', 'threat', 'stall', 'cut', 'disc', 'offer'], 'threat', 'intim', 0, 'Ste zlodeji! Nedáme vám ani cent.', { h: -12, w: 'Útok bez argumentov: útočník tlačí ďalej a skracuje čas.' }),
    o(B, [2], ['press', 'cut', 'disc', 'stall'], 'offer', 'exch', 0, 'Náš skutočný limit je 120 000 USD, dohodnime sa na tom.', { o: 120000, w: 'Prezradil si strop rozpočtu. Priestor na vyjednávanie zmizol.' }),
    o(B, [2], ['press', 'threat', 'cut', 'disc', 'stall'], 'cut', 'press', 0, 'Končíme rozhovor, nezaplatíme nič.', { e: 'walk', w: 'Odchod je krajný krok. Útočníci neinkasujú, ale škola ostáva bez dát.' }),
    o(B, [2], ['disc'], 'ok', 'exch', 1, 'Súhlasíme s touto cenou. Dohodnuté.', { e: 'ok', w: 'Prijal si cenu nad schválený rozpočet.' }),
    // ===== BLUE: fáza 3 =====
    o(B, [3], ['wallet', 'press'], 'paid', 'cred', 1, 'Platba odoslaná, potvrdenie v prílohe.', { k: 'pay', att: 'btc' }),
    o(B, [3], ['wallet', 'press'], 'cut', 'press', 0, 'Najprv pošlite dekryptor, potom zaplatíme.', { w: 'Porušuješ dohodu. Útočník to berie ako nedôveru a môže dohodu zrušiť.' }),
    o(B, [3], ['deliv', 'ack', 'conf'], 'verif', 'rat', 1, 'Dekryptor spúšťame najprv na izolovanom testovacom serveri, až potom v produkcii.', { k: 'ver', need: 'rdel' }),
    o(B, [3], ['cut', 'stall'], 'press', 'rat', 1, 'Dohodli sme sa na konkrétnej cene a tá je uhradená. Trváme na doručení dekryptora.', { not: 'rdel' }),
    o(B, [3], ['deliv'], 'threat', 'intim', 0, 'Zverejníme tento chat na sociálnych sieťach.', { w: 'Útočník pozastaví podporu a dekryptor nedostaneš.' }),
    o(B, [3], ['deliv'], 'cut', 'exch', 0, 'Skúsme ešte spätne vyjednať zľavu.', { w: 'Po platbe už nemáš žiadnu páku.' }),
    o(B, [3], ['deliv'], 'ack', 'kind', 1, 'Ďakujeme, overujeme funkčnosť.'),
    o(B, [3], ['ack'], 'askdel', 'exch', 1, 'Pošlite prosím písomné potvrdenie, že dáta zmažete a nezverejníte.', { need: 'rdel' }),
    // ===== RED: fáza 1-2 =====
    o(R, [1], ['askproof'], 'proof', 'cred', 1, 'Tu je vzorka odcudzených dát: zoznam adresárov a ukážka z evidencie študentov. Zvyšok dostanete po platbe.', { k: 'sample', att: 'files' }),
    o(R, [1], ['askproof'], 'press', 'press', 0, 'Žiadne dôkazy nedáme. Platíte, alebo dáta zverejníme.', { w: 'Bez dôkazu dôveryhodnosti obete neplatia a rokovanie sa zasekne.' }),
    o(R, [1], ['askproof'], 'disc', 'exch', 0, 'Zľava 60 % hneď, len zaplaťte.', { np: 100000, w: 'Zľavil si bez toho, aby ťa niekto tlačil. Ústupky si šetri na bargaining.' }),
    o(R, [1], ['askproof', 'stall', 'threat'], 'threat', 'intim', 0, 'Prídeme za vašimi študentmi osobne.', { w: 'Fyzické hrozby nie sú pre ransomvér typické a priťahujú políciu.' }),
    o(R, [1, 2], ['stall', 'threat', 'ack'], 'press', 'press', 1, 'Čakáme na vašu odpoveď. Deadline sa blíži.', { k: 'press' }),
    o(R, [1, 2], ['stall', 'ack', 'threat', 'offer'], 'threat', 'intim', 1, 'O 48 hodín zverejníme dáta študentov a zaútočíme znova.', { k: 'press', h: -12 }),
    o(R, [1], ['stall', 'ack', 'threat'], 'reqfiles', 'cred', 1, 'Ak chcete dôkaz o dešifrovaní, pošlite 2 menšie súbory a my ich odšifrujeme.', { not: 'rtest' }),
    o(R, [1], ['stall', 'ack', 'threat'], 'proof', 'cred', 1, 'Pre istotu posielame vzorku dát, aby ste videli, že nebluffujeme.', { k: 'sample', att: 'files', not: 'rsample' }),
    o(R, [1, 2], ['sendfiles'], 'dec', 'cred', 1, 'Súbory sú odšifrované, sú v prílohe. Dešifrovanie funguje.', { k: 'test', att: 'dec' }),
    o(R, [1, 2], ['sendfiles'], 'press', 'press', 0, 'Súbory sme dostali, ale odšifrujeme ich až po platbe.', { w: 'Bez dôkazu dešifrovania obete neplatia.' }),
    o(R, [1, 2], ['stall', 'threat'], 'ack', 'kind', 1, 'Rozumieme. Radi sa dohodneme rýchlo a profesionálne.'),
    o(R, [1, 2], ['cut'], 'press', 'rat', 1, 'Ak máte zálohy, prečo ešte rokujeme? Ponuka platí len obmedzený čas.', { k: 'press' }),
    o(R, [1, 2], ['threat', 'stall', 'offer', 'ack'], 'cut', 'emo', 0, 'Vy ste ale úbohí. Mali ste si lepšie chrániť systémy.', { w: 'Poníženie nepomáha. Zvyšuje odpor, nie ochotu platiť.' }),
    // bargaining
    o(R, [1, 2], ['offer'], 'cut', 'rat', 1, 'Naša cena je primeraná. Verejné rozpočty školy idú do miliónov.'),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Ak zaplatíte do 24 hodín, dáme 10 % zľavu.', { np: 225000 }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Vidíme snahu, znižujeme na 200 000 USD.', { np: 200000 }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Dobre, 175 000 USD, ale ďalej už ťažko.', { np: 175000 }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Posledné ústupky: 150 000 USD.', { np: 150000 }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Znížime na 125 000 USD, ak zaplatíte dnes.', { np: 125000 }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 1, 'Nižšie ako 105 000 USD nepôjdeme.', { np: 105000 }),
    o(R, [1, 2], ['offer'], 'wallet', 'exch', 1, 'Dohodnuté, ponuku prijímame. Platbu pošlite na adresu v prílohe.', { e: 'racc', att: 'wallet', w: 'Prijal si ponuku pod svoj limit. Mohol si ešte tlačiť.' }),
    o(R, [1, 2], ['offer'], 'disc', 'exch', 0, 'Dobre, zľava 56 % hneď, len zaplaťte.', { np: 110000, pa: 200000, w: 'Zbytočne si ukázal slabosť. Obete čakajú na ďalšiu zľavu.' }),
    o(R, [1, 2], ['offer'], 'threat', 'intim', 1, 'Takáto ponuka je urážka. O 48 hodín zverejníme dáta.', { k: 'press', h: -12 }),
    o(R, [1, 2], ['offer'], 'stall', 'restr', 1, 'Musím to prekonzultovať s tímom, vrátim sa neskôr.'),
    o(R, [1, 2], ['stall', 'ack'], 'ack', 'cred', 1, 'Po platbe dostanete dekryptor aj správu, ako sme sa dostali do siete.'),
    o(R, [2], ['ok'], 'wallet', 'cred', 1, 'Dohodnuté. Platbu pošlite na adresu v prílohe.', { e: 'wal', att: 'wallet' }),
    o(R, [2], ['ok'], 'cut', 'exch', 0, 'Cena sa práve zvýšila o 30 000 USD.', { reneg: 1, w: 'Zmena dohody po súhlase ničí dôveru a predlžuje rokovanie.' }),
    // ===== RED: fáza 3 =====
    o(R, [3], ['paid', 'press', 'ack'], 'deliv', 'cred', 1, 'Platba prijatá. Tu je dekryptor s návodom.', { k: 'del', att: 'decryptor', need: 'bpay', not: 'rdel' }),
    o(R, [3], ['paid'], 'cut', 'exch', 0, 'Dekryptor pošleme, keď zaplatíte ešte 50 000 USD navyše.', { w: 'Porušíš dohodu a poškodíš "brand" skupiny. Ďalšie obete nebudú platiť.' }),
    o(R, [3], ['paid'], 'stall', 'restr', 0, 'Dekryptor pošleme zajtra, teraz nemáme čas.', { w: 'Zdržiavanie po platbe ničí dôveru.' }),
    o(R, [3], ['verif', 'askdel', 'ack', 'press', 'stall'], 'conf', 'cred', 1, 'Rado sa stalo. Dáta zmažeme a potvrdenie máte v prílohe.', { k: 'conf', att: 'del', need: 'rdel' }),
    o(R, [3], ['verif'], 'ack', 'kind', 1, 'Radi pomôžeme, ak by sa objavil problém.', { need: 'rdel' }),
    o(R, [3], ['ack'], 'press', 'press', 1, 'Čakáme na platbu. Adresa je v prílohe.', { att: 'wallet', not: 'bpay' }),
    o(R, [3], ['ack', 'press', 'cut'], 'press', 'press', 1, 'Platba zatiaľ nedorazila. Adresa je v prílohe.', { att: 'wallet', not: 'bpay' }),
    o(R, [3], ['ack', 'press', 'cut'], 'press', 'press', 1, 'Bez prijatej platby dekryptor neposielame.', { not: 'bpay' }),
    o(R, [3], ['paid', 'press', 'ack'], 'stall', 'restr', 1, 'Platbu ešte overujeme v sieti, dekryptor pošleme o chvíľu.', { need: 'bpay', not: 'rdel' }),
    o(R, [3], ['press', 'ack', 'cut'], 'stall', 'restr', 0, 'Dekryptor pošleme, až keď prejde ďalšia interná kontrola.', { need: 'bpay', not: 'rdel', w: 'Zdržiavanie po zaplatení ničí dôveru a "brand" skupiny.' }),
    o(R, [3], ['cut'], 'threat', 'intim', 1, 'Ak nezaplatíte, dekryptor nedostanete a dáta zverejníme.', { not: 'bpay' }),
    o(R, [3], ['ack', 'press', 'cut'], 'press', 'press', 1, 'Platba nie je pripísaná. Pošlite ju na adresu v prílohe.', { att: 'wallet', not: 'bpay' }),
    o(R, [3], ['verif', 'askdel', 'ack', 'press', 'stall'], 'stall', 'restr', 0, 'Potvrdenie o zmazaní pošleme neskôr, teraz na to nie je čas.', { need: 'rdel', not: 'rconf', w: 'Bez potvrdenia nemajú obete istotu. Zdržiavanie po zaplatení poškodzuje "brand" skupiny.' }),
    o(B, [3], ['ack', 'verif', 'stall', 'cut'], 'press', 'press', 1, 'Zatiaľ sme nedostali potvrdenie o zmazaní dát. Pošlite ho prosím.', { need: 'rdel', not: 'rconf' }),
    o(B, [3], ['ack', 'verif', 'stall', 'cut'], 'press', 'legit', 1, 'Bez potvrdenia o zmazaní dát nevieme dohodu uzavrieť.', { need: 'rdel', not: 'rconf' }),
    o(R, [3], ['threat', 'cut'], 'press', 'legit', 1, 'Dohoda je uzavretá a zaplatená. Ďalšie zľavy ani hrozby na tom nič nezmenia.', { need: 'rdel' }),
    o(R, [3], ['threat', 'cut'], 'threat', 'intim', 1, 'Ak budete pokračovať, ukončíme podporu a ďalšie rokovanie s vami.', { need: 'rdel' }),
    // ===== záložné =====
    o(B, [1, 2], ['*'], 'ack', 'restr', 1, 'Rozumieme. Dajte nám chvíľu, poradíme sa v tíme.'),
    o(B, [1, 2], ['*'], 'ack', 'kind', 1, 'Ďakujeme za správu. Potrebujeme si ju interne preveriť.'),
    o(B, [1, 2], ['*'], 'ack', 'eq', 1, 'Berieme na vedomie. Pracujeme na tom a ozveme sa.'),
    o(R, [1, 2], ['*'], 'press', 'press', 1, 'Pripomíname, že deadline beží. Máte rozhodnutie?', { k: 'press' }),
    o(R, [1, 2], ['*'], 'press', 'press', 1, 'Čas beží. Kedy očakávať vašu odpoveď?', { k: 'press' }),
    o(R, [1, 2], ['*'], 'press', 'press', 1, 'Zatiaľ sme nedostali žiadny konkrétny návrh. Ako ďalej?', { k: 'press', ifx: g => !g.offer }),
    o(B, [3], ['*'], 'ack', 'kind', 1, 'Ďakujeme, dajte nám chvíľu na overenie.'),
    o(B, [3], ['*'], 'ack', 'kind', 1, 'Berieme na vedomie, ďakujeme.'),
    o(R, [3], ['*'], 'ack', 'kind', 1, 'Ak by niečo nefungovalo, sme tu na podporu.', { need: 'rdel', ifx: g => g.f.rconf }),
    o(R, [3], ['*'], 'ack', 'kind', 1, 'Dajte vedieť, keď budete mať výsledok overenia.', { need: 'rdel', ifx: g => g.f.rconf })
  ]
};
