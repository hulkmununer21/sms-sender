/**
 * Phase 1: Simple Variable Template Engine
 * Extracts variables from contact data and builds personalization context
 */

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

export interface PersonalizationVariables {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
  area_code?: string;
  state?: string;
  email?: string;
  email_domain?: string;
  is_work_email?: boolean;
  has_email?: boolean;
  initial?: string;
}

// Area code to state mapping (common US area codes)
const AREA_CODE_TO_STATE: Record<string, string> = {
  "201": "NJ", "202": "DC", "203": "CT", "204": "MB", "205": "AL", "206": "WA", "207": "ME",
  "208": "ID", "209": "CA", "210": "TX", "212": "NY", "213": "CA", "214": "TX", "215": "PA",
  "216": "OH", "217": "IL", "218": "MN", "219": "IN", "220": "OH", "223": "PA", "224": "IL",
  "225": "LA", "226": "ON", "228": "MS", "229": "GA", "231": "MI", "234": "OH", "239": "FL",
  "240": "MD", "242": "BS", "246": "BB", "248": "MI", "250": "BC", "251": "AL", "252": "NC",
  "253": "WA", "254": "TX", "256": "AL", "260": "IN", "262": "WI", "267": "PA", "269": "MI",
  "270": "KY", "272": "PA", "281": "TX", "284": "VI", "289": "ON", "301": "MD", "302": "DE",
  "303": "CO", "304": "WV", "305": "FL", "306": "SK", "307": "WY", "308": "NE", "309": "IL",
  "310": "CA", "312": "IL", "313": "MI", "314": "MO", "315": "NY", "316": "KS", "317": "IN",
  "318": "LA", "319": "IA", "320": "MN", "321": "FL", "323": "CA", "325": "TX", "330": "OH",
  "331": "IL", "334": "AL", "336": "NC", "337": "LA", "339": "MA", "340": "VI", "341": "CA",
  "346": "TX", "347": "NY", "350": "TX", "351": "MA", "352": "FL", "360": "WA", "361": "TX",
  "364": "LA", "365": "ON", "369": "TX", "370": "DC", "371": "DC", "372": "DC", "373": "DC",
  "374": "DC", "375": "DC", "376": "DC", "377": "DC", "378": "DC", "379": "DC", "380": "OH",
  "382": "ON", "385": "UT", "386": "FL", "401": "RI", "402": "NE", "403": "AB", "404": "GA",
  "405": "OK", "406": "MT", "407": "FL", "408": "CA", "409": "TX", "410": "MD", "412": "PA",
  "413": "MA", "414": "WI", "415": "CA", "416": "ON", "417": "MO", "418": "QC", "419": "OH",
  "420": "ON", "423": "TN", "424": "CA", "425": "WA", "428": "ON", "430": "TX", "431": "MB",
  "432": "TX", "434": "VA", "435": "UT", "436": "ON", "437": "ON", "438": "QC", "440": "OH",
  "441": "BM", "442": "CA", "443": "MD", "445": "PA", "446": "TX", "447": "IL", "448": "ON",
  "450": "QC", "458": "OR", "459": "AL", "462": "MO", "463": "IN", "464": "IL", "469": "TX",
  "470": "GA", "472": "VA", "473": "GD", "475": "CT", "478": "GA", "479": "AR", "480": "AZ",
  "484": "PA", "501": "AR", "502": "KY", "503": "OR", "504": "LA", "505": "NM", "506": "NB",
  "507": "MN", "508": "MA", "509": "WA", "510": "CA", "512": "TX", "513": "OH", "514": "QC",
  "515": "IA", "516": "NY", "517": "MI", "518": "NY", "519": "ON", "520": "AZ", "530": "CA",
  "540": "VA", "541": "OR", "551": "NJ", "559": "CA", "561": "FL", "562": "CA", "563": "IA",
  "564": "WA", "567": "OH", "570": "PA", "571": "VA", "573": "MO", "575": "NM", "580": "OK",
  "581": "NS", "582": "PA", "585": "NY", "586": "MI", "587": "AB", "601": "MS", "602": "AZ",
  "603": "NH", "604": "BC", "605": "SD", "606": "KY", "607": "NY", "608": "WI", "609": "NJ",
  "610": "PA", "612": "MN", "613": "ON", "614": "OH", "615": "TN", "616": "MI", "617": "MA",
  "618": "IL", "619": "CA", "620": "KS", "623": "AZ", "626": "CA", "628": "CA", "629": "TN",
  "630": "IL", "631": "NY", "636": "MO", "641": "IA", "646": "NY", "647": "ON", "649": "TC",
  "650": "CA", "651": "MN", "660": "MO", "661": "CA", "662": "MS", "664": "VI", "667": "MD",
  "669": "CA", "670": "MP", "671": "GU", "678": "GA", "681": "WV", "682": "TX", "684": "AS",
  "685": "ON", "686": "CA", "687": "QC", "688": "QC", "689": "QC", "701": "ND", "702": "NV",
  "703": "VA", "704": "NC", "705": "ON", "706": "GA", "707": "CA", "708": "IL", "709": "NL",
  "710": "DE", "712": "IA", "713": "TX", "714": "CA", "715": "WI", "716": "NY", "717": "PA",
  "718": "NY", "719": "CO", "720": "CO", "724": "PA", "725": "NV", "727": "FL", "730": "IL",
  "731": "TN", "732": "NJ", "734": "MI", "737": "TX", "740": "OH", "743": "NC", "747": "CA",
  "754": "FL", "757": "VA", "758": "LC", "760": "CA", "761": "NC", "762": "GA", "763": "MN",
  "764": "GA", "767": "DM", "769": "MS", "770": "GA", "771": "DC", "772": "FL", "773": "IL",
  "774": "MA", "775": "NV", "776": "PA", "778": "BC", "779": "IL", "780": "AB", "781": "MA",
  "782": "NS", "783": "NS", "784": "VC", "785": "KS", "786": "FL", "787": "PR", "801": "UT",
  "802": "VT", "803": "SC", "804": "VA", "805": "CA", "806": "TX", "807": "ON", "808": "HI",
  "809": "DO", "810": "MI", "812": "IN", "813": "FL", "814": "PA", "815": "IL", "816": "MO",
  "817": "TX", "818": "CA", "819": "QC", "828": "NC", "830": "TX", "831": "CA", "832": "TX",
  "833": "US", "834": "US", "835": "US", "836": "TX", "840": "US", "843": "SC", "844": "US",
  "845": "NY", "847": "IL", "848": "NJ", "849": "DO", "850": "FL", "856": "NJ", "857": "MA",
  "858": "CA", "859": "KY", "860": "CT", "861": "SC", "862": "NJ", "863": "FL", "864": "SC",
  "865": "TN", "866": "US", "867": "NT", "868": "TT", "869": "KN", "870": "AR", "872": "IL",
  "873": "QC", "876": "JM", "877": "US", "878": "PA", "880": "US", "881": "US", "882": "US",
  "883": "US", "884": "US", "885": "US", "886": "US", "887": "US", "888": "US", "889": "US",
  "901": "TN", "902": "NS", "903": "TX", "904": "FL", "905": "ON", "906": "MI", "907": "AK",
  "908": "NJ", "909": "CA", "910": "NC", "912": "GA", "913": "KS", "914": "NY", "915": "TX",
  "916": "CA", "917": "NY", "918": "OK", "919": "NC", "920": "WI", "925": "CA", "928": "AZ",
  "931": "TN", "934": "NY", "936": "TX", "937": "OH", "938": "TN", "939": "PR", "940": "TX",
  "941": "FL", "942": "ON", "945": "TX", "947": "MI", "948": "ON", "949": "CA", "950": "US",
  "951": "CA", "952": "MN", "953": "TX", "954": "FL", "955": "TX", "956": "TX", "959": "CT",
  "970": "CO", "971": "OR", "972": "TX", "973": "NJ", "975": "TN", "978": "MA", "979": "TX",
  "980": "NC", "981": "TN", "982": "TN", "983": "UT", "984": "NC", "985": "LA", "986": "TN",
  "989": "MI", "990": "US", "991": "US", "992": "US", "993": "US", "994": "US", "995": "US",
  "996": "US", "997": "US", "998": "US", "999": "US",
};

