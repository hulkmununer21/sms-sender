import React, { useState } from "react";
import { Plus, Copy, Check, Trash2 } from "lucide-react";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface GeneratedNumber {
  id: string;
  number: string;
  selected: boolean;
}

// All valid US area codes
const US_AREA_CODES = [
  // 201-299: Northeast/New Jersey/New York
  { code: "201", region: "New Jersey" },
  { code: "202", region: "Washington DC" },
  { code: "203", region: "Connecticut" },
  { code: "205", region: "Alabama" },
  { code: "206", region: "Seattle, Washington" },
  { code: "207", region: "Maine" },
  { code: "208", region: "Idaho" },
  { code: "209", region: "Central Valley, California" },
  { code: "210", region: "San Antonio, Texas" },
  { code: "212", region: "New York City, New York" },
  { code: "213", region: "Los Angeles, California" },
  { code: "214", region: "Dallas, Texas" },
  { code: "215", region: "Philadelphia, Pennsylvania" },
  { code: "216", region: "Cleveland, Ohio" },
  { code: "217", region: "Central Illinois" },
  { code: "218", region: "Northern Minnesota" },
  { code: "219", region: "Northwest Indiana" },
  { code: "220", region: "Columbus, Ohio" },
  { code: "223", region: "Los Angeles, California" },
  { code: "224", region: "Chicago, Illinois" },
  { code: "225", region: "Baton Rouge, Louisiana" },
  { code: "228", region: "Mississippi" },
  { code: "229", region: "Southern Georgia" },
  { code: "231", region: "Michigan" },
  { code: "234", region: "Akron, Ohio" },
  { code: "239", region: "Southwest Florida" },
  { code: "240", region: "Maryland" },
  { code: "248", region: "Detroit, Michigan" },
  { code: "251", region: "Alabama" },
  { code: "252", region: "Eastern North Carolina" },
  { code: "253", region: "Tacoma, Washington" },
  { code: "254", region: "Central Texas" },
  { code: "256", region: "Alabama" },
  { code: "260", region: "Northeast Indiana" },
  { code: "262", region: "Milwaukee, Wisconsin" },
  { code: "267", region: "Philadelphia, Pennsylvania" },
  { code: "269", region: "Southwest Michigan" },
  { code: "270", region: "Western Kentucky" },
  { code: "272", region: "North Carolina" },
  { code: "274", region: "Georgia" },
  { code: "276", region: "Virginia" },
  { code: "278", region: "Mississippi" },
  { code: "281", region: "Houston, Texas" },
  { code: "282", region: "Ohio" },
  { code: "283", region: "Cincinnati, Ohio" },
  { code: "284", region: "Virgin Islands" },
  { code: "289", region: "Ontario, Canada" },
  { code: "301", region: "Maryland" },
  { code: "302", region: "Delaware" },
  { code: "303", region: "Denver, Colorado" },
  { code: "304", region: "West Virginia" },
  { code: "305", region: "Miami, Florida" },
  { code: "306", region: "Saskatchewan, Canada" },
  { code: "307", region: "Wyoming" },
  { code: "308", region: "Nebraska" },
  { code: "309", region: "Central Illinois" },
  { code: "310", region: "Los Angeles, California" },
  { code: "312", region: "Chicago, Illinois" },
  { code: "313", region: "Detroit, Michigan" },
  { code: "314", region: "St. Louis, Missouri" },
  { code: "315", region: "Syracuse, New York" },
  { code: "316", region: "Wichita, Kansas" },
  { code: "317", region: "Indianapolis, Indiana" },
  { code: "318", region: "Northern Louisiana" },
  { code: "319", region: "Eastern Iowa" },
  { code: "320", region: "Central Minnesota" },
  { code: "321", region: "Orlando, Florida" },
  { code: "323", region: "Los Angeles, California" },
  { code: "324", region: "Hawaii" },
  { code: "325", region: "Central Texas" },
  { code: "326", region: "Pennsylvania" },
  { code: "327", region: "Texas" },
  { code: "330", region: "Akron, Ohio" },
  { code: "331", region: "Chicago, Illinois" },
  { code: "334", region: "Alabama" },
  { code: "336", region: "Greensboro, North Carolina" },
  { code: "337", region: "Louisiana" },
  { code: "339", region: "Boston, Massachusetts" },
  { code: "340", region: "Virgin Islands" },
  { code: "341", region: "California" },
  { code: "342", region: "British Columbia, Canada" },
  { code: "343", region: "Ontario, Canada" },
  { code: "345", region: "Cayman Islands" },
  { code: "346", region: "Houston, Texas" },
  { code: "347", region: "New York City, New York" },
  { code: "348", region: "Louisiana" },
  { code: "349", region: "Texas" },
  { code: "350", region: "California" },
  { code: "351", region: "Massachusetts" },
  { code: "352", region: "Florida" },
  { code: "353", region: "Ireland" },
  { code: "354", region: "Iceland" },
  { code: "355", region: "Albania" },
  { code: "356", region: "Malta" },
  { code: "357", region: "Cyprus" },
  { code: "358", region: "Finland" },
  { code: "359", region: "Bulgaria" },
  { code: "360", region: "Washington" },
  { code: "361", region: "Corpus Christi, Texas" },
  { code: "362", region: "Texas" },
  { code: "364", region: "Mississippi" },
  { code: "365", region: "Ontario, Canada" },
  { code: "367", region: "Maryland" },
  { code: "368", region: "Connecticut" },
  { code: "369", region: "California" },
  { code: "370", region: "Lithuania" },
  { code: "371", region: "Latvia" },
  { code: "372", region: "Estonia" },
  { code: "373", region: "Moldova" },
  { code: "374", region: "Armenia" },
  { code: "375", region: "Belarus" },
  { code: "376", region: "Andorra" },
  { code: "377", region: "Monaco" },
  { code: "378", region: "San Marino" },
  { code: "380", region: "Ukraine" },
  { code: "381", region: "Serbia" },
  { code: "382", region: "Montenegro" },
  { code: "383", region: "Slovenia" },
  { code: "385", region: "Croatia" },
  { code: "386", region: "Northeast Florida" },
  { code: "387", region: "Bosnia and Herzegovina" },
  { code: "388", region: "Mexico" },
  { code: "389", region: "North Macedonia" },
  { code: "390", region: "Italy" },
  { code: "391", region: "Italy" },
  { code: "392", region: "Italy" },
  { code: "393", region: "Italy" },
  { code: "394", region: "Italy" },
  { code: "395", region: "Italy" },
  { code: "396", region: "Italy" },
  { code: "397", region: "San Marino" },
  { code: "398", region: "Vatican City/San Marino" },
  { code: "399", region: "Italy" },
  { code: "401", region: "Rhode Island" },
  { code: "402", region: "Nebraska" },
  { code: "403", region: "Alberta, Canada" },
  { code: "404", region: "Atlanta, Georgia" },
  { code: "405", region: "Oklahoma City, Oklahoma" },
  { code: "406", region: "Montana" },
  { code: "407", region: "Orlando, Florida" },
  { code: "408", region: "San Jose, California" },
  { code: "409", region: "Southeast Texas" },
  { code: "410", region: "Baltimore, Maryland" },
  { code: "412", region: "Pittsburgh, Pennsylvania" },
  { code: "413", region: "Massachusetts" },
  { code: "414", region: "Milwaukee, Wisconsin" },
  { code: "415", region: "San Francisco, California" },
  { code: "416", region: "Toronto, Ontario, Canada" },
  { code: "417", region: "Southwest Missouri" },
  { code: "418", region: "Quebec, Canada" },
  { code: "419", region: "Toledo, Ohio" },
  { code: "420", region: "Czech Republic" },
  { code: "421", region: "Slovakia" },
  { code: "422", region: "Maryland" },
  { code: "423", region: "Tennessee" },
  { code: "424", region: "Los Angeles, California" },
  { code: "425", region: "Seattle, Washington" },
  { code: "426", region: "North Carolina" },
  { code: "427", region: "Tennessee" },
  { code: "428", region: "Quebec, Canada" },
  { code: "429", region: "Ohio" },
  { code: "430", region: "Texas" },
  { code: "431", region: "Manitoba, Canada" },
  { code: "432", region: "West Texas" },
  { code: "433", region: "Virginia" },
  { code: "434", region: "Central Virginia" },
  { code: "435", region: "Utah" },
  { code: "436", region: "Kentucky" },
  { code: "437", region: "Ontario, Canada" },
  { code: "438", region: "Montreal, Quebec, Canada" },
  { code: "440", region: "Cleveland, Ohio" },
  { code: "441", region: "Bermuda" },
  { code: "442", region: "Southern California" },
  { code: "443", region: "Baltimore, Maryland" },
  { code: "445", region: "Pennsylvania" },
  { code: "447", region: "Illinois" },
  { code: "448", region: "Florida" },
  { code: "449", region: "California" },
  { code: "450", region: "Montreal, Quebec, Canada" },
  { code: "451", region: "Louisiana" },
  { code: "452", region: "Italy" },
  { code: "453", region: "Oklahoma" },
  { code: "454", region: "South Carolina" },
  { code: "455", region: "Multiple States" },
  { code: "456", region: "Multiple States" },
  { code: "457", region: "Ohio" },
  { code: "458", region: "Oregon" },
  { code: "459", region: "Mississippi" },
  { code: "460", region: "West Virginia" },
  { code: "461", region: "Missouri" },
  { code: "462", region: "Indiana" },
  { code: "463", region: "Indiana" },
  { code: "464", region: "Illinois" },
  { code: "465", region: "Ontario, Canada" },
  { code: "466", region: "Texas" },
  { code: "467", region: "Pennsylvania" },
  { code: "468", region: "Georgia" },
  { code: "469", region: "Dallas, Texas" },
  { code: "470", region: "Atlanta, Georgia" },
  { code: "471", region: "Pennsylvania" },
  { code: "472", region: "Oklahoma" },
  { code: "473", region: "Grenada" },
  { code: "474", region: "Georgia" },
  { code: "475", region: "Connecticut" },
  { code: "476", region: "Honduras" },
  { code: "477", region: "Florida" },
  { code: "478", region: "Central Georgia" },
  { code: "479", region: "Arkansas" },
  { code: "480", region: "Phoenix, Arizona" },
  { code: "481", region: "British Columbia, Canada" },
  { code: "482", region: "Nova Scotia, Canada" },
  { code: "484", region: "Pennsylvania" },
  { code: "485", region: "Iowa" },
  { code: "486", region: "Ohio" },
  { code: "487", region: "Michigan" },
  { code: "488", region: "Arizona" },
  { code: "489", region: "Georgia" },
  { code: "490", region: "New York" },
  { code: "491", region: "Serbia" },
  { code: "492", region: "San Marino/Vatican City" },
  { code: "493", region: "Bosnia and Herzegovina" },
  { code: "494", region: "Croatia" },
  { code: "495", region: "France" },
  { code: "496", region: "France" },
  { code: "497", region: "France" },
  { code: "498", region: "Russia/Soviet Union" },
  { code: "499", region: "United Kingdom" },
  { code: "501", region: "Arkansas" },
  { code: "502", region: "Louisville, Kentucky" },
  { code: "503", region: "Portland, Oregon" },
  { code: "504", region: "New Orleans, Louisiana" },
  { code: "505", region: "New Mexico" },
  { code: "506", region: "New Brunswick, Canada" },
  { code: "507", region: "Minnesota" },
  { code: "508", region: "Massachusetts" },
  { code: "509", region: "Eastern Washington" },
  { code: "510", region: "Oakland, California" },
  { code: "511", region: "Traffic Information" },
  { code: "512", region: "Austin, Texas" },
  { code: "513", region: "Cincinnati, Ohio" },
  { code: "514", region: "Montreal, Quebec, Canada" },
  { code: "515", region: "Central Iowa" },
  { code: "516", region: "Long Island, New York" },
  { code: "517", region: "Michigan" },
  { code: "518", region: "Albany, New York" },
  { code: "519", region: "Ontario, Canada" },
  { code: "520", region: "Arizona" },
  { code: "521", region: "Multiple States" },
  { code: "522", region: "Multiple States" },
  { code: "523", region: "North Carolina" },
  { code: "524", region: "Louisiana" },
  { code: "525", region: "Colombia" },
  { code: "526", region: "Multiple States" },
  { code: "527", region: "Multiple States" },
  { code: "528", region: "Multiple States" },
  { code: "529", region: "Multiple States" },
  { code: "530", region: "Northern California" },
  { code: "531", region: "Omaha, Nebraska" },
  { code: "532", region: "Multiple States" },
  { code: "533", region: "Multiple States" },
  { code: "534", region: "Wisconsin" },
  { code: "535", region: "Multiple States" },
  { code: "536", region: "Multiple States" },
  { code: "537", region: "St. Louis, Missouri" },
  { code: "538", region: "Iowa" },
  { code: "539", region: "Texas" },
  { code: "540", region: "Virginia" },
  { code: "541", region: "Oregon" },
  { code: "542", region: "British Columbia, Canada" },
  { code: "543", region: "British Columbia, Canada" },
  { code: "544", region: "Multiple States" },
  { code: "545", region: "New York" },
  { code: "546", region: "Multiple States" },
  { code: "547", region: "Multiple States" },
  { code: "548", region: "Ontario, Canada" },
  { code: "549", region: "Multiple States" },
  { code: "550", region: "Multiple States" },
  { code: "551", region: "New Jersey" },
  { code: "552", region: "Multiple States" },
  { code: "553", region: "Multiple States" },
  { code: "554", region: "Multiple States" },
  { code: "555", region: "Multiple States (Fictional)" },
  { code: "556", region: "Multiple States" },
  { code: "557", region: "Multiple States" },
  { code: "558", region: "Multiple States" },
  { code: "559", region: "Central California" },
  { code: "560", region: "Multiple States" },
  { code: "561", region: "Palm Beach, Florida" },
  { code: "562", region: "Long Beach, California" },
  { code: "563", region: "Iowa" },
  { code: "564", region: "Washington" },
  { code: "565", region: "Multiple States" },
  { code: "566", region: "Multiple States" },
  { code: "567", region: "Ohio" },
  { code: "568", region: "Multiple States" },
  { code: "569", region: "Multiple States" },
  { code: "570", region: "Pennsylvania" },
  { code: "571", region: "Virginia" },
  { code: "572", region: "Alabama" },
  { code: "573", region: "Missouri" },
  { code: "574", region: "Indiana" },
  { code: "575", region: "New Mexico" },
  { code: "576", region: "Multiple States" },
  { code: "577", region: "Multiple States" },
  { code: "578", region: "Minnesota" },
  { code: "579", region: "Quebec, Canada" },
  { code: "580", region: "Oklahoma" },
  { code: "581", region: "Quebec, Canada" },
  { code: "582", region: "Pennsylvania" },
  { code: "583", region: "Multiple States" },
  { code: "584", region: "Multiple States" },
  { code: "585", region: "Rochester, New York" },
  { code: "586", region: "Michigan" },
  { code: "587", region: "Alberta, Canada" },
  { code: "588", region: "Multiple States" },
  { code: "589", region: "Florida" },
  { code: "590", region: "Guadeloupe" },
  { code: "591", region: "Bolivia" },
  { code: "592", region: "Guyana" },
  { code: "593", region: "Ecuador" },
  { code: "594", region: "French Guiana" },
  { code: "595", region: "Paraguay" },
  { code: "596", region: "Martinique" },
  { code: "597", region: "Suriname" },
  { code: "598", region: "Uruguay" },
  { code: "599", region: "Netherlands Antilles" },
  { code: "600", region: "Canada (Assigned)" },
  { code: "601", region: "Mississippi" },
  { code: "602", region: "Phoenix, Arizona" },
  { code: "603", region: "New Hampshire" },
  { code: "604", region: "Vancouver, British Columbia, Canada" },
  { code: "605", region: "South Dakota" },
  { code: "606", region: "Eastern Kentucky" },
  { code: "607", region: "New York" },
  { code: "608", region: "Madison, Wisconsin" },
  { code: "609", region: "New Jersey" },
  { code: "610", region: "Pennsylvania" },
  { code: "611", region: "Customer Service" },
  { code: "612", region: "Minneapolis, Minnesota" },
  { code: "613", region: "Ottawa, Ontario, Canada" },
  { code: "614", region: "Columbus, Ohio" },
  { code: "615", region: "Nashville, Tennessee" },
  { code: "616", region: "Michigan" },
  { code: "617", region: "Boston, Massachusetts" },
  { code: "618", region: "Southern Illinois" },
  { code: "619", region: "San Diego, California" },
  { code: "620", region: "Kansas" },
  { code: "621", region: "Multiple States" },
  { code: "622", region: "Multiple States" },
  { code: "623", region: "Phoenix, Arizona" },
  { code: "624", region: "Multiple States" },
  { code: "625", region: "Multiple States" },
  { code: "626", region: "Pasadena, California" },
  { code: "627", region: "Multiple States" },
  { code: "628", region: "San Francisco, California" },
  { code: "629", region: "Nashville, Tennessee" },
  { code: "630", region: "Chicago, Illinois" },
  { code: "631", region: "Long Island, New York" },
  { code: "632", region: "Multiple States" },
  { code: "633", region: "Multiple States" },
  { code: "634", region: "Multiple States" },
  { code: "635", region: "Texas" },
  { code: "636", region: "Missouri" },
  { code: "637", region: "Ontario, Canada" },
  { code: "638", region: "Multiple States" },
  { code: "639", region: "Saskatchewan, Canada" },
  { code: "640", region: "Multiple States" },
  { code: "641", region: "Iowa" },
  { code: "642", region: "Multiple States" },
  { code: "643", region: "Multiple States" },
  { code: "644", region: "Multiple States" },
  { code: "645", region: "New York" },
  { code: "646", region: "New York City, New York" },
  { code: "647", region: "Toronto, Ontario, Canada" },
  { code: "648", region: "Manitoba, Canada" },
  { code: "649", region: "Turks and Caicos Islands" },
  { code: "650", region: "Silicon Valley, California" },
  { code: "651", region: "Minnesota" },
  { code: "652", region: "Mississippi" },
  { code: "653", region: "Multiple States" },
  { code: "654", region: "South Carolina" },
  { code: "655", region: "Multiple States" },
  { code: "656", region: "Multiple States" },
  { code: "657", region: "Anaheim, California" },
  { code: "658", region: "Tennessee" },
  { code: "659", region: "Alabama" },
  { code: "660", region: "Missouri" },
  { code: "661", region: "Central California" },
  { code: "662", region: "Mississippi" },
  { code: "663", region: "Multiple States" },
  { code: "664", region: "Montserrat" },
  { code: "665", region: "Multiple States" },
  { code: "666", region: "Multiple States" },
  { code: "667", region: "Maryland" },
  { code: "668", region: "Mississippi" },
  { code: "669", region: "Multiple States" },
  { code: "670", region: "Saipan (Northern Mariana Islands)" },
  { code: "671", region: "Guam" },
  { code: "672", region: "Multiple States" },
  { code: "673", region: "Russia" },
  { code: "674", region: "Multiple States" },
  { code: "675", region: "Papua New Guinea" },
  { code: "676", region: "Multiple States" },
  { code: "677", region: "Multiple States" },
  { code: "678", region: "Atlanta, Georgia" },
  { code: "679", region: "Multiple States" },
  { code: "680", region: "Multiple States" },
  { code: "681", region: "West Virginia" },
  { code: "682", region: "Fort Worth, Texas" },
  { code: "683", region: "Wallis and Futuna" },
  { code: "684", region: "American Samoa" },
  { code: "685", region: "Multiple States" },
  { code: "686", region: "Multiple States" },
  { code: "687", region: "New Caledonia" },
  { code: "688", region: "Kiribati" },
  { code: "689", region: "French Polynesia" },
  { code: "690", region: "Tokelau" },
  { code: "691", region: "Micronesia" },
  { code: "692", region: "Marshall Islands" },
  { code: "693", region: "Multiple States" },
  { code: "694", region: "Multiple States" },
  { code: "695", region: "Multiple States" },
  { code: "696", region: "Multiple States" },
  { code: "697", region: "Multiple States" },
  { code: "698", region: "Multiple States" },
  { code: "699", region: "Multiple States" },
  { code: "700", region: "Multiple States" },
  { code: "701", region: "North Dakota" },
  { code: "702", region: "Las Vegas, Nevada" },
  { code: "703", region: "Virginia" },
  { code: "704", region: "Charlotte, North Carolina" },
  { code: "705", region: "Northern Ontario, Canada" },
  { code: "706", region: "Georgia" },
  { code: "707", region: "Northern California" },
  { code: "708", region: "Chicago, Illinois" },
  { code: "709", region: "Newfoundland and Labrador, Canada" },
  { code: "710", region: "Multiple States" },
  { code: "711", region: "TDD" },
  { code: "712", region: "Iowa" },
  { code: "713", region: "Houston, Texas" },
  { code: "714", region: "Orange County, California" },
  { code: "715", region: "Wisconsin" },
  { code: "716", region: "Buffalo, New York" },
  { code: "717", region: "Pennsylvania" },
  { code: "718", region: "New York City, New York" },
  { code: "719", region: "Colorado Springs, Colorado" },
  { code: "720", region: "Denver, Colorado" },
  { code: "721", region: "Sint Maarten/Saint Martin" },
  { code: "722", region: "Multiple States" },
  { code: "723", region: "Pennsylvania" },
  { code: "724", region: "Pennsylvania" },
  { code: "725", region: "Las Vegas, Nevada" },
  { code: "726", region: "Pennsylvania" },
  { code: "727", region: "Tampa, Florida" },
  { code: "728", region: "Multiple States" },
  { code: "729", region: "Texas" },
  { code: "730", region: "Illinois" },
  { code: "731", region: "Tennessee" },
  { code: "732", region: "New Jersey" },
  { code: "733", region: "Multiple States" },
  { code: "734", region: "Detroit, Michigan" },
  { code: "735", region: "Tennessee" },
  { code: "736", region: "Tennessee" },
  { code: "737", region: "Austin, Texas" },
  { code: "738", region: "Georgia" },
  { code: "739", region: "Tennessee" },
  { code: "740", region: "Ohio" },
  { code: "741", region: "Ohio" },
  { code: "742", region: "Multiple States" },
  { code: "743", region: "North Carolina" },
  { code: "744", region: "Multiple States" },
  { code: "745", region: "Multiple States" },
  { code: "746", region: "Multiple States" },
  { code: "747", region: "Los Angeles, California" },
  { code: "748", region: "New York" },
  { code: "749", region: "Puerto Rico/USVI" },
  { code: "750", region: "Multiple States" },
  { code: "751", region: "Multiple States" },
  { code: "752", region: "Sweden" },
  { code: "753", region: "Multiple States" },
  { code: "754", region: "Florida" },
  { code: "755", region: "Multiple States" },
  { code: "756", region: "Multiple States" },
  { code: "757", region: "Hampton Roads, Virginia" },
  { code: "758", region: "Saint Lucia" },
  { code: "759", region: "Texas" },
  { code: "760", region: "California" },
  { code: "761", region: "Tennessee" },
  { code: "762", region: "Georgia" },
  { code: "763", region: "Minnesota" },
  { code: "764", region: "Multiple States" },
  { code: "765", region: "Indiana" },
  { code: "766", region: "Japan" },
  { code: "767", region: "Dominica" },
  { code: "768", region: "Japan" },
  { code: "769", region: "Mississippi" },
  { code: "770", region: "Atlanta, Georgia" },
  { code: "771", region: "Multiple States" },
  { code: "772", region: "Florida" },
  { code: "773", region: "Chicago, Illinois" },
  { code: "774", region: "Massachusetts" },
  { code: "775", region: "Nevada" },
  { code: "776", region: "Multiple States" },
  { code: "777", region: "Multiple States" },
  { code: "778", region: "British Columbia, Canada" },
  { code: "779", region: "Illinois" },
  { code: "780", region: "Alberta, Canada" },
  { code: "781", region: "Boston, Massachusetts" },
  { code: "782", region: "Nova Scotia, Canada" },
  { code: "783", region: "Multiple States" },
  { code: "784", region: "Saint Vincent and the Grenadines" },
  { code: "785", region: "Kansas" },
  { code: "786", region: "Miami, Florida" },
  { code: "787", region: "Puerto Rico" },
  { code: "788", region: "Multiple States" },
  { code: "789", region: "Multiple States" },
  { code: "790", region: "Multiple States" },
  { code: "791", region: "Georgia" },
  { code: "792", region: "Multiple States" },
  { code: "793", region: "Multiple States" },
  { code: "794", region: "Multiple States" },
  { code: "795", region: "Multiple States" },
  { code: "796", region: "Multiple States" },
  { code: "797", region: "Multiple States" },
  { code: "798", region: "Multiple States" },
  { code: "799", region: "Multiple States" },
  { code: "800", region: "Toll Free" },
  { code: "801", region: "Salt Lake City, Utah" },
  { code: "802", region: "Vermont" },
  { code: "803", region: "South Carolina" },
  { code: "804", region: "Richmond, Virginia" },
  { code: "805", region: "California" },
  { code: "806", region: "Texas Panhandle" },
  { code: "807", region: "Ontario, Canada" },
  { code: "808", region: "Hawaii" },
  { code: "809", region: "Dominican Republic/Caribbean" },
  { code: "810", region: "Michigan" },
  { code: "811", region: "Call Before You Dig" },
  { code: "812", region: "Indiana" },
  { code: "813", region: "Tampa, Florida" },
  { code: "814", region: "Pennsylvania" },
  { code: "815", region: "Illinois" },
  { code: "816", region: "Kansas City, Missouri" },
  { code: "817", region: "Fort Worth, Texas" },
  { code: "818", region: "Los Angeles, California" },
  { code: "819", region: "Quebec, Canada" },
  { code: "820", region: "Multiple States" },
  { code: "821", region: "Multiple States" },
  { code: "822", region: "Multiple States" },
  { code: "823", region: "South Carolina" },
  { code: "824", region: "Multiple States" },
  { code: "825", region: "Alberta, Canada" },
  { code: "826", region: "Multiple States" },
  { code: "827", region: "Illinois" },
  { code: "828", region: "North Carolina" },
  { code: "829", region: "Dominican Republic" },
  { code: "830", region: "Texas" },
  { code: "831", region: "California" },
  { code: "832", region: "Houston, Texas" },
  { code: "833", region: "Toll Free" },
  { code: "834", region: "Multiple States" },
  { code: "835", region: "Toll Free" },
  { code: "836", region: "Texas" },
  { code: "837", region: "Multiple States" },
  { code: "838", region: "New York" },
  { code: "839", region: "Mississippi" },
  { code: "840", region: "Multiple States" },
  { code: "841", region: "Multiple States" },
  { code: "842", region: "Multiple States" },
  { code: "843", region: "South Carolina" },
  { code: "844", region: "Toll Free" },
  { code: "845", region: "New York" },
  { code: "846", region: "Texas" },
  { code: "847", region: "Chicago, Illinois" },
  { code: "848", region: "New Jersey" },
  { code: "849", region: "Dominican Republic" },
  { code: "850", region: "Florida Panhandle" },
  { code: "851", region: "South Carolina" },
  { code: "852", region: "Hong Kong" },
  { code: "853", region: "Macau" },
  { code: "854", region: "South Carolina" },
  { code: "855", region: "Toll Free" },
  { code: "856", region: "New Jersey" },
  { code: "857", region: "Boston, Massachusetts" },
  { code: "858", region: "San Diego, California" },
  { code: "859", region: "Kentucky" },
  { code: "860", region: "Connecticut" },
  { code: "861", region: "Multiple States" },
  { code: "862", region: "New Jersey" },
  { code: "863", region: "Florida" },
  { code: "864", region: "South Carolina" },
  { code: "865", region: "Tennessee" },
  { code: "866", region: "Toll Free" },
  { code: "867", region: "Yukon/Northwest Territories/Nunavut, Canada" },
  { code: "868", region: "Trinidad and Tobago" },
  { code: "869", region: "Saint Kitts and Nevis" },
  { code: "870", region: "Arkansas" },
  { code: "871", region: "Multiple States" },
  { code: "872", region: "Chicago, Illinois" },
  { code: "873", region: "Quebec, Canada" },
  { code: "874", region: "Arkansas" },
  { code: "875", region: "Toll Free" },
  { code: "876", region: "Jamaica" },
  { code: "877", region: "Toll Free" },
  { code: "878", region: "Pennsylvania" },
  { code: "879", region: "Multiple States" },
  { code: "880", region: "Toll Free (WATS)" },
  { code: "881", region: "Toll Free (WATS)" },
  { code: "882", region: "Toll Free (WATS)" },
  { code: "883", region: "Toll Free (WATS)" },
  { code: "884", region: "Toll Free (WATS)" },
  { code: "885", region: "Toll Free (WATS)" },
  { code: "886", region: "Taiwan" },
  { code: "887", region: "Toll Free (WATS)" },
  { code: "888", region: "Toll Free" },
  { code: "889", region: "Toll Free (WATS)" },
  { code: "890", region: "Toll Free (WATS)" },
  { code: "891", region: "Multiple States" },
  { code: "892", region: "Multiple States" },
  { code: "893", region: "Multiple States" },
  { code: "894", region: "Multiple States" },
  { code: "895", region: "Multiple States" },
  { code: "896", region: "Multiple States" },
  { code: "897", region: "Multiple States" },
  { code: "898", region: "Multiple States" },
  { code: "899", region: "Multiple States" },
  { code: "900", region: "Premium Services" },
  { code: "901", region: "Memphis, Tennessee" },
  { code: "902", region: "Nova Scotia, Canada" },
  { code: "903", region: "Texas" },
  { code: "904", region: "Jacksonville, Florida" },
  { code: "905", region: "Toronto, Ontario, Canada" },
  { code: "906", region: "Michigan" },
  { code: "907", region: "Alaska" },
  { code: "908", region: "New Jersey" },
  { code: "909", region: "Southern California" },
  { code: "910", region: "North Carolina" },
  { code: "911", region: "Emergency" },
  { code: "912", region: "Georgia" },
  { code: "913", region: "Kansas City, Kansas" },
  { code: "914", region: "Westchester County, New York" },
  { code: "915", region: "El Paso, Texas" },
  { code: "916", region: "Sacramento, California" },
  { code: "917", region: "New York City, New York" },
  { code: "918", region: "Oklahoma" },
  { code: "919", region: "Raleigh, North Carolina" },
  { code: "920", region: "Wisconsin" },
  { code: "921", region: "Multiple States" },
  { code: "922", region: "Multiple States" },
  { code: "923", region: "Multiple States" },
  { code: "924", region: "Multiple States" },
  { code: "925", region: "Oakland, California" },
  { code: "926", region: "California" },
  { code: "927", region: "Multiple States" },
  { code: "928", region: "Arizona" },
  { code: "929", region: "New York City, New York" },
  { code: "930", region: "Multiple States" },
  { code: "931", region: "Tennessee" },
  { code: "932", region: "Multiple States" },
  { code: "933", region: "Multiple States" },
  { code: "934", region: "Multiple States" },
  { code: "935", region: "Multiple States" },
  { code: "936", region: "Texas" },
  { code: "937", region: "Dayton, Ohio" },
  { code: "938", region: "Alabama" },
  { code: "939", region: "Puerto Rico/USVI" },
  { code: "940", region: "Texas" },
  { code: "941", region: "Southwest Florida" },
  { code: "942", region: "Multiple States" },
  { code: "943", region: "Multiple States" },
  { code: "944", region: "Multiple States" },
  { code: "945", region: "Texas" },
  { code: "946", region: "Multiple States" },
  { code: "947", region: "Michigan" },
  { code: "948", region: "Multiple States" },
  { code: "949", region: "Orange County, California" },
  { code: "950", region: "Multiple States" },
  { code: "951", region: "Southern California" },
  { code: "952", region: "Minneapolis, Minnesota" },
  { code: "953", region: "Multiple States" },
  { code: "954", region: "Miami, Florida" },
  { code: "955", region: "Multiple States" },
  { code: "956", region: "Texas" },
  { code: "957", region: "New Mexico" },
  { code: "958", region: "Multiple States" },
  { code: "959", region: "Connecticut" },
  { code: "960", region: "Multiple States" },
  { code: "961", region: "Lebanon" },
  { code: "962", region: "Jordan" },
  { code: "963", region: "Syria" },
  { code: "964", region: "Iraq" },
  { code: "965", region: "Kuwait" },
  { code: "966", region: "Saudi Arabia" },
  { code: "967", region: "Yemen" },
  { code: "968", region: "Oman" },
  { code: "970", region: "Colorado" },
  { code: "971", region: "Oregon" },
  { code: "972", region: "Dallas, Texas" },
  { code: "973", region: "New Jersey" },
  { code: "974", region: "Tennessee" },
  { code: "975", region: "Multiple States" },
  { code: "976", region: "Multiple States" },
  { code: "977", region: "Multiple States" },
  { code: "978", region: "Massachusetts" },
  { code: "979", region: "Texas" },
  { code: "980", region: "Charlotte, North Carolina" },
  { code: "981", region: "North Carolina" },
  { code: "982", region: "Multiple States" },
  { code: "983", region: "Multiple States" },
  { code: "984", region: "North Carolina" },
  { code: "985", region: "Louisiana" },
  { code: "986", region: "Multiple States" },
  { code: "987", region: "Multiple States" },
  { code: "988", region: "Suicide & Crisis Lifeline" },
  { code: "989", region: "Michigan" },
];

