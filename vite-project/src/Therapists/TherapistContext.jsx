import { createContext, useState } from "react";
import Doct from "../images/photo_2026-03-04_02-40-53.jpg";

export const TherapistContext = createContext();

export function TherapistProvider({ children }) {
  const [therapists, setTherapists] = useState([
    {
      id: 1,
      name: "د. احمد علي",
      specialization: "علاج القلق",
      experience: "7 سنوات",
      image: Doct,
      rating: 4.8,
      about: "دكتور متخصص في العلاج النفسي",
    },
    {
      id: 2,
      name: "د. سارة",
      specialization: "علاج الاكتئاب",
      experience: "5 سنوات",
      image: Doct,
      rating: 4.7,
      about: "متخصصة في الصحة النفسية",
    },
  ]);

  return (
    <TherapistContext.Provider value={{ therapists }}>
      {children}
    </TherapistContext.Provider>
  );
}