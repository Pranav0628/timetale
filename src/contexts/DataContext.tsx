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
  type: "lecture" | "lab"; // Added subject type
  location?: string; // Optional location for labs
}

export interface Section {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  type: "regular" | "break";
  label?: string;
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
export const PERIODS_PER_DAY = 7; // Changed from 8 to 7 to match the actual lecture periods

export const TIME_SLOTS = [
  { id: 1, startTime: "8:45", endTime: "9:45", type: "regular" as const },
  { id: 2, startTime: "9:45", endTime: "10:45", type: "regular" as const },
  { id: 3, startTime: "10:45", endTime: "11:00", type: "break" as const, label: "SHORT RECESS" },
  { id: 4, startTime: "11:00", endTime: "12:00", type: "regular" as const },
  { id: 5, startTime: "12:00", endTime: "1:00", type: "regular" as const },
  { id: 6, startTime: "1:00", endTime: "1:45", type: "break" as const, label: "LUNCH BREAK" },
  { id: 7, startTime: "1:45", endTime: "2:45", type: "regular" as const },
  { id: 8, startTime: "2:45", endTime: "3:45", type: "regular" as const },
  { id: 9, startTime: "3:45", endTime: "4:30", type: "regular" as const },
];

export const PERIOD_MAPPING: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 8,
  7: 9
};

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