/**
 * Generates a structurally valid random US phone number
 * @param areaCode - 3-digit area code
 * @returns Formatted US phone number (+1AREACODE1234567)
 */
const generateUSPhoneNumber = (areaCode: string): string => {
  // Exchange code: 2-9 (cannot start with 0 or 1)
  const exchange = Math.floor(Math.random() * 8) + 2;
  
  // Subscriber number: 0-9
  const subscriber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `+1${areaCode}${exchange}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}${subscriber}`;
};

export const NumberGenerator: React.FC = () => {
  const [selectedAreaCode, setSelectedAreaCode] = useState(US_AREA_CODES[0].code);
  const [quantity, setQuantity] = useState(10);
  const [generatedNumbers, setGeneratedNumbers] = useState<GeneratedNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newNumbers: GeneratedNumber[] = Array.from({ length: quantity }).map(
      (_, index) => ({
        id: `${Date.now()}-${index}`,
        number: generateUSPhoneNumber(selectedAreaCode),
        selected: false,
      })
    );

    setGeneratedNumbers(newNumbers);
    setLoading(false);
  };

  const handleSelectAll = () => {
    setGeneratedNumbers((prev) =>
      prev.map((n) => ({ ...n, selected: true }))
    );
  };

  const handleDeselectAll = () => {
    setGeneratedNumbers((prev) =>
      prev.map((n) => ({ ...n, selected: false }))
    );
  };

  const handleToggleSelect = (id: string) => {
    setGeneratedNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n))
    );
  };

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(number);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNumber = (id: string) => {
    setGeneratedNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const selectedCount = generatedNumbers.filter((n) => n.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">US Number Generator</h2>
        <p className="text-gray-600 mt-1">Generate valid random US phone numbers for testing</p>
      </div>

      {/* Generator Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Area Code Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Code & Region
            </label>
            <select
              value={selectedAreaCode}
              onChange={(e) => setSelectedAreaCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {US_AREA_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} - {item.region}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Generate
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Numbers"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Generated Numbers */}
      {generatedNumbers.length > 0 && !loading && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedCount}</span> of{" "}
              <span className="font-medium">{generatedNumbers.length}</span> selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-medium"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {generatedNumbers.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                  item.selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => handleToggleSelect(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <code className="font-mono text-sm font-medium text-gray-900">
                      {item.number}
                    </code>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyNumber(item.number);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    {copiedId === item.number ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNumber(item.id);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add to Campaign Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              disabled={selectedCount === 0}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              Add {selectedCount > 0 ? selectedCount : ""} Number{selectedCount !== 1 ? "s" : ""} to Campaign
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedNumbers.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            Select an area code and click "Generate Numbers" to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default NumberGenerator;
