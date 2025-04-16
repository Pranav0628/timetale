
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import {
  Teacher,
  Subject,
  Section,
  Timetable,
  DAYS
} from "@/types/timetable";

// Context type definition
interface DataContextType {
  teachers: Teacher[];
  subjects: Subject[];
  sections: Section[];
  timetable: Timetable;
  loading: boolean;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setTimetable: React.Dispatch<React.SetStateAction<Timetable>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchData: () => Promise<void>;
}

const DataStateContext = createContext<DataContextType | undefined>(undefined);

export const useDataState = () => {
  const context = useContext(DataStateContext);
  if (!context) {
    throw new Error("useDataState must be used within a DataProvider");
  }
  return context;
};

interface DataStateProviderProps {
  children: ReactNode;
}

const API_URL = "http://localhost/timetable/api";
const ENABLE_MOCKUP = true;

export const DataStateProvider: React.FC<DataStateProviderProps> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [timetable, setTimetable] = useState<Timetable>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setTeachers([]);
      setSubjects([]);
      setSections([]);
      setTimetable({});
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (ENABLE_MOCKUP) {
        console.log("Using mockup mode with zero initial data");
        
        setTeachers([]);
        setSubjects([]);
        setSections([]);
        
        const emptyTimetable: Timetable = {};
        setTimetable(emptyTimetable);
        
        toast({
          title: "Mock Mode Initialized",
          description: "Starting with zero initial data",
        });
      } else {
        const teachersResponse = await fetch(`${API_URL}/teachers/read.php`);
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData);

        const subjectsResponse = await fetch(`${API_URL}/subjects/read.php`);
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);

        const sectionsResponse = await fetch(`${API_URL}/sections/read.php`);
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);

        const timetableResponse = await fetch(`${API_URL}/timetable/get.php`);
        const timetableData = await timetableResponse.json();
        setTimetable(timetableData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Data fetch error",
        description: "Error loading data.",
        variant: "destructive",
      });
      
      setTeachers([]);
      setSubjects([]);
      setSections([]);
      setTimetable({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataStateContext.Provider
      value={{
        teachers,
        subjects,
        sections,
        timetable,
        loading,
        setTeachers,
        setSubjects,
        setSections,
        setTimetable,
        setLoading,
        fetchData,
      }}
    >
      {children}
    </DataStateContext.Provider>
  );
};

export const useContext = React.useContext;
