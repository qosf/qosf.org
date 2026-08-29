// Static lists for dropdown fields — no external dependency needed

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia",
  "Zimbabwe",
] as const;

export const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:30", "UTC-09:00",
  "UTC-08:00", "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:30",
  "UTC-04:00", "UTC-03:30", "UTC-03:00", "UTC-02:00", "UTC-01:00",
  "UTC±00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+03:30",
  "UTC+04:00", "UTC+04:30", "UTC+05:00", "UTC+05:30", "UTC+05:45",
  "UTC+06:00", "UTC+06:30", "UTC+07:00", "UTC+08:00", "UTC+08:45",
  "UTC+09:00", "UTC+09:30", "UTC+10:00", "UTC+10:30", "UTC+11:00",
  "UTC+12:00", "UTC+12:45", "UTC+13:00", "UTC+14:00",
] as const;

export const PRONOUNS = [
  "She/Her/Hers",
  "He/Him/His",
  "They/Them/Theirs",
  "Ze/Her/Zir",
  "Prefer not to say",
] as const;

export const ACADEMIC_DEGREES = [
  "High School Student",
  "Undergraduate",
  "Graduate (Masters)",
  "Graduate (PhD)",
  "Professor",
  "Researcher in Academia",
  "Other",
  "Researcher in Industry",
  "Software Developer / Engineer in Industry",
] as const;

export type Country = (typeof COUNTRIES)[number];
export type Timezone = (typeof TIMEZONES)[number];
export type Pronoun = (typeof PRONOUNS)[number];
export type AcademicDegree = (typeof ACADEMIC_DEGREES)[number];
