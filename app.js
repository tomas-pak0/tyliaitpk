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
    "Atidarykite projektų demonstracines versijas tiesiai naršyklėje.",
    "Try the project demos directly in your browser."
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
    "VIETOS PROGRAMĖLĖ · DEMO",
    "LOCATION APP · DEMO"
  ],
  "locationText": [
    "Vieta žemėlapyje, gyvas bendrinimas ir judėjimo kryptimi orientuojamas žemėlapis su horizontaliais užrašais. 7 kalbos su vėliavomis ir pasirenkamas Lietuvos ORT10LT ortofoto sluoksnis.",
    "Live location sharing and a map oriented in your direction of travel with horizontal labels. Seven languages with flags and an optional Lithuanian ORT10LT orthophoto layer."
  ],
  "surveyApp": [
    "GEODEZINĖ PROGRAMĖLĖ · DEMO",
    "SURVEYING APP · DEMO"
  ],
  "axisText": [
    "Vieta žemėlapyje, Civil 3D ašies importas, piketažas ir atstumas iki ašies.",
    "Your location on a map, Civil 3D alignment import, chainage and distance to the alignment."
  ],
  "mapApp": [
    "ŽEMĖLAPIO PROGRAMĖLĖ · DEMO",
    "MAP APP · DEMO"
  ],
  "etnText": [
    "Tyrinėk aplinką: judant atsiveria rūku uždengtas žemėlapis, o atradimus galima eksportuoti PDF ar TXT. Demonstracijoje gyvenviečių duomenys apima Lietuvą.",
    "Explore your surroundings: movement reveals a fog-covered map, and discoveries can be exported as PDF or TXT. Settlement data in the demo covers Lithuania."
  ],
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
