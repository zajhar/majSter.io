export const SERVICE_CATEGORIES = {
  malowanie_tynki: 'Malowanie i tynki',
  podlogi: 'Podłogi',
  hydraulika: 'Hydraulika',
  elektryka: 'Elektryka',
  hvac: 'HVAC/Klimatyzacja',
  ogolnobudowlane: 'Prace ogólnobudowlane',
  ziemne: 'Prace ziemne',
  ogrodowe: 'Prace ogrodowe',
  slusarskie: 'Prace ślusarskie',
} as const

export type ServiceCategoryKey = keyof typeof SERVICE_CATEGORIES