// Updated lab schedule for better distribution
const LAB_SCHEDULE = {
  "Monday": { maxLabs: 1, periods: [1, 2] },    // One lab in first two periods
  "Tuesday": { maxLabs: 1, periods: [3, 4] },   // One lab in middle periods
  "Wednesday": { maxLabs: 1, periods: [5, 6] }, // One lab in later periods
  "Thursday": { maxLabs: 1, periods: [6, 7] },  // Updated to use periods 6,7 instead of 7,8
  "Friday": { maxLabs: 2, periods: [1, 2, 5, 6] } // Two labs allowed
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [timetable, setTimetable] = useState<Timetable>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (ENABLE_MOCKUP) {
        console.log("Using mockup data mode");
        
        // Initialize mock sections
        const mockSections: Section[] = [
          { id: "s1", name: "A" },
          { id: "s2", name: "B" },
          { id: "s3", name: "C" }
        ];
        
        // Initialize mock subjects with hours per week
        const mockSubjects: Subject[] = [
          { 
            id: "sub1", 
            name: "DSA",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 3, "s2": 3, "s3": 3 },
            type: "lecture"
          },
          { 
            id: "sub2", 
            name: "DSAL",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 2, "s2": 2, "s3": 2 },
            type: "lab",
            location: "DBMS LAB A-420"
          },
          { 
            id: "sub3", 
            name: "PPL",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 3, "s2": 3, "s3": 3 },
            type: "lecture"
          },
          { 
            id: "sub4", 
            name: "PBL",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 2, "s2": 2, "s3": 2 },
            type: "lab",
            location: "S/W LAB A-406"
          },
          { 
            id: "sub5", 
            name: "MP",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 3, "s2": 3, "s3": 3 },
            type: "lecture"
          },
          { 
            id: "sub6", 
            name: "MPL",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 2, "s2": 2, "s3": 2 },
            type: "lab",
            location: "H/W LAB A-417"
          },
          { 
            id: "sub7", 
            name: "SE",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 3, "s2": 3, "s3": 3 },
            type: "lecture"
          },
          { 
            id: "sub8", 
            name: "M3",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 4, "s2": 4, "s3": 4 },
            type: "lecture"
          },
          { 
            id: "sub9", 
            name: "M3 TUT",
            sections: ["s1", "s2", "s3"],
            hoursPerWeek: { "s1": 1, "s2": 1, "s3": 1 },
            type: "lecture"
          }
        ];
        
        setSections(mockSections);
        setSubjects(mockSubjects);
        setTeachers([]);
        
        const emptyTimetable: Timetable = {};
        mockSections.forEach((section) => {
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
          title: "Mock data mode",
          description: "Add teachers to generate a timetable for the predefined sections and subjects",
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
        description: "Unable to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTeacher = async (teacher: Omit<Teacher, "id">) => {
    try {
      if (ENABLE_MOCKUP) {
        const newTeacher = { ...teacher, id: generateId() };
        setTeachers([...teachers, newTeacher]);
        
        toast({
          title: "Teacher added (Mock Mode)",
          description: `${teacher.name} has been added to the system`,
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setTeachers(
          teachers.map((t) => (t.id === id ? { ...t, ...teacherUpdate } : t))
        );
        
        toast({
          title: "Teacher updated (Mock Mode)",
          description: "Teacher information has been updated",
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setTeachers(teachers.filter((t) => t.id !== id));
        
        toast({
          title: "Teacher removed (Mock Mode)",
          description: "Teacher has been removed from the system",
        });
        return;
      }
      
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

  const addSubject = async (subject: Omit<Subject, "id">) => {
    try {
      if (ENABLE_MOCKUP) {
        const newSubject = { ...subject, id: generateId() };
        setSubjects([...subjects, newSubject]);
        
        toast({
          title: "Subject added (Mock Mode)",
          description: `${subject.name} has been added to the system`,
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setSubjects(
          subjects.map((s) => (s.id === id ? { ...s, ...subjectUpdate } : s))
        );
        
        toast({
          title: "Subject updated (Mock Mode)",
          description: "Subject information has been updated",
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setSubjects(subjects.filter((s) => s.id !== id));
        
        toast({
          title: "Subject removed (Mock Mode)",
          description: "Subject has been removed from the system",
        });
        return;
      }
      
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

  const addSection = async (section: Omit<Section, "id">) => {
    try {
      if (ENABLE_MOCKUP) {
        const newId = generateId();
        const newSection = { ...section, id: newId };
        setSections([...sections, newSection]);
        
        const newTimetable = { ...timetable };
        newTimetable[newId] = {};
        DAYS.forEach((day) => {
          newTimetable[newId][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            newTimetable[newId][day][period] = null;
          }
        });
        setTimetable(newTimetable);
        
        toast({
          title: "Section added (Mock Mode)",
          description: `${section.name} has been added to the system`,
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setSections(
          sections.map((s) => (s.id === id ? { ...s, ...sectionUpdate } : s))
        );
        
        toast({
          title: "Section updated (Mock Mode)",
          description: "Section information has been updated",
        });
        return;
      }
      
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
      if (ENABLE_MOCKUP) {
        setSections(sections.filter((s) => s.id !== id));
        
        const newTimetable = { ...timetable };
        delete newTimetable[id];
        setTimetable(newTimetable);
        
        toast({
          title: "Section removed (Mock Mode)",
          description: "Section has been removed from the system",
        });
        return;
      }
      
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

      // Track teacher's assignments and availability
      const teacherAssignments: Record<string, number> = {};
      teachers.forEach((teacher) => {
        teacherAssignments[teacher.id] = 0;
      });

      // Initialize teacher availability for all time slots
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

      // Prioritize subjects based on constraints
      const subjectPriorities: Array<{ 
        sectionId: string, 
        subjectId: string, 
        hoursNeeded: number,
        eligibleTeachersCount: number,
        type: "lecture" | "lab",
        location?: string
      }> = [];

      sections.forEach((section) => {
        const sectionSubjects = subjects.filter((subject) => 
          subject.sections.includes(section.id)
        );

        sectionSubjects.forEach((subject) => {
          const hoursNeeded = subject.hoursPerWeek[section.id] || 0;
          if (hoursNeeded <= 0) return;

          const eligibleTeachers = teachers.filter((teacher) => 
            teacher.subjects.includes(subject.id)
          );

          if (eligibleTeachers.length === 0) {
            throw new Error(`No teachers available for ${subject.name} in ${section.name}`);
          }

          subjectPriorities.push({
            sectionId: section.id,
            subjectId: subject.id,
            hoursNeeded,
            eligibleTeachersCount: eligibleTeachers.length,
            type: subject.type,
            location: subject.location
          });
        });
      });

      // Sort subjects by priority (labs first, then by teacher scarcity and hours needed)
      subjectPriorities.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "lab" ? -1 : 1;
        }
        if (a.eligibleTeachersCount !== b.eligibleTeachersCount) {
          return a.eligibleTeachersCount - b.eligibleTeachersCount;
        }
        return b.hoursNeeded - a.hoursNeeded;
      });

      // Track labs allocated per day to ensure proper distribution
      const labsPerDay: Record<string, Record<string, number>> = {};
      sections.forEach((section) => {
        labsPerDay[section.id] = {};
        DAYS.forEach((day) => {
          labsPerDay[section.id][day] = 0;
        });
      });

      // Process each subject priority
      for (const subjectPriority of subjectPriorities) {
        let { sectionId, subjectId, hoursNeeded, type, location } = subjectPriority;
        
        if (hoursNeeded <= 0) continue;
        
        const section = sections.find(s => s.id === sectionId)!;
        const subject = subjects.find(s => s.id === subjectId)!;
        
        const eligibleTeachers = teachers.filter((teacher) => 
          teacher.subjects.includes(subjectId)
        );

        let hoursAllocated = 0;
        
        // Limit number of periods per day for better distribution
        const maxPeriodsPerDay = Math.min(2, Math.ceil(hoursNeeded / DAYS.length));
        
        const allocationsPerDay: Record<string, number> = {};
        DAYS.forEach(day => {
          allocationsPerDay[day] = 0;
        });
        
        let attempts = 0;
        const maxAttempts = 50;
        
        // Try to allocate hours for this subject
        while (hoursAllocated < hoursNeeded && attempts < maxAttempts) {
          attempts++;
          
          // Sort days by current allocations to evenly spread classes
          const daysByAllocation = [...DAYS].sort((a, b) => 
            allocationsPerDay[a] - allocationsPerDay[b]
          );
          
          let allocated = false;
          
          // Try to allocate labs first in specific periods
          if (type === "lab") {
            // Only try to allocate labs if we haven't reached the maximum for this day/section
            for (const day of daysByAllocation) {
              // Skip days where this section already has the maximum allowed labs
              if (labsPerDay[sectionId][day] >= LAB_SCHEDULE[day as keyof typeof LAB_SCHEDULE].maxLabs) {
                continue;
              }
              
              // Get available lab periods for this day
              const availablePeriods = LAB_SCHEDULE[day as keyof typeof LAB_SCHEDULE].periods;
              
              // Try to find consecutive periods for lab
              for (let i = 0; i < availablePeriods.length - 1; i += 2) {
                const period = availablePeriods[i];
                const nextPeriod = availablePeriods[i + 1];
                
                // Make sure periods are consecutive and within our PERIODS_PER_DAY limit
                if (period + 1 !== nextPeriod || period > PERIODS_PER_DAY || nextPeriod > PERIODS_PER_DAY) continue;

                // Skip if periods are already allocated
                if (newTimetable[sectionId][day][period] !== null || 
                    newTimetable[sectionId][day][nextPeriod] !== null) {
                  continue;
                }

                // Find an available teacher for these periods
                const availableTeacher = eligibleTeachers.find((teacher) => 
                  teacherTimeSlots[teacher.id][day][period] === true && 
                  teacherTimeSlots[teacher.id][day][nextPeriod] === true &&
                  teacherAssignments[teacher.id] + 2 <= teacher.maxHours
                );

                if (availableTeacher) {
                  // Allocate the lab for both periods
                  newTimetable[sectionId][day][period] = {
                    teacherId: availableTeacher.id,
                    subjectId,
                    type: "lab",
                    location
                  };
                  
                  newTimetable[sectionId][day][nextPeriod] = {
                    teacherId: availableTeacher.id,
                    subjectId,
                    type: "lab",
                    location
                  };

                  // Mark teacher as unavailable in these slots
                  teacherTimeSlots[availableTeacher.id][day][period] = false;
                  teacherTimeSlots[availableTeacher.id][day][nextPeriod] = false;
                  teacherAssignments[availableTeacher.id] += 2;
                  
                  // Increment the lab count for this day/section
                  labsPerDay[sectionId][day]++;
                  hoursAllocated += 2;
                  allocated = true;
                  break;
                }
              }
              
              if (allocated) break;
            }
          } else {
            // Handle lecture allocation
            for (const day of daysByAllocation) {
              if (allocationsPerDay[day] >= maxPeriodsPerDay) continue;
              
              // Find an available period in this day
              for (let period = 1; period <= PERIODS_PER_DAY; period++) {
                if (newTimetable[sectionId][day][period] !== null) continue;
                
                // Find an available teacher
                const availableTeacher = eligibleTeachers.find((teacher) => 
                  teacherTimeSlots[teacher.id][day][period] === true && 
                  teacherAssignments[teacher.id] < teacher.maxHours
                );
                
                if (availableTeacher) {
                  // Allocate the lecture
                  newTimetable[sectionId][day][period] = {
                    teacherId: availableTeacher.id,
                    subjectId,
                    type: "lecture"
                  };
                  
                  // Mark teacher as unavailable in this slot
                  teacherTimeSlots[availableTeacher.id][day][period] = false;
                  
                  // Update counters
                  teacherAssignments[availableTeacher.id]++;
                  hoursAllocated++;
                  allocationsPerDay[day]++;
                  allocated = true;
                  break;
                }
              }
              
              if (allocated) break;
            }
          }
          
          // If we still couldn't allocate a slot, we try more flexible options
          if (!allocated && type === "lecture") {
            // Try any available slot, even if it exceeds our maxPeriodsPerDay preference
            for (const day of DAYS) {
              for (let period = 1; period <= PERIODS_PER_DAY; period++) {
                if (newTimetable[sectionId][day][period] !== null) continue;
                
                const availableTeacher = eligibleTeachers.find((teacher) => 
                  teacherTimeSlots[teacher.id][day][period] === true && 
                  teacherAssignments[teacher.id] < teacher.maxHours
                );
                
                if (availableTeacher) {
                  newTimetable[sectionId][day][period] = {
                    teacherId: availableTeacher.id,
                    subjectId,
                    type: "lecture"
                  };
                  
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
          
          // If we've tried everything and still can't allocate, we give up on this subject
          if (!allocated) {
            break;
          }
        }
        
        // If we couldn't allocate all hours, show a warning
        if (hoursAllocated < hoursNeeded) {
          console.warn(`Could only allocate ${hoursAllocated}/${hoursNeeded} hours for ${subject.name} in section ${section.name}`);
        }
      }
      
      // Set the new timetable
      setTimetable(newTimetable);
      
      // Show success message
      toast({
        title: "Timetable Generated",
        description: "The timetable has been generated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate timetable",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetTimetable = async () => {
    try {
      if (ENABLE_MOCKUP) {
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
          title: "Timetable Reset (Mock Mode)",
          description: "Timetable has been reset successfully",
        });
        return;
      }
      
      const response = await fetch(`${API_URL}/timetable/reset.php`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchData();
        
        toast({
          title: "Timetable Reset",
          description: "Timetable has been reset successfully",
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
