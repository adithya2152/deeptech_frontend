export const domainLabels: Record<string, string> = {
  ai_ml: 'AI / Machine Learning',
  robotics: 'Robotics & Automation',
  climate_tech: 'Climate Tech',
  biotech: 'Biotechnology',
  quantum: 'Quantum Computing',
  space_tech: 'Space Technology',
  advanced_materials: 'Advanced Materials',
  energy: 'Energy & Storage',
  infrastructure: 'Deep Infrastructure',
};

export const trlDescriptions: Record<number, string> = {
  1: 'Basic principles observed',
  2: 'Technology concept formulated',
  3: 'Experimental proof of concept',
  4: 'Technology validated in lab',
  5: 'Technology validated in relevant environment',
  6: 'Technology demonstrated in relevant environment',
  7: 'System prototype demonstration',
  8: 'System complete and qualified',
  9: 'System proven in operational environment',
};

export const TIMEZONES: {
  value: string;
  label: string;
}[] = [
  { value: "UTC", label: "UTC" },
  { value: "America/Los_Angeles", label: "UTC−8 (PST)" },
  { value: "America/New_York", label: "UTC−5 (EST)" },
  { value: "Europe/London", label: "UTC+0 (GMT)" },
  { value: "Europe/Berlin", label: "UTC+1 (CET)" },
  { value: "Asia/Kolkata", label: "UTC+5:30 (IST)" },
  { value: "Asia/Singapore", label: "UTC+8 (SGT)" },
];
