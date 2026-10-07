const translations = {
  "privacyLink": ["Privatumo politika", "Privacy policy"],
  "termsLink": ["Paslaugų teikimo sąlygos", "Terms of service"],
  "backHome": ["Į pagrindinį puslapį", "Back to home"],
  "legalNavigation": ["Teisinė informacija", "Legal information"],
  "navAbout": [
    "Apie",
    "About"
  ],
  "navServices": [
    "Paslaugos",
    "Services"
  ],
  "navProjects": [
    "Projektai",
    "Projects"
  ],
  "navContact": [
    "Kontaktai",
    "Contact"
  ],
  "eyebrow": [
    "WEB DEVELOPMENT · DIGITAL SOLUTIONS",
    "WEB DEVELOPMENT · DIGITAL SOLUTIONS"
  ],
  "heroLead": [
    "Paprasti sprendimai.",
    "Simple solutions."
  ],
  "heroResult": [
    "Aiškus rezultatas.",
    "Clear results."
  ],
  "heroText": [
    "Kuriu modernias interneto svetaines ir funkcionalius skaitmeninius sprendimus žmonėms bei verslui.",
    "I build modern websites and practical digital solutions for people and businesses."
  ],
  "myWork": [
    "Mano darbai",
    "My work"
  ],
  "contactButton": [
    "Susisiekti",
    "Get in touch"
  ],
  "aboutLabel": [
    "01 / APIE",
    "01 / ABOUT"
  ],
  "aboutTitle": [
    "Apie TyliaiTPk",
    "About TyliaiTPk"
  ],
  "aboutText": [
    "TyliaiTPk – mano kuriamų interneto projektų ir skaitmeninių sprendimų erdvė. Vertinu paprastumą, aiškų dizainą ir funkcionalumą.",
    "TyliaiTPk is a home for my web projects and digital solutions. I value simplicity, clear design and functionality."
  ],
  "servicesLabel": [
    "02 / PASLAUGOS",
    "02 / SERVICES"
  ],
  "servicesTitle": [
    "Ką kuriu",
    "What I build"
  ],
  "websitesTitle": [
    "Interneto svetainės",
    "Websites"
  ],
  "websitesText": [
    "Reprezentacinės ir asmeninės interneto svetainės, pritaikytos kompiuteriams ir telefonams.",
    "Business and personal websites that work on desktop and mobile."
  ],
  "toolsTitle": [
    "Web sprendimai",
    "Web solutions"
  ],
  "toolsText": [
    "Nedideli internetiniai įrankiai ir individualūs sprendimai konkrečioms užduotims.",
    "Small web tools and custom solutions for specific tasks."
  ],
  "updatesTitle": [
    "Atnaujinimas",
    "Website updates"
  ],
  "updatesText": [
    "Esamų svetainių turinio, struktūros ir išvaizdos atnaujinimas.",
    "Updates to the content, structure and appearance of existing websites."
  ],
  "projectsLabel": [
    "03 / PROJEKTAI",
    "03 / PROJECTS"
  ],
  "projectsIntro": [
    "Susipažinkite su programėlėmis ir išbandykite prieinamas demonstracijas.",
    "Explore the apps and try the available demos."
  ],
  "webApp": [
    "WEB PROGRAMĖLĖ · DEMO",
    "WEB APP · DEMO"
  ],
  "workText": [
    "Mobiliesiems įrenginiams pritaikytas darbo laiko registravimo įrankis.",
    "A mobile-friendly time tracking tool."
  ],
  "mobileApp": [
    "MOBILI PROGRAMĖLĖ · DEMO",
    "MOBILE APP · DEMO"
  ],
  "smileText": [
    "Dantų valymo laikmatis ir kasdienio įpročio sekimas telefone.",
    "A toothbrushing timer and daily habit tracker for your phone."
  ],
  "financeApp": [
    "FINANSŲ ĮRANKIS · DEMO",
    "FINANCE TOOL · DEMO"
  ],
  "financeText": [
    "Interaktyvi pajamų ir išlaidų peržiūra su pavyzdiniais duomenimis.",
    "An interactive overview of income and expenses using sample data."
  ],
  "locationApp": [
    "VIETOS ANDROID PROGRAMĖLĖ",
    "ANDROID LOCATION APP"
  ],
  "locationText": [
    "Tavo vieta, greitis ir kryptis žemėlapyje, apytikslis adresas bei oras. Bendrink vietą su pasirinktu žmogumi, rinkis įprastą ar foto žemėlapį. 10 kalbų su vėliavomis.",
    "Your location, speed and heading on a map, with an approximate address and weather. Share your location with someone you choose and switch between standard and photo maps. Ten languages with flags."
  ],
  "surveyApp": [
    "GEODEZINĖ ANDROID PROGRAMĖLĖ",
    "ANDROID SURVEYING APP"
  ],
  "axisText": [
    "Vieta žemėlapyje, Civil 3D ašies importas, piketažas ir atstumas iki ašies.",
    "Your location on a map, Civil 3D alignment import, chainage and distance to the alignment."
  ],
  "mapApp": ["TYRINĖJIMO ANDROID PROGRAMĖLĖ", "ANDROID EXPLORATION APP"],
  "etnText": ["ETN paverčia pasivaikščiojimus ir keliones atradimais: judant atsiveria rūku uždengtas žemėlapis, skaičiuojamos atrastos šalys, gyvenvietės ir administraciniai centrai. Atradimus eksportuok į PDF, TXT ar CSV. Dešimt kalbų, įskaitant rusų; istorija saugoma telefone, o įjungtas GPS tyrinėjimas tęsiasi fone.", "ETN turns walks and trips into discoveries: movement reveals a fog-covered map and tracks explored countries, settlements and administrative centers. Export discoveries as PDF, TXT or CSV. Ten languages, including Russian; history stays on your phone and active GPS exploration continues in the background."],
  "openDemo": [
    "Atidaryti demonstraciją ↗",
    "Open demo ↗"
  ],
  "contactLabel": [
    "04 / KONTAKTAI",
    "04 / CONTACT"
  ],
  "contactTitle": [
    "Turite idėją?",
    "Have an idea?"
  ],
  "contactText": [
    "Galime aptarti interneto svetainę ar kitą skaitmeninį sprendimą.",
    "Let's talk about your website or another digital solution."
  ],
  "footer": [
    "Web Development",
    "Web Development"
  ],
  "description": [
    "TyliaiTPk – interneto svetainių ir funkcionalių skaitmeninių sprendimų kūrimas.",
    "TyliaiTPk – websites and practical digital solutions."
  ],
  "navigation": [
    "Pagrindinis meniu",
    "Main navigation"
  ]
};