/**
 * Extract personalization variables from a contact
 */
export function extractPersonalizationVariables(
  contact: Contact
): PersonalizationVariables {
  const variables: PersonalizationVariables = {
    phone_number: contact.phone_number,
  };

  // Extract name parts
  if (contact.name) {
    const nameParts = contact.name.trim().split(/\s+/);
    variables.first_name = nameParts[0];
    variables.last_name = nameParts[nameParts.length - 1];
    variables.full_name = contact.name;
    variables.initial = nameParts[0]?.charAt(0);
  }

  // Extract area code from phone number
  const phoneMatch = contact.phone_number.match(/\+?1?(\d{3})/);
  if (phoneMatch) {
    variables.area_code = phoneMatch[1];
    variables.state = AREA_CODE_TO_STATE[phoneMatch[1]] || "US";
  }

  // Extract email information
  if (contact.email) {
    variables.email = contact.email;
    variables.has_email = true;

    const emailDomain = contact.email.split("@")[1];
    variables.email_domain = emailDomain;

    // Detect if work email
    const commonPersonalDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "mail.com",
    ];
    variables.is_work_email = !commonPersonalDomains.includes(emailDomain);
  } else {
    variables.has_email = false;
  }

  return variables;
}

/**
 * Replace template variables in a message
 * Supports: {{variable_name}}
 * Only replaces variables that are explicitly in the template
 * Unreplaced variables are kept as {{variable}} or removed based on removeUnreplaced param
 */
