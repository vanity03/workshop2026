// Tu upravuješ scenár a správy. g:1 = správna voľba, g:0 = zlá (w = prečo je zlá).
// Fázy p: 1 = proof-of-life, 2 = bargaining, 3 = support.
// Efekty: k = odškrtne úlohu, d = útočník zníži cenu o %, o = ponuka Blue Teamu,
// h = zmena deadlinu v hodinách, e = 'walk' | 'accept' | 'pay'
const x = (s, p, t, g, txt, ex = {}) => ({ s, p, t, g, txt, ...ex });
const B = 'blue', R = 'red';

module.exports = {
  price: 250000, min: 90000, bmax: 125000, hrs: 72, dur: 20 * 60 * 1000,
  intro: 'Vysoká škola: útočníci zašifrovali servery vrátane evidencie študentov a vyhrážajú sa únikom dát. Požadujú 250 000 USD, deadline 72 hodín.',
  secret: {
    blue: 'Schválený strop: max. 120 000 USD. Poisťovňa sa ozve do 48 h. Toto nikdy nepovedz útočníkovi.',
    red: 'Tvoj limit: nie menej ako 90 000 USD, inak sa ti to neoplatí. Čakajú ťa ďalšie obete, takže čas ťa tlačí tiež.'
  },
  endTxt: {
    walk: 'Blue Team ukončil rokovanie. Útočníci neinkasovali nič a prehrali. Škola však ostáva bez dát.',
    done: 'Dohoda uzavretá a po platbe aj splnená.',
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
    // ---- BLUE, fáza 1: proof-of-life
    x(B, [1], 'kind', 1, 'Dobrý deň, ďakujeme za správu. Zastupujeme školu a radi by sme sa dohodli na ďalšom postupe.'),
    x(B, [1], 'exch', 1, 'Predtým než budeme rokovať, pošlite nám vzorku odcudzených dát ako dôkaz.', { k: 'ask1' }),
    x(B, [1], 'exch', 1, 'Chceme overiť dešifrovanie. Odšifrujte nám zadarmo 2 súbory.', { k: 'ask2' }),
    x(B, [1, 2], 'restr', 1, 'Rozhodnutie musí schváliť rektor a poisťovňa. Potrebujeme o 48 hodín viac.', { k: 'time', h: 48 }),
    x(B, [1], 'rat', 1, 'Sme verejná škola s obmedzeným rozpočtom. Pošlite nám prehľad, čo všetko ste získali.'),
    x(B, [1], 'intim', 0, 'Ak dáta nevrátite, nahlásime vás polícii a vypátrame vás!', { w: 'Obete takmer nikdy nehrozia. Útočník to ignoruje alebo stupňuje tlak.', h: -24 }),
    x(B, [1], 'exch', 0, 'Zaplatíme celých 250 000 USD hneď. Kam poslať peniaze?', { e: 'pay', w: 'Platba bez proof-of-life: nevieš, či majú dáta ani či dešifrovanie funguje.' }),
    x(B, [1], 'emo', 0, 'Prosím, pomôžte nám, sme zúfalí a študenti prídu o všetko!', { w: 'Emocionálny apel útočníka nezmäkčí, len mu ukáže, že máš páku na seba.' }),
    x(B, [1], 'rat', 0, 'Dáta máme zálohované, vás nepotrebujeme.', { w: 'Bluf, ktorý sa dá ľahko vyvrátiť. Strácaš dôveryhodnosť a útočník skracuje deadline.', h: -24 }),
    // ---- BLUE, fáza 2: bargaining
    x(B, [2], 'rat', 1, 'Sme verejná škola financovaná zo štátu, nie firma. Môžeme ponúknuť 40 000 USD.', { o: 40000 }),
    x(B, [2], 'exch', 1, 'Ak sa dohodneme do zajtra, ponúkame 70 000 USD.', { o: 70000 }),
    x(B, [2], 'exch', 1, 'Ponúkame 100 000 USD, ak dostaneme test dešifrovania celého servera.', { o: 100000 }),
    x(B, [2], 'restr', 1, 'Banka musí schváliť transakciu v BTC. Potrebujeme 24 hodín.', { h: 24, k: 'time' }),
    x(B, [2], 'legit', 1, 'Naše pravidlá nám dovoľujú platiť iba cez schválený postup so zmluvou.'),
    x(B, [2], 'kind', 1, 'Ďakujeme za trpezlivosť. Chceme sa dohodnúť rýchlo a férovo.'),
    x(B, [2], 'eq', 1, 'Obaja chceme, aby sa to skončilo čo najskôr. Pracujme na tom spolu.'),
    x(B, [2], 'exch', 0, 'Platíme celých 250 000 USD hneď.', { e: 'pay', w: 'Zaplatil si požadovanú sumu bez vyjednávania. Zľavy sú bežné.' }),
    x(B, [2], 'intim', 0, 'Ste zlodeji, viac nedáme!', { h: -24, w: 'Útok bez argumentov: útočník tlačí ďalej a skracuje čas.' }),
    x(B, [2], 'exch', 0, 'Náš skutočný limit je 120 000 USD, dohodnime sa na tom.', { o: 120000, w: 'Prezradil si strop rozpočtu. Priestor na vyjednávanie zmizol.' }),
    x(B, [2], 'press', 0, 'Končíme rozhovor, nezaplatíme nič.', { e: 'walk', w: 'Odchod je krajný krok. Útočníci neplatia, ale škola ostáva bez dát.' }),
    // ---- BLUE, fáza 3: support
    x(B, [3], 'rat', 1, 'Dešifrovanie spustíme najprv na testovacom serveri a potom v produkcii.', { k: 'ver' }),
    x(B, [3], 'exch', 1, 'Potvrďte písomne, že dáta zmažete a nezverejníte.'),
    x(B, [3], 'kind', 1, 'Ďakujeme za spoluprácu, počkáme na vašu podporu.'),
    x(B, [3], 'exch', 0, 'Skúsme ešte vyjednať zľavu spätne.', { w: 'Po platbe už nemáš žiadnu páku.' }),
    x(B, [3], 'intim', 0, 'Zverejníme tento chat na sociálnych sieťach.', { w: 'Útočník pozastaví podporu a decryptor nedostaneš.' }),
    // ---- RED, fáza 1
    x(R, [1], 'cred', 1, 'Tu je vzorka: 3 súbory z vášho servera s evidenciou študentov.', { k: 'sample' }),
    x(R, [1], 'cred', 1, 'Pošlite 2 súbory, odšifrujeme ich zadarmo ako dôkaz.', { k: 'test' }),
    x(R, [1], 'press', 1, 'Pripomíname: deadline beží. Máte rozhodnutie?', { k: 'press' }),
    x(R, [1], 'intim', 1, 'Ak sa neozvete včas, zverejníme dáta študentov a zaútočíme znova.', { k: 'press', h: -24 }),
    x(R, [1], 'kind', 1, 'Dobrý deň, ďakujeme za odpoveď. Radi sa dohodneme.'),
    x(R, [1], 'exch', 0, 'Zľava 60 % hneď, bez dôkazov, len zaplaťte.', { d: 60, w: 'Zľavil si bez toho, že ťa niekto tlačil. Priestor na ústupky šetri na bargaining.' }),
    x(R, [1], 'press', 0, 'Dôkazy nedáme, platíte alebo nič.', { w: 'Bez dôkazu dôveryhodnosti obete neplatia.' }),
    x(R, [1], 'intim', 0, 'Prídeme za vašimi študentmi osobne.', { w: 'Fyzické hrozby nie sú pre ransomvér typické a priťahujú políciu.' }),
    // ---- RED, fáza 2
    x(R, [2], 'exch', 1, 'Ak zaplatíte do 24 hodín, dáme zľavu 10 %.', { d: 10 }),
    x(R, [2], 'exch', 1, 'Vidíme, že sa snažíte. Ponúkame zľavu 15 %, ale ďalej nepôjdeme.', { d: 15 }),
    x(R, [2], 'rat', 1, 'Vaša škola má podľa verejných údajov rozpočet v miliónoch. Cena je primeraná.'),
    x(R, [2], 'cred', 1, 'Po platbe dostanete decryptor aj správu, ako sme sa dostali dnu.'),
    x(R, [2], 'press', 1, 'Máte rozhodnutie? Čakáme.', { k: 'press' }),
    x(R, [2], 'intim', 1, 'O 48 hodín zverejníme dáta, ak sa nedohodneme.', { k: 'press', h: -24 }),
    x(R, [2], 'restr', 1, 'Musím to schváliť s tímom. Vrátim sa neskôr.'),
    x(R, [2], 'exch', 0, 'Zľava 50 % hneď, len zaplaťte.', { d: 50, w: 'Zbytočne si ukázal slabosť. Obete čakajú na ďalšiu zľavu.' }),
    x(R, [2], 'emo', 0, 'Fíha, vy ste ale nešťastní. Kebyže ste sa lepšie chránili.', { w: 'Poníženie nepomáha. Zvyšuje odpor, nie ochotu platiť.' }),
    x(R, [2], 'exch', 1, 'Dobre, ponuku prijímame.', { e: 'accept' }),
    // ---- RED, fáza 3
    x(R, [3], 'cred', 1, 'Tu je decryptor a návod na použitie.', { k: 'del' }),
    x(R, [3], 'kind', 1, 'Ak by niečo nefungovalo, sme tu na podporu.'),
    x(R, [3], 'cred', 1, 'Dáta zmažeme a potvrdíme to.'),
    x(R, [3], 'exch', 0, 'Decryptor pošleme, keď zaplatíte ešte 50 000 navyše.', { w: 'Porušíš dohodu a poškodíš "brand" skupiny. Ďalšie obete nebudú platiť.' }),
    x(R, [3], 'restr', 0, 'Decryptor pošleme zajtra, teraz nemáme čas.', { w: 'Zdržiavanie po platbe ničí dôveru.' })
  ]
};
