
import { NigerianLocation } from "@/types/user";

export const nigerianStates: NigerianLocation[] = [
  {
    state: "Lagos",
    cities: ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Ajah", "Ikoyi", "Maryland", "Gbagada", "Alaba"]
  },
  {
    state: "Abuja",
    cities: ["Central Area", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Nyanya", "Karu", "Lugbe"]
  },
  {
    state: "Rivers",
    cities: ["Port Harcourt", "Obio-Akpor", "Eleme", "Tai", "Gokana", "Khana", "Ogba", "Omuma", "Ahoada", "Bonny"]
  },
  {
    state: "Kano",
    cities: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa", "Ungogo", "Kumbotso", "Warawa", "Kiru"]
  },
  {
    state: "Oyo",
    cities: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki", "Igboho", "Eruwa", "Igbo-Ora", "Lalupon", "Moniya"]
  },
  {
    state: "Kaduna",
    cities: ["Kaduna", "Zaria", "Kafanchan", "Kagoro", "Zonkwa", "Makarfi", "Sabon Gari", "Tudun Wada", "Barnawa", "Malali"]
  },
  {
    state: "Ogun",
    cities: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ilaro", "Shagamu", "Ayetoro", "Imeko", "Ipokia", "Owode"]
  },
  {
    state: "Delta",
    cities: ["Warri", "Sapele", "Ughelli", "Asaba", "Agbor", "Ozoro", "Oleh", "Kwale", "Abraka", "Oghara"]
  },
  {
    state: "Anambra",
    cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Nkpor", "Obosi", "Agulu", "Ihiala", "Ozubulu", "Ukpor"]
  },
  {
    state: "Enugu",
    cities: ["Enugu", "Nsukka", "Oji River", "Agbani", "Awgu", "Aninri", "Nkanu", "Udi", "Ezeagu", "Igbo-Eze"]
  }
];

export const getAllCities = (): string[] => {
  return nigerianStates.flatMap(state => state.cities);
};

export const getCitiesByState = (stateName: string): string[] => {
  const state = nigerianStates.find(s => s.state === stateName);
  return state ? state.cities : [];
};