translations.axisDetails=["Apie programėlę ir ekrano vaizdai ↗","App details and screenshots ↗"];
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

function setLanguage(language) {
  const selected = language === "en" ? "en" : "lt";
  const index = selected === "en" ? 1 : 0;
  document.documentElement.lang = selected;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = translations[element.dataset.i18n];
    if (value) element.textContent = value[index];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(element => {
    const value = translations[element.dataset.i18nAria];
    if (value) element.setAttribute("aria-label", value[index]);
  });
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = description.dataset[selected === "en" ? "descriptionEn" : "descriptionLt"] || translations.description[index];
  }
  document.querySelectorAll("[data-language-content]").forEach(element => {
    element.hidden = element.dataset.languageContent !== selected;
  });
  const pageTitle = document.body.dataset[selected === "en" ? "titleEn" : "titleLt"];
  if (pageTitle) document.title = pageTitle;
  document.querySelectorAll("[data-language]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.language === selected));
  });
  try { localStorage.setItem("tyliaitpk-language", selected); } catch {}
}

document.querySelectorAll("[data-language]").forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

let savedLanguage = "lt";
try { savedLanguage = localStorage.getItem("tyliaitpk-language") || "lt"; } catch {}
const requestedLanguage = new URLSearchParams(location.search).get("lang");
setLanguage(requestedLanguage === "en" || requestedLanguage === "lt" ? requestedLanguage : savedLanguage);

