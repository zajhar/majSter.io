export interface GroupTemplateData {
  name: string
  description: string
  services: {
    name: string
    unit: string
    pricePerUnit: number
    quantitySource: string
  }[]
}

export const systemGroupTemplates: GroupTemplateData[] = [
  {
    name: 'Łazienka',
    description: 'Kompleksowy remont łazienki',
    services: [
      { name: 'Skucie starych płytek', unit: 'm2', pricePerUnit: 50, quantitySource: 'walls' },
      { name: 'Hydroizolacja podłogi', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Hydroizolacja ścian', unit: 'm2', pricePerUnit: 60, quantitySource: 'walls' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie płytek podłogowych', unit: 'm2', pricePerUnit: 130, quantitySource: 'floor' },
      { name: 'Układanie płytek ściennych', unit: 'm2', pricePerUnit: 140, quantitySource: 'walls' },
      { name: 'Punkt hydrauliczny', unit: 'szt', pricePerUnit: 1000, quantitySource: 'manual' },
      { name: 'Montaż WC', unit: 'szt', pricePerUnit: 300, quantitySource: 'manual' },
      { name: 'Montaż umywalki', unit: 'szt', pricePerUnit: 200, quantitySource: 'manual' },
      { name: 'Montaż kabiny prysznicowej', unit: 'szt', pricePerUnit: 500, quantitySource: 'manual' },
      { name: 'Montaż baterii', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Pokój - malowanie',
    description: 'Odświeżenie pokoju - gruntowanie i malowanie',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
    ],
  },
  {
    name: 'Pokój - remont',
    description: 'Pełny remont pokoju z podłogą',
    services: [
      { name: 'Demontaż starego wykończenia', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Kuchnia',
    description: 'Remont kuchni z płytkami',
    services: [
      { name: 'Skucie starych płytek', unit: 'm2', pricePerUnit: 50, quantitySource: 'walls' },
      { name: 'Układanie płytek podłogowych', unit: 'm2', pricePerUnit: 130, quantitySource: 'floor' },
      { name: 'Układanie płytek ściennych', unit: 'm2', pricePerUnit: 140, quantitySource: 'walls' },
      { name: 'Punkt hydrauliczny', unit: 'szt', pricePerUnit: 1000, quantitySource: 'manual' },
      { name: 'Montaż zlewozmywaka', unit: 'szt', pricePerUnit: 200, quantitySource: 'manual' },
      { name: 'Montaż baterii', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
      { name: 'Podłączenie zmywarki', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Stan deweloperski',
    description: 'Wykończenie mieszkania w stanie deweloperskim',
    services: [
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
      { name: 'Montaż gniazdka', unit: 'szt', pricePerUnit: 60, quantitySource: 'manual' },
      { name: 'Montaż włącznika', unit: 'szt', pricePerUnit: 50, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Mieszkanie PRL',
    description: 'Remont mieszkania z wielkiej płyty',
    services: [
      { name: 'Kucie tynków', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Skrobanie ścian', unit: 'm2', pricePerUnit: 20, quantitySource: 'walls' },
      { name: 'Demontaż starej podłogi', unit: 'm2', pricePerUnit: 25, quantitySource: 'floor' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Gruntowanie sufitu', unit: 'm2', pricePerUnit: 15, quantitySource: 'ceiling' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
      { name: 'Wylewka samopoziomująca', unit: 'm2', pricePerUnit: 40, quantitySource: 'floor' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Zabudowa poddasza',
    description: 'Wykończenie poddasza użytkowego',
    services: [
      { name: 'Zabudowa skosów GK', unit: 'm2', pricePerUnit: 85, quantitySource: 'walls' },
      { name: 'Sufity GK', unit: 'm2', pricePerUnit: 90, quantitySource: 'ceiling' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 100, quantitySource: 'walls' },
      { name: 'Paroizolacja', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Malowanie sufitu', unit: 'm2', pricePerUnit: 35, quantitySource: 'ceiling' },
    ],
  },
  {
    name: 'Elewacja - styropian',
    description: 'Ocieplenie elewacji styropianem',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 100, quantitySource: 'walls' },
      { name: 'Klej + siatka (elewacja)', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Tynk elewacyjny', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Malowanie elewacji', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Elewacja - wełna',
    description: 'Ocieplenie elewacji wełną mineralną',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 120, quantitySource: 'walls' },
      { name: 'Klej + siatka (elewacja)', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Tynk elewacyjny', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Malowanie elewacji', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Korytarz',
    description: 'Remont korytarza/przedpokoju',
    services: [
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },
]
