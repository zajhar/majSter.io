export interface GroupTemplateData {
  name: string
  description: string
  category: string
  services: {
    name: string
    unit: string
    pricePerUnit: number
    quantitySource: string
  }[]
}

export const systemGroupTemplates: GroupTemplateData[] = [
  // ========== WYKOŃCZENIA WNĘTRZ ==========
  {
    name: 'Łazienka',
    description: 'Kompleksowy remont łazienki',
    category: 'wykonczenia',
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
    category: 'wykonczenia',
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
    category: 'wykonczenia',
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
    category: 'wykonczenia',
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
    category: 'wykonczenia',
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
    category: 'wykonczenia',
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
    name: 'Korytarz',
    description: 'Remont korytarza/przedpokoju',
    category: 'wykonczenia',
    services: [
      { name: 'Gładzie gipsowe', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Malowanie ścian', unit: 'm2', pricePerUnit: 30, quantitySource: 'walls' },
      { name: 'Układanie paneli', unit: 'm2', pricePerUnit: 55, quantitySource: 'floor' },
      { name: 'Montaż listew przypodłogowych', unit: 'mb', pricePerUnit: 25, quantitySource: 'perimeter' },
    ],
  },

  // ========== BUDOWNICTWO ==========
  {
    name: 'Murowanie ścian',
    description: 'Budowa ścian nośnych lub działowych',
    category: 'budownictwo',
    services: [
      { name: 'Murowanie ścian z bloczków', unit: 'm2', pricePerUnit: 120, quantitySource: 'walls' },
      { name: 'Murowanie ścian z cegły', unit: 'm2', pricePerUnit: 180, quantitySource: 'walls' },
      { name: 'Nadproża', unit: 'mb', pricePerUnit: 150, quantitySource: 'manual' },
      { name: 'Tynk cementowo-wapienny', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Wylewka betonowa',
    description: 'Posadzka betonowa na gruncie lub stropie',
    category: 'budownictwo',
    services: [
      { name: 'Przygotowanie podłoża', unit: 'm2', pricePerUnit: 20, quantitySource: 'floor' },
      { name: 'Izolacja przeciwwilgociowa', unit: 'm2', pricePerUnit: 35, quantitySource: 'floor' },
      { name: 'Styropian podłogowy', unit: 'm2', pricePerUnit: 50, quantitySource: 'floor' },
      { name: 'Folia PE', unit: 'm2', pricePerUnit: 8, quantitySource: 'floor' },
      { name: 'Wylewka betonowa zbrojona', unit: 'm2', pricePerUnit: 85, quantitySource: 'floor' },
    ],
  },
  {
    name: 'Zabudowa poddasza',
    description: 'Wykończenie poddasza użytkowego',
    category: 'budownictwo',
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

  // ========== HYDRAULIKA ==========
  {
    name: 'Instalacja wod-kan',
    description: 'Wykonanie instalacji wodno-kanalizacyjnej',
    category: 'hydraulika',
    services: [
      { name: 'Punkt wodny', unit: 'szt', pricePerUnit: 450, quantitySource: 'manual' },
      { name: 'Punkt kanalizacyjny', unit: 'szt', pricePerUnit: 350, quantitySource: 'manual' },
      { name: 'Rury wodne PP', unit: 'mb', pricePerUnit: 85, quantitySource: 'manual' },
      { name: 'Rury kanalizacyjne', unit: 'mb', pricePerUnit: 95, quantitySource: 'manual' },
      { name: 'Montaż pionu wodnego', unit: 'kpl', pricePerUnit: 800, quantitySource: 'manual' },
      { name: 'Montaż pionu kanalizacyjnego', unit: 'kpl', pricePerUnit: 1200, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Wymiana grzejników',
    description: 'Demontaż starych i montaż nowych grzejników',
    category: 'hydraulika',
    services: [
      { name: 'Demontaż starego grzejnika', unit: 'szt', pricePerUnit: 100, quantitySource: 'manual' },
      { name: 'Montaż grzejnika płytowego', unit: 'szt', pricePerUnit: 350, quantitySource: 'manual' },
      { name: 'Montaż głowicy termostatycznej', unit: 'szt', pricePerUnit: 80, quantitySource: 'manual' },
      { name: 'Odpowietrzenie instalacji', unit: 'kpl', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },

  // ========== ELEKTRYKA ==========
  {
    name: 'Instalacja elektryczna',
    description: 'Wykonanie instalacji elektrycznej w mieszkaniu',
    category: 'elektryka',
    services: [
      { name: 'Punkt elektryczny (gniazdko)', unit: 'szt', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Punkt oświetleniowy', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
      { name: 'Kabel YDYp 3x2,5', unit: 'mb', pricePerUnit: 25, quantitySource: 'manual' },
      { name: 'Rozdzielnia elektryczna', unit: 'szt', pricePerUnit: 1500, quantitySource: 'manual' },
      { name: 'Montaż osprzętu', unit: 'szt', pricePerUnit: 45, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Wymiana instalacji elektrycznej',
    description: 'Wymiana starej instalacji aluminiowej na miedzianą',
    category: 'elektryka',
    services: [
      { name: 'Demontaż starej instalacji', unit: 'mb', pricePerUnit: 15, quantitySource: 'manual' },
      { name: 'Kucie bruzd', unit: 'mb', pricePerUnit: 35, quantitySource: 'manual' },
      { name: 'Kabel YDYp 3x2,5', unit: 'mb', pricePerUnit: 25, quantitySource: 'manual' },
      { name: 'Punkt elektryczny (gniazdko)', unit: 'szt', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Punkt oświetleniowy', unit: 'szt', pricePerUnit: 150, quantitySource: 'manual' },
      { name: 'Rozdzielnia elektryczna', unit: 'szt', pricePerUnit: 1500, quantitySource: 'manual' },
    ],
  },

  // ========== HVAC ==========
  {
    name: 'Klimatyzacja split',
    description: 'Montaż klimatyzatora typu split',
    category: 'hvac',
    services: [
      { name: 'Montaż jednostki wewnętrznej', unit: 'szt', pricePerUnit: 600, quantitySource: 'manual' },
      { name: 'Montaż jednostki zewnętrznej', unit: 'szt', pricePerUnit: 800, quantitySource: 'manual' },
      { name: 'Instalacja freonowa', unit: 'mb', pricePerUnit: 120, quantitySource: 'manual' },
      { name: 'Odprowadzenie skroplin', unit: 'mb', pricePerUnit: 60, quantitySource: 'manual' },
      { name: 'Uruchomienie i próżnia', unit: 'kpl', pricePerUnit: 400, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Rekuperacja',
    description: 'Montaż systemu wentylacji mechanicznej z odzyskiem ciepła',
    category: 'hvac',
    services: [
      { name: 'Centrala rekuperacyjna', unit: 'szt', pricePerUnit: 3500, quantitySource: 'manual' },
      { name: 'Kanały wentylacyjne', unit: 'mb', pricePerUnit: 85, quantitySource: 'manual' },
      { name: 'Anemostat nawiewny', unit: 'szt', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Anemostat wywiewny', unit: 'szt', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Czerpnia ścienna', unit: 'szt', pricePerUnit: 350, quantitySource: 'manual' },
      { name: 'Wyrzutnia ścienna', unit: 'szt', pricePerUnit: 350, quantitySource: 'manual' },
    ],
  },

  // ========== ELEWACJE I DACHY ==========
  {
    name: 'Elewacja - styropian',
    description: 'Ocieplenie elewacji styropianem',
    category: 'elewacje',
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
    category: 'elewacje',
    services: [
      { name: 'Gruntowanie ścian', unit: 'm2', pricePerUnit: 15, quantitySource: 'walls' },
      { name: 'Ocieplenie ścian', unit: 'm2', pricePerUnit: 120, quantitySource: 'walls' },
      { name: 'Klej + siatka (elewacja)', unit: 'm2', pricePerUnit: 45, quantitySource: 'walls' },
      { name: 'Tynk elewacyjny', unit: 'm2', pricePerUnit: 55, quantitySource: 'walls' },
      { name: 'Malowanie elewacji', unit: 'm2', pricePerUnit: 25, quantitySource: 'walls' },
    ],
  },
  {
    name: 'Pokrycie dachowe - dachówka',
    description: 'Wykonanie pokrycia dachowego z dachówki ceramicznej',
    category: 'elewacje',
    services: [
      { name: 'Łacenie dachu', unit: 'm2', pricePerUnit: 45, quantitySource: 'floor' },
      { name: 'Folia dachowa', unit: 'm2', pricePerUnit: 20, quantitySource: 'floor' },
      { name: 'Układanie dachówki', unit: 'm2', pricePerUnit: 90, quantitySource: 'floor' },
      { name: 'Obróbki blacharskie', unit: 'mb', pricePerUnit: 120, quantitySource: 'manual' },
      { name: 'Montaż rynien', unit: 'mb', pricePerUnit: 85, quantitySource: 'manual' },
    ],
  },

  // ========== BRUKARSTWO ==========
  {
    name: 'Podjazd z kostki',
    description: 'Wykonanie podjazdu z kostki brukowej',
    category: 'brukarstwo',
    services: [
      { name: 'Korytowanie', unit: 'm2', pricePerUnit: 35, quantitySource: 'floor' },
      { name: 'Podsypka piaskowa', unit: 'm2', pricePerUnit: 25, quantitySource: 'floor' },
      { name: 'Podbudowa z kruszywa', unit: 'm2', pricePerUnit: 45, quantitySource: 'floor' },
      { name: 'Układanie kostki brukowej', unit: 'm2', pricePerUnit: 85, quantitySource: 'floor' },
      { name: 'Obrzeża betonowe', unit: 'mb', pricePerUnit: 40, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Chodnik',
    description: 'Wykonanie chodnika z kostki brukowej',
    category: 'brukarstwo',
    services: [
      { name: 'Korytowanie', unit: 'm2', pricePerUnit: 30, quantitySource: 'floor' },
      { name: 'Podsypka piaskowa', unit: 'm2', pricePerUnit: 20, quantitySource: 'floor' },
      { name: 'Układanie kostki brukowej', unit: 'm2', pricePerUnit: 75, quantitySource: 'floor' },
      { name: 'Obrzeża betonowe', unit: 'mb', pricePerUnit: 35, quantitySource: 'perimeter' },
    ],
  },
  {
    name: 'Taras z płyt betonowych',
    description: 'Wykonanie tarasu z płyt betonowych wielkoformatowych',
    category: 'brukarstwo',
    services: [
      { name: 'Korytowanie', unit: 'm2', pricePerUnit: 35, quantitySource: 'floor' },
      { name: 'Podbudowa z kruszywa', unit: 'm2', pricePerUnit: 45, quantitySource: 'floor' },
      { name: 'Układanie płyt tarasowych', unit: 'm2', pricePerUnit: 120, quantitySource: 'floor' },
      { name: 'Obrzeża', unit: 'mb', pricePerUnit: 45, quantitySource: 'perimeter' },
    ],
  },

  // ========== OGRÓD ==========
  {
    name: 'Trawnik z siewu',
    description: 'Założenie trawnika metodą siewu',
    category: 'ogrod',
    services: [
      { name: 'Wyrównanie terenu', unit: 'm2', pricePerUnit: 15, quantitySource: 'floor' },
      { name: 'Nawiezienie ziemi', unit: 'm3', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Glebogryzowanie', unit: 'm2', pricePerUnit: 8, quantitySource: 'floor' },
      { name: 'Siew trawy', unit: 'm2', pricePerUnit: 12, quantitySource: 'floor' },
      { name: 'Wałowanie', unit: 'm2', pricePerUnit: 5, quantitySource: 'floor' },
    ],
  },
  {
    name: 'Trawnik z rolki',
    description: 'Założenie trawnika z rolki',
    category: 'ogrod',
    services: [
      { name: 'Wyrównanie terenu', unit: 'm2', pricePerUnit: 15, quantitySource: 'floor' },
      { name: 'Nawiezienie ziemi', unit: 'm3', pricePerUnit: 180, quantitySource: 'manual' },
      { name: 'Układanie trawy z rolki', unit: 'm2', pricePerUnit: 45, quantitySource: 'floor' },
      { name: 'Wałowanie', unit: 'm2', pricePerUnit: 5, quantitySource: 'floor' },
    ],
  },
  {
    name: 'System nawadniania',
    description: 'Montaż automatycznego systemu nawadniania ogrodu',
    category: 'ogrod',
    services: [
      { name: 'Projekt systemu', unit: 'kpl', pricePerUnit: 500, quantitySource: 'manual' },
      { name: 'Kopanie rowów', unit: 'mb', pricePerUnit: 25, quantitySource: 'manual' },
      { name: 'Rury PE', unit: 'mb', pricePerUnit: 15, quantitySource: 'manual' },
      { name: 'Zraszacz wynurzalny', unit: 'szt', pricePerUnit: 120, quantitySource: 'manual' },
      { name: 'Sterownik nawadniania', unit: 'szt', pricePerUnit: 800, quantitySource: 'manual' },
      { name: 'Elektrozawór', unit: 'szt', pricePerUnit: 180, quantitySource: 'manual' },
    ],
  },

  // ========== ŚLUSARSTWO ==========
  {
    name: 'Balustrada schodowa',
    description: 'Montaż balustrady schodowej ze stali nierdzewnej',
    category: 'slusarstwo',
    services: [
      { name: 'Pomiar i projekt', unit: 'kpl', pricePerUnit: 300, quantitySource: 'manual' },
      { name: 'Balustrada stal nierdzewna', unit: 'mb', pricePerUnit: 850, quantitySource: 'manual' },
      { name: 'Wypełnienie szkło', unit: 'm2', pricePerUnit: 450, quantitySource: 'manual' },
      { name: 'Montaż balustrady', unit: 'mb', pricePerUnit: 150, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Ogrodzenie panelowe',
    description: 'Montaż ogrodzenia z paneli ogrodzeniowych',
    category: 'slusarstwo',
    services: [
      { name: 'Wykop pod słupki', unit: 'szt', pricePerUnit: 50, quantitySource: 'manual' },
      { name: 'Betonowanie słupków', unit: 'szt', pricePerUnit: 80, quantitySource: 'manual' },
      { name: 'Montaż paneli ogrodzeniowych', unit: 'mb', pricePerUnit: 120, quantitySource: 'manual' },
      { name: 'Furtka', unit: 'szt', pricePerUnit: 800, quantitySource: 'manual' },
      { name: 'Brama przesuwna', unit: 'szt', pricePerUnit: 3500, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Balustrada balkonowa',
    description: 'Montaż balustrady balkonowej',
    category: 'slusarstwo',
    services: [
      { name: 'Pomiar i projekt', unit: 'kpl', pricePerUnit: 250, quantitySource: 'manual' },
      { name: 'Balustrada aluminiowa', unit: 'mb', pricePerUnit: 650, quantitySource: 'manual' },
      { name: 'Wypełnienie szkło', unit: 'm2', pricePerUnit: 400, quantitySource: 'manual' },
      { name: 'Montaż balustrady', unit: 'mb', pricePerUnit: 120, quantitySource: 'manual' },
    ],
  },

  // ========== ROBOTY ZIEMNE ==========
  {
    name: 'Wykopy fundamentowe',
    description: 'Wykonanie wykopów pod fundamenty budynku',
    category: 'ziemne',
    services: [
      { name: 'Zdjęcie warstwy humusu', unit: 'm2', pricePerUnit: 15, quantitySource: 'floor' },
      { name: 'Wykop koparką', unit: 'm3', pricePerUnit: 45, quantitySource: 'manual' },
      { name: 'Ręczne doczyszczenie', unit: 'm3', pricePerUnit: 120, quantitySource: 'manual' },
      { name: 'Wywóz ziemi', unit: 'm3', pricePerUnit: 65, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Niwelacja działki',
    description: 'Wyrównanie terenu działki budowlanej',
    category: 'ziemne',
    services: [
      { name: 'Zdjęcie warstwy humusu', unit: 'm2', pricePerUnit: 15, quantitySource: 'floor' },
      { name: 'Niwelacja terenu', unit: 'm2', pricePerUnit: 25, quantitySource: 'floor' },
      { name: 'Zagęszczenie podłoża', unit: 'm2', pricePerUnit: 12, quantitySource: 'floor' },
      { name: 'Wywóz nadmiaru ziemi', unit: 'm3', pricePerUnit: 65, quantitySource: 'manual' },
    ],
  },
  {
    name: 'Przyłącza do budynku',
    description: 'Wykonanie wykopów pod przyłącza mediów',
    category: 'ziemne',
    services: [
      { name: 'Wykop rowu', unit: 'mb', pricePerUnit: 85, quantitySource: 'manual' },
      { name: 'Podsypka piaskowa', unit: 'mb', pricePerUnit: 25, quantitySource: 'manual' },
      { name: 'Zasypanie i zagęszczenie', unit: 'mb', pricePerUnit: 35, quantitySource: 'manual' },
      { name: 'Przejście przez fundament', unit: 'szt', pricePerUnit: 350, quantitySource: 'manual' },
    ],
  },
]
