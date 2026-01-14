export interface TradeTypeData {
  id: string
  name: string
  icon: string
  sortOrder: number
}

export const tradeTypesData: TradeTypeData[] = [
  { id: 'wykonczenia', name: 'Wykończenia wnętrz', icon: 'color-palette-outline', sortOrder: 0 },
  { id: 'budownictwo', name: 'Budownictwo', icon: 'business-outline', sortOrder: 1 },
  { id: 'hydraulika', name: 'Hydraulika', icon: 'water-outline', sortOrder: 2 },
  { id: 'elektryka', name: 'Elektryka', icon: 'flash-outline', sortOrder: 3 },
  { id: 'hvac', name: 'HVAC / Klimatyzacja', icon: 'thermometer-outline', sortOrder: 4 },
  { id: 'elewacje', name: 'Elewacje i dachy', icon: 'home-outline', sortOrder: 5 },
  { id: 'brukarstwo', name: 'Brukarstwo', icon: 'grid-outline', sortOrder: 6 },
  { id: 'ogrod', name: 'Ogród', icon: 'leaf-outline', sortOrder: 7 },
  { id: 'slusarstwo', name: 'Ślusarstwo', icon: 'construct-outline', sortOrder: 8 },
  { id: 'ziemne', name: 'Roboty ziemne', icon: 'layers-outline', sortOrder: 9 },
]
