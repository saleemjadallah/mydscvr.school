// ---------------------------------------------------------------------------
// Dubai area alias map: common names → KHDA DB names
// ---------------------------------------------------------------------------

const AREA_ALIASES: Record<string, string[]> = {
  // Abbreviations & common names
  jbr: ["JUMEIRAH BEACH RESIDENCE"],
  jlt: ["JUMEIRAH LAKE TOWERS"],
  jvc: ["JUMEIRAH VILLAGE CIRCLE"],
  jvt: ["JUMEIRAH VILLAGE TRIANGLE"],
  dso: ["DUBAI SILICON OASIS"],
  dip: ["DUBAI INVESTMENT PARK FIRST", "DUBAI INVESTMENT PARK SECOND"],
  difc: ["DUBAI INTERNATIONAL FINANCIAL CENTRE"],
  dhcc: ["DUBAI HEALTHCARE CITY"],
  impz: ["INTERNATIONAL MEDIA PRODUCTION ZONE"],
  tecom: ["BARSHA HEIGHTS"],
  dic: ["DUBAI INTERNET CITY"],
  dmc: ["DUBAI MEDIA CITY"],

  // Common spoken names → KHDA names
  marina: ["MARSA DUBAI"],
  "dubai marina": ["MARSA DUBAI"],
  downtown: ["BURJ KHALIFA"],
  "downtown dubai": ["BURJ KHALIFA"],
  "motor city": ["DUBAI SPORTS CITY"],
  "silicon oasis": ["DUBAI SILICON OASIS"],
  "sports city": ["DUBAI SPORTS CITY"],
  "business bay": ["BUSINESS BAY"],
  "discovery gardens": ["DISCOVERY GARDENS"],
  "international city": ["INTERNATIONAL CITY"],
  "production city": ["INTERNATIONAL MEDIA PRODUCTION ZONE"],
  "studio city": ["DUBAI STUDIO CITY"],
  "academic city": ["DUBAI ACADEMIC CITY"],
  "knowledge park": ["DUBAI KNOWLEDGE PARK"],
  "palm jumeirah": ["PALM JUMEIRAH"],
  "the palm": ["PALM JUMEIRAH"],

  // Al Barsha variants
  "al barsha": ["AL BARSHA FIRST", "AL BARSHA SECOND", "AL BARSHA SOUTH FIRST", "AL BARSHA SOUTH SECOND", "AL BARSHA SOUTH THIRD"],
  barsha: ["AL BARSHA FIRST", "AL BARSHA SECOND", "AL BARSHA SOUTH FIRST", "AL BARSHA SOUTH SECOND", "AL BARSHA SOUTH THIRD"],
  "barsha heights": ["BARSHA HEIGHTS"],

  // Al Quoz variants
  "al quoz": ["AL QUOZ FIRST", "AL QUOZ SECOND", "AL QUOZ THIRD", "AL QUOZ FOURTH"],

  // Jumeirah variants
  jumeirah: ["JUMEIRAH FIRST", "JUMEIRAH SECOND", "JUMEIRAH THIRD"],
  "jumeirah 1": ["JUMEIRAH FIRST"],
  "jumeirah 2": ["JUMEIRAH SECOND"],
  "jumeirah 3": ["JUMEIRAH THIRD"],

  // Al Qudra / Dubailand
  "al qudra": ["DUBAILAND"],
  qudra: ["DUBAILAND"],
  dubailand: ["DUBAILAND"],
  "dubai hills": ["DUBAI HILLS"],
  "dubai hills estate": ["DUBAI HILLS"],

  // Mirdif / Warqa
  mirdif: ["MIRDIF"],
  "al warqa": ["AL WARQA'A FIRST", "AL WARQA'A SECOND", "AL WARQA'A THIRD", "AL WARQA'A FOURTH"],
  warqa: ["AL WARQA'A FIRST", "AL WARQA'A SECOND", "AL WARQA'A THIRD"],

  // Arabian Ranches
  "arabian ranches": ["ARABIAN RANCHES", "ARABIAN RANCHES 2"],
  ranches: ["ARABIAN RANCHES", "ARABIAN RANCHES 2"],

  // Deira side
  deira: ["DEIRA"],
  "al garhoud": ["AL GARHOUD"],
  garhoud: ["AL GARHOUD"],
  "al mamzar": ["AL MAMZAR"],
  mamzar: ["AL MAMZAR"],
  "al rashidiya": ["AL RASHIDIYA"],
  rashidiya: ["AL RASHIDIYA"],
  "hor al anz": ["HOR AL ANZ"],
  "al twar": ["AL TWAR FIRST", "AL TWAR SECOND", "AL TWAR THIRD"],
  "al qusais": ["AL QUSAIS FIRST", "AL QUSAIS SECOND", "AL QUSAIS THIRD"],
  qusais: ["AL QUSAIS FIRST", "AL QUSAIS SECOND", "AL QUSAIS THIRD"],

  // Bur Dubai side
  "bur dubai": ["BUR DUBAI"],
  "al karama": ["AL KARAMA"],
  karama: ["AL KARAMA"],
  "al mankhool": ["AL MANKHOOL"],
  mankhool: ["AL MANKHOOL"],
  oud: ["OUD METHA"],
  "oud metha": ["OUD METHA"],
  "al satwa": ["AL SATWA"],
  satwa: ["AL SATWA"],
  "al safa": ["AL SAFA FIRST", "AL SAFA SECOND"],
  safa: ["AL SAFA FIRST", "AL SAFA SECOND"],

  // Outer areas
  "al mizhar": ["AL MIZHAR FIRST", "AL MIZHAR SECOND"],
  mizhar: ["AL MIZHAR FIRST", "AL MIZHAR SECOND"],
  "al khawaneej": ["AL KHAWANEEJ FIRST", "AL KHAWANEEJ SECOND"],
  khawaneej: ["AL KHAWANEEJ FIRST", "AL KHAWANEEJ SECOND"],
  "muhaisnah": ["MUHAISNAH FIRST", "MUHAISNAH SECOND", "MUHAISNAH THIRD", "MUHAISNAH FOURTH"],
  "al nahda": ["AL NAHDA FIRST", "AL NAHDA SECOND"],
  nahda: ["AL NAHDA FIRST", "AL NAHDA SECOND"],

  // New Dubai
  "the springs": ["THE SPRINGS"],
  springs: ["THE SPRINGS"],
  "the meadows": ["THE MEADOWS"],
  meadows: ["THE MEADOWS"],
  "the lakes": ["THE LAKES"],
  lakes: ["THE LAKES"],
  "the gardens": ["THE GARDENS"],
  gardens: ["THE GARDENS"],
  "the greens": ["THE GREENS"],
  greens: ["THE GREENS"],
  "the views": ["THE VIEWS"],
  "emirates hills": ["EMIRATES HILLS"],
  "al sufouh": ["AL SUFOUH FIRST", "AL SUFOUH SECOND"],
  sufouh: ["AL SUFOUH FIRST", "AL SUFOUH SECOND"],
  "umm suqeim": ["UMM SUQEIM FIRST", "UMM SUQEIM SECOND", "UMM SUQEIM THIRD"],

  // Creek area
  "dubai creek": ["DUBAI CREEK HARBOUR"],
  "creek harbour": ["DUBAI CREEK HARBOUR"],
  "festival city": ["DUBAI FESTIVAL CITY"],

  // Jebel Ali
  "jebel ali": ["JEBEL ALI FIRST", "JEBEL ALI SECOND"],

  // Nad Al Sheba
  "nad al sheba": ["NAD AL SHEBA FIRST", "NAD AL SHEBA SECOND", "NAD AL SHEBA THIRD"],

  // ---- Abu Dhabi areas ----
  "al ain": ["Al Ain"],
  "al dhafra": ["Al Dhafra"],
  "khalifa city": ["Khalifa City"],
  "mbz": ["Mohammed Bin Zayed City"],
  "mbz city": ["Mohammed Bin Zayed City"],
  "mohammed bin zayed city": ["Mohammed Bin Zayed City"],
  "mussafah": ["Mussafah"],
  "reem island": ["Al Reem Island"],
  "al reem island": ["Al Reem Island"],
  "saadiyat": ["Saadiyat Island"],
  "saadiyat island": ["Saadiyat Island"],
  "yas island": ["Yas Island"],
  "yas": ["Yas Island"],
  "baniyas": ["Baniyas"],
  "shamkha": ["Al Shamkha"],
  "al shamkha": ["Al Shamkha"],
  "al mushrif": ["Al Mushrif"],
  "mushrif": ["Al Mushrif"],
  "al bateen": ["Al Bateen"],
  "bateen": ["Al Bateen"],
  "al muroor": ["Al Muroor"],
  "muroor": ["Al Muroor"],
  "al maryah island": ["Al Maryah Island"],
  "al reef": ["Al Reef"],
  "al raha": ["Al Raha"],
  "between two bridges": ["Between Two Bridges"],
  "madinat zayed": ["Madinat Zayed"],
};

// ---------------------------------------------------------------------------
// Resolve area aliases → KHDA names (or passthrough)
// ---------------------------------------------------------------------------

export function resolveAreaAliases(areaName: string): string[] {
  const key = areaName.trim().toLowerCase();
  return AREA_ALIASES[key] ?? [areaName];
}

// ---------------------------------------------------------------------------
// Display-friendly area name: "AL BARSHA FIRST" → "Al Barsha First"
// ---------------------------------------------------------------------------

export function displayAreaName(area: string): string {
  return area
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
