import type { QuantitySource, ServiceCategoryKey } from '@majsterio/shared'
import { SERVICE_CATEGORIES } from '@majsterio/shared'

// Re-eksport dla wstecznej kompatybilności
export const CATEGORIES = SERVICE_CATEGORIES
export type CategoryKey = ServiceCategoryKey

export interface SystemService {
  name: string
  unit: string
  category: CategoryKey
  quantitySource: QuantitySource
  defaultPrice: number
}

export const systemServices: SystemService[] = [
  // MALOWANIE I TYNKI
  { name: 'Malowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 30 },
  { name: 'Malowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling', defaultPrice: 35 },
  { name: 'Gruntowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 15 },
  { name: 'Gruntowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling', defaultPrice: 15 },
  { name: 'Gładzie gipsowe', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 55 },
  { name: 'Tynk cementowo-wapienny', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 55 },
  { name: 'Tynk gipsowy', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 60 },
  { name: 'Szpachlowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 40 },
  { name: 'Tapetowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 45 },
  { name: 'Demontaż tapety', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 20 },
  { name: 'Tynk dekoracyjny', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 120 },
  { name: 'Malowanie grzejnika', unit: 'szt', category: 'malowanie_tynki', quantitySource: 'manual', defaultPrice: 80 },
  { name: 'Malowanie drzwi', unit: 'szt', category: 'malowanie_tynki', quantitySource: 'manual', defaultPrice: 200 },
  { name: 'Przygotowanie ścian do malowania', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 12 },
  { name: 'Malowanie dekoracyjne', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 60 },
  { name: 'Kucie tynków', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 45 },
  { name: 'Skrobanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls', defaultPrice: 20 },

  // PODŁOGI
  { name: 'Układanie paneli', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 55 },
  { name: 'Układanie płytek podłogowych', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 130 },
  { name: 'Układanie płytek ściennych', unit: 'm2', category: 'podlogi', quantitySource: 'walls', defaultPrice: 140 },
  { name: 'Wylewka betonowa', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 45 },
  { name: 'Cyklinowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 35 },
  { name: 'Lakierowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 30 },
  { name: 'Montaż listew przypodłogowych', unit: 'mb', category: 'podlogi', quantitySource: 'perimeter', defaultPrice: 25 },
  { name: 'Demontaż starej podłogi', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 25 },
  { name: 'Układanie wykładziny', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 40 },
  { name: 'Hydroizolacja podłogi', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 55 },
  { name: 'Układanie mozaiki', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 280 },
  { name: 'Skucie starych płytek', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 50 },
  { name: 'Montaż cokołów z płytek', unit: 'mb', category: 'podlogi', quantitySource: 'perimeter', defaultPrice: 45 },
  { name: 'Wylewka samopoziomująca', unit: 'm2', category: 'podlogi', quantitySource: 'floor', defaultPrice: 40 },

  // HYDRAULIKA
  { name: 'Montaż umywalki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 200 },
  { name: 'Montaż WC', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 300 },
  { name: 'Montaż bidetu', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 250 },
  { name: 'Montaż wanny', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 400 },
  { name: 'Montaż brodzika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 350 },
  { name: 'Montaż baterii', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 150 },
  { name: 'Instalacja rur wod-kan', unit: 'mb', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 120 },
  { name: 'Montaż grzejnika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 250 },
  { name: 'Podłączenie pralki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 150 },
  { name: 'Podłączenie zmywarki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 150 },
  { name: 'Montaż kabiny prysznicowej', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 500 },
  { name: 'Montaż podgrzewacza wody', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 350 },
  { name: 'Montaż zlewozmywaka', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 200 },
  { name: 'Punkt hydrauliczny', unit: 'szt', category: 'hydraulika', quantitySource: 'manual', defaultPrice: 1000 },
  { name: 'Ogrzewanie podłogowe', unit: 'm2', category: 'hydraulika', quantitySource: 'floor', defaultPrice: 330 },

  // ELEKTRYKA
  { name: 'Punkt elektryczny', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 150 },
  { name: 'Montaż gniazdka', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 60 },
  { name: 'Montaż włącznika', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 50 },
  { name: 'Montaż lampy', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 80 },
  { name: 'Prowadzenie kabli', unit: 'mb', category: 'elektryka', quantitySource: 'manual', defaultPrice: 35 },
  { name: 'Montaż rozdzielnicy', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 800 },
  { name: 'Montaż domofonu', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 400 },
  { name: 'Montaż oświetlenia LED', unit: 'mb', category: 'elektryka', quantitySource: 'manual', defaultPrice: 50 },
  { name: 'Instalacja alarmu', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 600 },
  { name: 'Montaż kamery', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 300 },
  { name: 'Montaż punktu oświetleniowego', unit: 'szt', category: 'elektryka', quantitySource: 'manual', defaultPrice: 140 },

  // HVAC
  { name: 'Montaż klimatyzatora split', unit: 'szt', category: 'hvac', quantitySource: 'manual', defaultPrice: 1800 },
  { name: 'Montaż klimatyzatora multi-split', unit: 'szt', category: 'hvac', quantitySource: 'manual', defaultPrice: 2500 },
  { name: 'Montaż rekuperatora', unit: 'szt', category: 'hvac', quantitySource: 'manual', defaultPrice: 3500 },
  { name: 'Montaż wentylacji', unit: 'mb', category: 'hvac', quantitySource: 'manual', defaultPrice: 120 },
  { name: 'Serwis klimatyzacji', unit: 'szt', category: 'hvac', quantitySource: 'manual', defaultPrice: 300 },
  { name: 'Czyszczenie kanałów wentylacyjnych', unit: 'mb', category: 'hvac', quantitySource: 'manual', defaultPrice: 40 },

  // OGÓLNOBUDOWLANE
  { name: 'Stawianie ścianki działowej', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 120 },
  { name: 'Montaż płyt g-k', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 70 },
  { name: 'Montaż sufitu podwieszanego', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'ceiling', defaultPrice: 90 },
  { name: 'Wyburzenie ściany', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 80 },
  { name: 'Murowanie', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 180 },
  { name: 'Ocieplenie ścian', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 100 },
  { name: 'Montaż drzwi', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 350 },
  { name: 'Montaż okna', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 400 },
  { name: 'Montaż parapetu', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 120 },
  { name: 'Hydroizolacja ścian', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 60 },
  { name: 'Wykonanie schodów', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 2500 },
  { name: 'Naprawa tynków', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 45 },
  { name: 'Demontaż starego wykończenia', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 30 },
  { name: 'Zabudowa skosów GK', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 85 },
  { name: 'Sufity GK', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'ceiling', defaultPrice: 90 },
  { name: 'Paroizolacja', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 25 },
  { name: 'Klej + siatka (elewacja)', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 45 },
  { name: 'Tynk elewacyjny', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 55 },
  { name: 'Malowanie elewacji', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls', defaultPrice: 25 },
  { name: 'Montaż drzwi zewnętrznych', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 700 },
  { name: 'Demontaż drzwi', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual', defaultPrice: 250 },

  // ZIEMNE
  { name: 'Wykopy', unit: 'm3', category: 'ziemne', quantitySource: 'manual', defaultPrice: 80 },
  { name: 'Niwelacja terenu', unit: 'm2', category: 'ziemne', quantitySource: 'manual', defaultPrice: 25 },
  { name: 'Wywóz ziemi', unit: 'm3', category: 'ziemne', quantitySource: 'manual', defaultPrice: 120 },
  { name: 'Zasypywanie', unit: 'm3', category: 'ziemne', quantitySource: 'manual', defaultPrice: 60 },

  // OGRODOWE
  { name: 'Układanie kostki brukowej', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 90 },
  { name: 'Montaż ogrodzenia', unit: 'mb', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 150 },
  { name: 'Sadzenie drzew', unit: 'szt', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 100 },
  { name: 'Zakładanie trawnika', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 25 },
  { name: 'Budowa tarasu', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 250 },
  { name: 'Montaż obrzeży', unit: 'mb', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 35 },
  { name: 'System nawadniania', unit: 'szt', category: 'ogrodowe', quantitySource: 'manual', defaultPrice: 800 },

  // ŚLUSARSKIE
  { name: 'Spawanie', unit: 'mb', category: 'slusarskie', quantitySource: 'manual', defaultPrice: 50 },
  { name: 'Montaż balustrady', unit: 'mb', category: 'slusarskie', quantitySource: 'manual', defaultPrice: 700 },
  { name: 'Montaż bramy', unit: 'szt', category: 'slusarskie', quantitySource: 'manual', defaultPrice: 1200 },
  { name: 'Montaż furtki', unit: 'szt', category: 'slusarskie', quantitySource: 'manual', defaultPrice: 500 },
  { name: 'Naprawa zamków', unit: 'szt', category: 'slusarskie', quantitySource: 'manual', defaultPrice: 200 },
]
