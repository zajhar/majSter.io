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
}

export const systemServices: SystemService[] = [
  // MALOWANIE I TYNKI
  { name: 'Malowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Malowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling' },
  { name: 'Gruntowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Gruntowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling' },
  { name: 'Gładzie gipsowe', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tynk cementowo-wapienny', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tynk gipsowy', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Szpachlowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tapetowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },

  // PODŁOGI
  { name: 'Układanie paneli', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Układanie płytek podłogowych', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Układanie płytek ściennych', unit: 'm2', category: 'podlogi', quantitySource: 'walls' },
  { name: 'Wylewka betonowa', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Cyklinowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Lakierowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Montaż listew przypodłogowych', unit: 'mb', category: 'podlogi', quantitySource: 'perimeter' },
  { name: 'Demontaż starej podłogi', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },

  // HYDRAULIKA
  { name: 'Montaż umywalki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż WC', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż bidetu', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż wanny', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż brodzika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż baterii', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Instalacja rur wod-kan', unit: 'mb', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż grzejnika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Podłączenie pralki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Podłączenie zmywarki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },

  // ELEKTRYKA
  { name: 'Punkt elektryczny', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż gniazdka', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż włącznika', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż lampy', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Prowadzenie kabli', unit: 'mb', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż rozdzielnicy', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż domofonu', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },

  // HVAC
  { name: 'Montaż klimatyzatora split', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż klimatyzatora multi-split', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż rekuperatora', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż wentylacji', unit: 'mb', category: 'hvac', quantitySource: 'manual' },
  { name: 'Serwis klimatyzacji', unit: 'szt', category: 'hvac', quantitySource: 'manual' },

  // OGÓLNOBUDOWLANE
  { name: 'Stawianie ścianki działowej', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Montaż płyt g-k', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls' },
  { name: 'Montaż sufitu podwieszanego', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'ceiling' },
  { name: 'Wyburzenie ściany', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Murowanie', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Ocieplenie ścian', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls' },
  { name: 'Montaż drzwi', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Montaż okna', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual' },

  // ZIEMNE
  { name: 'Wykopy', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Niwelacja terenu', unit: 'm2', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Wywóz ziemi', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Zasypywanie', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },

  // OGRODOWE
  { name: 'Układanie kostki brukowej', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Montaż ogrodzenia', unit: 'mb', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Sadzenie drzew', unit: 'szt', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Zakładanie trawnika', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Budowa tarasu', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },

  // ŚLUSARSKIE
  { name: 'Spawanie', unit: 'mb', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż balustrady', unit: 'mb', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż bramy', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż furtki', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Naprawa zamków', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
]
