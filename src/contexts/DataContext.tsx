
import React, { createContext, useContext, ReactNode } from "react";
import { DataStateProvider, useDataState } from "./DataContextState";
import { useTeacherService } from "@/services/teacherService";
import { useSubjectService } from "@/services/subjectService";
import { useSectionService } from "@/services/sectionService";
import { useTimetableService } from "@/services/timetableService";
import { Teacher, Subject, Section, TimeSlot, Timetable, DAYS, PERIODS_PER_DAY, LAB_LOCATIONS } from "@/types/timetable";

// Export types and constants from here so consumers don't need to import from multiple places
export { DAYS, PERIODS_PER_DAY, LAB_LOCATIONS };
export type { Teacher, Subject, Section, TimeSlot, Timetable };

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

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Wrap all the services together
  const DataProviderWithServices: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get state from the DataStateProvider
    const { 
      teachers, 
      subjects, 
      sections, 
      timetable, 
      loading, 
      fetchData 
    } = useDataState();

    // Get service methods
    const teacherService = useTeacherService();
    const subjectService = useSubjectService();
    const sectionService = useSectionService();
    const timetableService = useTimetableService();

    // Combine all in one context
    return (
      <DataContext.Provider
        value={{
          teachers,
          subjects,
          sections,
          timetable,
          loading,
          addTeacher: teacherService.addTeacher,
          updateTeacher: teacherService.updateTeacher,
          removeTeacher: teacherService.removeTeacher,
          addSubject: subjectService.addSubject,
          updateSubject: subjectService.updateSubject,
          removeSubject: subjectService.removeSubject,
          addSection: sectionService.addSection,
          updateSection: sectionService.updateSection,
          removeSection: sectionService.removeSection,
          generateTimetable: timetableService.generateTimetable,
          resetTimetable: timetableService.resetTimetable,
          fetchData,
        }}
      >
        {children}
      </DataContext.Provider>
    );
  };

  // Wrap the services provider with the state provider
  return (
    <DataStateProvider>
      <DataProviderWithServices>{children}</DataProviderWithServices>
    </DataStateProvider>
  );
};
