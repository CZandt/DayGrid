import React, { createContext, useContext, useState } from "react";
import { Quadrant } from "../types/types";

interface AppContextProps {
  plannedDay: boolean;
  setPlannedDay: React.Dispatch<React.SetStateAction<boolean>>;

  dayCollectionID: string;
  setDayCollectionID: React.Dispatch<React.SetStateAction<string>>;

  reviewedDayG: boolean;
  setReviewedDayG: React.Dispatch<React.SetStateAction<boolean>>;

  reviewScoresG: number[];
  setReviewScoresG: React.Dispatch<React.SetStateAction<number[]>>;

  uFirstName: string;
  setUFirstName: React.Dispatch<React.SetStateAction<string>>;

  uLastName: string;
  setULastName: React.Dispatch<React.SetStateAction<string>>;

  quadrants: Quadrant[];
  setQuadrants: React.Dispatch<React.SetStateAction<Quadrant[]>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [plannedDay, setPlannedDay] = useState(false);
  const [dayCollectionID, setDayCollectionID] = useState("");
  const [reviewedDayG, setReviewedDayG] = useState(false);
  const [reviewScoresG, setReviewScoresG] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [uFirstName, setUFirstName] = useState("");
  const [uLastName, setULastName] = useState("");

  const [quadrants, setQuadrants] = useState<Quadrant[]>([]);

  return (
    <AppContext.Provider
      value={{
        plannedDay,
        setPlannedDay,
        dayCollectionID,
        setDayCollectionID,
        reviewedDayG,
        setReviewedDayG,
        reviewScoresG,
        setReviewScoresG,
        uFirstName,
        setUFirstName,
        setULastName,
        uLastName,
        quadrants,
        setQuadrants,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};