export function substituteTemplateVariables(
  template: string,
  variables: PersonalizationVariables,
  removeUnreplaced: boolean = true
): string {
  let result = template;

  // Get all variables used in the template
  const usedVariables = getTemplateVariables(template);

  // Only replace variables that are actually used in the template
  usedVariables.forEach((varName) => {
    const value = variables[varName as keyof PersonalizationVariables];
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{${varName}}}`, "gi");
      result = result.replace(regex, String(value));
    }
  });

  // Only remove unreplaced variables if explicitly requested
  if (removeUnreplaced) {
    result = result.replace(/{{[^}]+}}/g, "");
  }

  return result;
}

/**
 * Get all available variables in a template
 */
export function getTemplateVariables(template: string): string[] {
  const regex = /{{([^}]+)}}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Count how many recipients have data for specific variables
 */
export function countVariableCoverage(
  template: string,
  contacts: Contact[]
): Record<string, number> {
  const templateVars = getTemplateVariables(template);
  const coverage: Record<string, number> = {};

  templateVars.forEach((variable) => {
    let count = 0;
    contacts.forEach((contact) => {
      const vars = extractPersonalizationVariables(contact);
      if (vars[variable as keyof PersonalizationVariables]) {
        count++;
      }
    });
    coverage[variable] = count;
  });

  return coverage;
}

/**
 * Check if template can be fully personalized for all contacts
 */
export function canFullyPersonalize(
  template: string,
  contacts: Contact[]
): { canPersonalize: boolean; issues: string[] } {
  const templateVars = getTemplateVariables(template);
  const issues: string[] = [];

  if (templateVars.length === 0) {
    return {
      canPersonalize: false,
      issues: ["No personalization variables found in template"],
    };
  }

  templateVars.forEach((variable) => {
    const coverage = contacts.filter((contact) => {
      const vars = extractPersonalizationVariables(contact);
      return vars[variable as keyof PersonalizationVariables];
    }).length;

    if (coverage < contacts.length) {
      const missing = contacts.length - coverage;
      issues.push(
        `{{${variable}}} - Missing for ${missing} contact${missing !== 1 ? "s" : ""}`
      );
    }
  });

  return {
    canPersonalize: issues.length === 0,
    issues,
  };
}

/**
 * Personalize messages for all contacts using simple template substitution
 */
export function personalizeMessagesSimple(
  template: string,
  contacts: Contact[]
): Array<{ contactId: string; personalized: string; variables: PersonalizationVariables }> {
  return contacts.map((contact) => {
    const variables = extractPersonalizationVariables(contact);
    const personalized = substituteTemplateVariables(template, variables);

    return {
      contactId: contact.id,
      personalized,
      variables,
    };
  });
}
