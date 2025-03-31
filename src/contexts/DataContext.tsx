
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

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
      } | null;
    };
  };
}

interface DataContextType {
  teachers: Teacher[];
  subjects: Subject[];
  sections: Section[];
  timetable: Timetable;
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;
  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
  addSection: (section: Omit<Section, "id">) => void;
  updateSection: (id: string, section: Partial<Section>) => void;
  removeSection: (id: string) => void;
  generateTimetable: () => boolean;
  resetTimetable: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Days and periods configuration
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS_PER_DAY = 8;

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [timetable, setTimetable] = useState<Timetable>({});
  const { toast } = useToast();

  // Teacher operations
  const addTeacher = (teacher: Omit<Teacher, "id">) => {
    const newTeacher = { ...teacher, id: generateId() };
    setTeachers([...teachers, newTeacher]);
    toast({
      title: "Teacher added",
      description: `${teacher.name} has been added to the system`,
    });
  };

  const updateTeacher = (id: string, teacherUpdate: Partial<Teacher>) => {
    setTeachers(
      teachers.map((t) => (t.id === id ? { ...t, ...teacherUpdate } : t))
    );
    toast({
      title: "Teacher updated",
      description: "Teacher information has been updated",
    });
  };

  const removeTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    toast({
      title: "Teacher removed",
      description: "Teacher has been removed from the system",
    });
  };

  // Subject operations
  const addSubject = (subject: Omit<Subject, "id">) => {
    const newSubject = { ...subject, id: generateId() };
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Subject added",
      description: `${subject.name} has been added to the system`,
    });
  };

  const updateSubject = (id: string, subjectUpdate: Partial<Subject>) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, ...subjectUpdate } : s))
    );
    toast({
      title: "Subject updated",
      description: "Subject information has been updated",
    });
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    toast({
      title: "Subject removed",
      description: "Subject has been removed from the system",
    });
  };

  // Section operations
  const addSection = (section: Omit<Section, "id">) => {
    const newSection = { ...section, id: generateId() };
    setSections([...sections, newSection]);
    toast({
      title: "Section added",
      description: `${section.name} has been added to the system`,
    });
  };

  const updateSection = (id: string, sectionUpdate: Partial<Section>) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, ...sectionUpdate } : s))
    );
    toast({
      title: "Section updated",
      description: "Section information has been updated",
    });
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    toast({
      title: "Section removed",
      description: "Section has been removed from the system",
    });
  };

  // Timetable generation
  const generateTimetable = () => {
    if (teachers.length === 0) {
      toast({
        title: "Unable to generate timetable",
        description: "Please add teachers first",
        variant: "destructive",
      });
      return false;
    }

    if (subjects.length === 0) {
      toast({
        title: "Unable to generate timetable",
        description: "Please add subjects first",
        variant: "destructive",
      });
      return false;
    }

    if (sections.length === 0) {
      toast({
        title: "Unable to generate timetable",
        description: "Please add sections first",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Initialize empty timetable
      const newTimetable: Timetable = {};
      sections.forEach((section) => {
        newTimetable[section.id] = {};
        DAYS.forEach((day) => {
          newTimetable[section.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            newTimetable[section.id][day][period] = null;
          }
        });
      });

      // Track teacher assignments
      const teacherAssignments: Record<string, number> = {};
      teachers.forEach((teacher) => {
        teacherAssignments[teacher.id] = 0;
      });

      // Track teacher availability by timeslot
      const teacherAvailability: Record<string, Record<string, Record<number, boolean>>> = {};
      teachers.forEach((teacher) => {
        teacherAvailability[teacher.id] = {};
        DAYS.forEach((day) => {
          teacherAvailability[teacher.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            teacherAvailability[teacher.id][day][period] = true;
          }
        });
      });

      // For each section and each subject assigned to that section
      sections.forEach((section) => {
        // Get all subjects for this section
        const sectionSubjects = subjects.filter((subject) => 
          subject.sections.includes(section.id)
        );

        sectionSubjects.forEach((subject) => {
          // Get hours per week for this subject in this section
          const hoursNeeded = subject.hoursPerWeek[section.id] || 0;
          if (hoursNeeded <= 0) return;

          // Get teachers who can teach this subject
          const eligibleTeachers = teachers.filter((teacher) => 
            teacher.subjects.includes(subject.id)
          );

          if (eligibleTeachers.length === 0) {
            throw new Error(`No teachers available for ${subject.name} in ${section.name}`);
          }

          // Allocate hours
          let hoursAllocated = 0;
          
          // Try to distribute evenly across days
          const daysToDistribute = Math.min(hoursNeeded, DAYS.length);
          const shuffledDays = [...DAYS].sort(() => 0.5 - Math.random());
          
          for (let dayIndex = 0; dayIndex < daysToDistribute && hoursAllocated < hoursNeeded; dayIndex++) {
            const day = shuffledDays[dayIndex];
            
            // Try to find an available period and teacher
            for (let period = 1; period <= PERIODS_PER_DAY && hoursAllocated < hoursNeeded; period++) {
              // Skip if this slot is already filled
              if (newTimetable[section.id][day][period] !== null) continue;
              
              // Find an available teacher for this slot
              const availableTeacher = eligibleTeachers.find((teacher) => 
                teacherAvailability[teacher.id][day][period] && 
                teacherAssignments[teacher.id] < teacher.maxHours
              );
              
              if (availableTeacher) {
                // Assign the teacher to this slot
                newTimetable[section.id][day][period] = {
                  teacherId: availableTeacher.id,
                  subjectId: subject.id,
                };
                
                // Update teacher availability and assignment count
                teacherAvailability[availableTeacher.id][day][period] = false;
                teacherAssignments[availableTeacher.id]++;
                hoursAllocated++;
              }
            }
          }
          
          // If we still need to allocate more hours, use any available slots
          if (hoursAllocated < hoursNeeded) {
            DAYS.forEach((day) => {
              for (let period = 1; period <= PERIODS_PER_DAY && hoursAllocated < hoursNeeded; period++) {
                // Skip if this slot is already filled
                if (newTimetable[section.id][day][period] !== null) continue;
                
                // Find an available teacher for this slot
                const availableTeacher = eligibleTeachers.find((teacher) => 
                  teacherAvailability[teacher.id][day][period] && 
                  teacherAssignments[teacher.id] < teacher.maxHours
                );
                
                if (availableTeacher) {
                  // Assign the teacher to this slot
                  newTimetable[section.id][day][period] = {
                    teacherId: availableTeacher.id,
                    subjectId: subject.id,
                  };
                  
                  // Update teacher availability and assignment count
                  teacherAvailability[availableTeacher.id][day][period] = false;
                  teacherAssignments[availableTeacher.id]++;
                  hoursAllocated++;
                }
              }
            });
          }
          
          if (hoursAllocated < hoursNeeded) {
            toast({
              title: "Warning",
              description: `Could only allocate ${hoursAllocated}/${hoursNeeded} hours for ${subject.name} in ${section.name}`,
              variant: "destructive",
            });
          }
        });
      });

      setTimetable(newTimetable);
      
      toast({
        title: "Timetable generated successfully",
        description: "The timetable has been created without any conflicts",
      });
      
      return true;
    } catch (error) {
      console.error("Timetable generation error:", error);
      toast({
        title: "Timetable generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetTimetable = () => {
    setTimetable({});
    toast({
      title: "Timetable reset",
      description: "The timetable has been cleared",
    });
  };

  return (
    <DataContext.Provider
      value={{
        teachers,
        subjects,
        sections,
        timetable,
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
