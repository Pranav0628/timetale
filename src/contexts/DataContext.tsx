import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  maxHours: number;
}

export interface Subject {
  id: string;
  name: string;
  sections: string[];
  hoursPerWeek: Record<string, number>; // section -> hours per week
  type: "lecture" | "lab"; // Added subject type
  location?: string; // Optional location for labs
}

export interface Section {
  id: string;
  name: string;
}

export interface TimeSlot {
  day: string;
  period: number;
  teacherId: string;
  subjectId: string;
  sectionId: string;
}

export interface Timetable {
  [sectionId: string]: {
    [day: string]: {
      [period: number]: {
        teacherId: string;
        subjectId: string;
        type?: "lecture" | "lab"; // Add type to the timetable slot
        location?: string; // Add location to the timetable slot
      } | null;
    };
  };
}

interface DataContextType {
  teachers: Teacher[];
  subjects: Subject[];
  sections: Section[];
  timetable: Timetable;
  loading: boolean;
  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  removeTeacher: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, "id">) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  addSection: (section: Omit<Section, "id">) => Promise<void>;
  updateSection: (id: string, section: Partial<Section>) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  generateTimetable: () => Promise<boolean>;
  resetTimetable: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

const API_URL = "http://localhost/timetable/api";

const ENABLE_MOCKUP = true;

const generateId = () => Math.random().toString(36).substring(2, 9);

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS_PER_DAY = 8;

export const LAB_LOCATIONS = [
  "DBMS LAB A-420",
  "S/W LAB A-406",
  "N/W LAB A-402",
  "H/W LAB A-417",
  "PL-II LAB A-413"
];

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
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

  const addTeacher = async (teacher: Omit<Teacher, "id">) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/teachers/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacher),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newTeacher = { ...teacher, id: generateId() };
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Teacher added",
        description: `${teacher.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error adding teacher",
        description: "Failed to add the teacher.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
    setLoading(true);
    try {
      setTeachers(teachers.map((t) => (t.id === id ? { ...t, ...teacher } : t)));
      toast({
        title: "Teacher updated",
        description: `${teacher.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error updating teacher",
        description: "Failed to update the teacher.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (id: string) => {
    setLoading(true);
    try {
      setTeachers(teachers.filter((teacher) => teacher.id !== id));
      toast({
        title: "Teacher removed",
        description: "The teacher has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast({
        title: "Error removing teacher",
        description: "Failed to remove the teacher.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (subject: Omit<Subject, "id">) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/subjects/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subject),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newSubject = { ...subject, id: generateId() };
      setSubjects([...subjects, newSubject]);
      toast({
        title: "Subject added",
        description: `${subject.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error adding subject",
        description: "Failed to add the subject.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id: string, subject: Partial<Subject>) => {
    setLoading(true);
    try {
      setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...subject } : s)));
      toast({
        title: "Subject updated",
        description: `${subject.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating subject:", error);
      toast({
        title: "Error updating subject",
        description: "Failed to update the subject.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSubject = async (id: string) => {
    setLoading(true);
    try {
      setSubjects(subjects.filter((subject) => subject.id !== id));
      toast({
        title: "Subject removed",
        description: "The subject has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing subject:", error);
      toast({
        title: "Error removing subject",
        description: "Failed to remove the subject.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSection = async (section: Omit<Section, "id">) => {
    setLoading(true);
    try {
      console.log("Adding section in mock mode:", section);
      
      if (ENABLE_MOCKUP) {
        const newSection = { ...section, id: generateId() };
        console.log("Created new section:", newSection);
        setSections(prevSections => [...prevSections, newSection]);
      } else {
        const response = await fetch(`${API_URL}/sections/create.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(section),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newSection = { ...section, id: generateId() };
        setSections([...sections, newSection]);
      }
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, section: Partial<Section>) => {
    setLoading(true);
    try {
      if (!ENABLE_MOCKUP) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSections(prevSections => 
        prevSections.map((s) => (s.id === id ? { ...s, ...section } : s))
      );
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeSection = async (id: string) => {
    setLoading(true);
    try {
      if (!ENABLE_MOCKUP) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSections(prevSections => prevSections.filter((section) => section.id !== id));
    } catch (error) {
      console.error("Error removing section:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    setLoading(true);
    try {
      const newTimetable: Timetable = {};
      sections.forEach((section) => {
        newTimetable[section.id] = {};
        DAYS.forEach((day) => {
          newTimetable[section.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            const availableSubjects = subjects.filter(subject => subject.sections.includes(section.id));
            if (availableSubjects.length > 0) {
              const randomSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
              const availableTeachers = teachers.filter(teacher => teacher.subjects.includes(randomSubject.name));
              if (availableTeachers.length > 0) {
                const randomTeacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
                newTimetable[section.id][day][period] = {
                  teacherId: randomTeacher.id,
                  subjectId: randomSubject.id,
                  type: randomSubject.type,
                  location: randomSubject.location
                };
              } else {
                newTimetable[section.id][day][period] = null;
              }
            } else {
              newTimetable[section.id][day][period] = null;
            }
          }
        });
      });
      setTimetable(newTimetable);
      toast({
        title: "Timetable generated",
        description: "A new timetable has been generated successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Error generating timetable",
        description: "Failed to generate the timetable.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetTimetable = async () => {
    setLoading(true);
    try {
      const emptyTimetable: Timetable = {};
      sections.forEach((section) => {
        emptyTimetable[section.id] = {};
        DAYS.forEach((day) => {
          emptyTimetable[section.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            emptyTimetable[section.id][day][period] = null;
          }
        });
      });
      setTimetable(emptyTimetable);
      toast({
        title: "Timetable reset",
        description: "The timetable has been reset to its initial state.",
      });
    } catch (error) {
      console.error("Error resetting timetable:", error);
      toast({
        title: "Error resetting timetable",
        description: "Failed to reset the timetable.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        teachers,
        subjects,
        sections,
        timetable,
        loading,
        addTeacher,
        updateTeacher,
        removeTeacher,
        addSubject,
        updateSubject,
        removeSubject,
        addSection,
        updateSection,
        removeSection,
        generateTimetable,
        resetTimetable,
        fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
