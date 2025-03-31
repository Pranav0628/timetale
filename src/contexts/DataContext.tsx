import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
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

// API base URL - update this to your PHP API endpoint
const API_URL = "http://localhost/timetable/api";

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
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch all data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch teachers
      const teachersResponse = await fetch(`${API_URL}/teachers/read.php`);
      const teachersData = await teachersResponse.json();
      setTeachers(teachersData);

      // Fetch subjects
      const subjectsResponse = await fetch(`${API_URL}/subjects/read.php`);
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      // Fetch sections
      const sectionsResponse = await fetch(`${API_URL}/sections/read.php`);
      const sectionsData = await sectionsResponse.json();
      setSections(sectionsData);

      // Fetch timetable
      const timetableResponse = await fetch(`${API_URL}/timetable/get.php`);
      const timetableData = await timetableResponse.json();
      setTimetable(timetableData);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Data fetch error",
        description: "There was an error loading data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Teacher operations
  const addTeacher = async (teacher: Omit<Teacher, "id">) => {
    try {
      const response = await fetch(`${API_URL}/teachers/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacher),
      });
      
      const data = await response.json();
      
      if (data.id) {
        const newTeacher = { ...teacher, id: data.id };
        setTeachers([...teachers, newTeacher]);
        
        toast({
          title: "Teacher added",
          description: `${teacher.name} has been added to the system`,
        });
      } else {
        throw new Error(data.message || "Failed to add teacher");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add teacher",
        variant: "destructive",
      });
    }
  };

  const updateTeacher = async (id: string, teacherUpdate: Partial<Teacher>) => {
    try {
      const response = await fetch(`${API_URL}/teachers/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...teacherUpdate }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeachers(
          teachers.map((t) => (t.id === id ? { ...t, ...teacherUpdate } : t))
        );
        
        toast({
          title: "Teacher updated",
          description: "Teacher information has been updated",
        });
      } else {
        throw new Error(data.message || "Failed to update teacher");
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update teacher",
        variant: "destructive",
      });
    }
  };

  const removeTeacher = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/teachers/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeachers(teachers.filter((t) => t.id !== id));
        
        toast({
          title: "Teacher removed",
          description: "Teacher has been removed from the system",
        });
      } else {
        throw new Error(data.message || "Failed to remove teacher");
      }
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove teacher",
        variant: "destructive",
      });
    }
  };

  // Subject operations
  const addSubject = async (subject: Omit<Subject, "id">) => {
    try {
      const response = await fetch(`${API_URL}/subjects/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      });
      
      const data = await response.json();
      
      if (data.id) {
        const newSubject = { ...subject, id: data.id };
        setSubjects([...subjects, newSubject]);
        
        toast({
          title: "Subject added",
          description: `${subject.name} has been added to the system`,
        });
      } else {
        throw new Error(data.message || "Failed to add subject");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add subject",
        variant: "destructive",
      });
    }
  };

  const updateSubject = async (id: string, subjectUpdate: Partial<Subject>) => {
    try {
      const response = await fetch(`${API_URL}/subjects/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...subjectUpdate }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubjects(
          subjects.map((s) => (s.id === id ? { ...s, ...subjectUpdate } : s))
        );
        
        toast({
          title: "Subject updated",
          description: "Subject information has been updated",
        });
      } else {
        throw new Error(data.message || "Failed to update subject");
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  const removeSubject = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/subjects/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubjects(subjects.filter((s) => s.id !== id));
        
        toast({
          title: "Subject removed",
          description: "Subject has been removed from the system",
        });
      } else {
        throw new Error(data.message || "Failed to remove subject");
      }
    } catch (error) {
      console.error("Error removing subject:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove subject",
        variant: "destructive",
      });
    }
  };

  // Section operations
  const addSection = async (section: Omit<Section, "id">) => {
    try {
      const response = await fetch(`${API_URL}/sections/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(section),
      });
      
      const data = await response.json();
      
      if (data.id) {
        const newSection = { ...section, id: data.id };
        setSections([...sections, newSection]);
        
        toast({
          title: "Section added",
          description: `${section.name} has been added to the system`,
        });
      } else {
        throw new Error(data.message || "Failed to add section");
      }
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add section",
        variant: "destructive",
      });
    }
  };

  const updateSection = async (id: string, sectionUpdate: Partial<Section>) => {
    try {
      const response = await fetch(`${API_URL}/sections/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...sectionUpdate }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSections(
          sections.map((s) => (s.id === id ? { ...s, ...sectionUpdate } : s))
        );
        
        toast({
          title: "Section updated",
          description: "Section information has been updated",
        });
      } else {
        throw new Error(data.message || "Failed to update section");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const removeSection = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/sections/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSections(sections.filter((s) => s.id !== id));
        
        toast({
          title: "Section removed",
          description: "Section has been removed from the system",
        });
      } else {
        throw new Error(data.message || "Failed to remove section");
      }
    } catch (error) {
      console.error("Error removing section:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove section",
        variant: "destructive",
      });
    }
  };

  // Timetable generation with collision prevention
  const generateTimetable = async () => {
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

      // Track teacher availability by timeslot across all sections
      const teacherTimeSlots: Record<string, Record<string, Record<number, boolean>>> = {};
      teachers.forEach((teacher) => {
        teacherTimeSlots[teacher.id] = {};
        DAYS.forEach((day) => {
          teacherTimeSlots[teacher.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            teacherTimeSlots[teacher.id][day][period] = true;
          }
        });
      });

      // Create a priority queue for subjects based on constraints
      const subjectPriorities: Array<{ 
        sectionId: string, 
        subjectId: string, 
        hoursNeeded: number,
        eligibleTeachersCount: number 
      }> = [];

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

          // Add to priority queue
          subjectPriorities.push({
            sectionId: section.id,
            subjectId: subject.id,
            hoursNeeded,
            eligibleTeachersCount: eligibleTeachers.length
          });
        });
      });

      // Sort subjects by eligibleTeachersCount (ascending) and hoursNeeded (descending)
      subjectPriorities.sort((a, b) => {
        if (a.eligibleTeachersCount !== b.eligibleTeachersCount) {
          return a.eligibleTeachersCount - b.eligibleTeachersCount;
        }
        return b.hoursNeeded - a.hoursNeeded;
      });

      // Process subjects by priority
      for (const subjectPriority of subjectPriorities) {
        const { sectionId, subjectId, hoursNeeded } = subjectPriority;
        
        // Get the section and subject objects
        const section = sections.find(s => s.id === sectionId)!;
        const subject = subjects.find(s => s.id === subjectId)!;
        
        // Get eligible teachers
        const eligibleTeachers = teachers.filter((teacher) => 
          teacher.subjects.includes(subjectId)
        );

        // Try to distribute evenly across days
        let hoursAllocated = 0;
        
        // Try to allocate maximum 2 periods per day for a subject if possible
        const maxPeriodsPerDay = Math.min(2, Math.ceil(hoursNeeded / DAYS.length));
        
        // Keep track of allocations per day for this subject
        const allocationsPerDay: Record<string, number> = {};
        DAYS.forEach(day => {
          allocationsPerDay[day] = 0;
        });
        
        // First, try to distribute evenly across days
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        while (hoursAllocated < hoursNeeded && attempts < maxAttempts) {
          attempts++;
          
          // Find days with fewer allocations first
          const daysByAllocation = [...DAYS].sort((a, b) => 
            allocationsPerDay[a] - allocationsPerDay[b]
          );
          
          let allocated = false;
          
          for (const day of daysByAllocation) {
            // Skip if already at max periods for this day
            if (allocationsPerDay[day] >= maxPeriodsPerDay) continue;
            
            // Try to find an available period in this day
            for (let period = 1; period <= PERIODS_PER_DAY; period++) {
              // Skip if this slot is already filled
              if (newTimetable[sectionId][day][period] !== null) continue;
              
              // Find an available teacher for this slot
              const availableTeacher = eligibleTeachers.find((teacher) => 
                // Check if teacher is available at this time slot (not assigned to any other section)
                teacherTimeSlots[teacher.id][day][period] === true && 
                // Check if teacher hasn't exceeded max hours
                teacherAssignments[teacher.id] < teacher.maxHours
              );
              
              if (availableTeacher) {
                // Assign the teacher to this slot
                newTimetable[sectionId][day][period] = {
                  teacherId: availableTeacher.id,
                  subjectId,
                };
                
                // Mark teacher as busy for this time slot across all sections
                teacherTimeSlots[availableTeacher.id][day][period] = false;
                
                // Update teacher assignment count
                teacherAssignments[availableTeacher.id]++;
                
                // Update hours allocated and day allocations
                hoursAllocated++;
                allocationsPerDay[day]++;
                allocated = true;
                break;
              }
            }
            
            if (allocated) break;
          }
          
          // If we couldn't allocate in any day, relax the max periods per day constraint
          if (!allocated) {
            // If we've tried enough times without success, just try to fit anywhere
            if (attempts > DAYS.length * 2) {
              for (const day of DAYS) {
                for (let period = 1; period <= PERIODS_PER_DAY; period++) {
                  // Skip if this slot is already filled
                  if (newTimetable[sectionId][day][period] !== null) continue;
                  
                  // Find any available teacher
                  const availableTeacher = eligibleTeachers.find((teacher) => 
                    teacherTimeSlots[teacher.id][day][period] === true && 
                    teacherAssignments[teacher.id] < teacher.maxHours
                  );
                  
                  if (availableTeacher) {
                    // Assign the teacher to this slot
                    newTimetable[sectionId][day][period] = {
                      teacherId: availableTeacher.id,
                      subjectId,
                    };
                    
                    // Mark teacher as busy for this time slot
                    teacherTimeSlots[availableTeacher.id][day][period] = false;
                    teacherAssignments[availableTeacher.id]++;
                    hoursAllocated++;
                    allocated = true;
                    break;
                  }
                }
                if (allocated) break;
              }
            }
          }
          
          // If we still couldn't allocate, break the loop
          if (!allocated) break;
        }
        
        if (hoursAllocated < hoursNeeded) {
          toast({
            title: "Warning",
            description: `Could only allocate ${hoursAllocated}/${hoursNeeded} hours for ${subject.name} in ${section.name}`,
            variant: "destructive",
          });
        }
      }

      setTimetable(newTimetable);
      
      // After generating the timetable, save it to the database
      await saveTimetable(newTimetable);
      
      toast({
        title: "Timetable generated successfully",
        description: "The timetable has been created and saved to the database",
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

  const saveTimetable = async (timetableData: Timetable) => {
    try {
      const response = await fetch(`${API_URL}/timetable/save.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timetable: timetableData }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to save timetable");
      }
    } catch (error) {
      console.error("Error saving timetable:", error);
      throw error;
    }
  };

  const resetTimetable = async () => {
    try {
      const response = await fetch(`${API_URL}/timetable/reset.php`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
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
          description: "The timetable has been cleared",
        });
      } else {
        throw new Error(data.message || "Failed to reset timetable");
      }
    } catch (error) {
      console.error("Error resetting timetable:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset timetable",
        variant: "destructive",
      });
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
