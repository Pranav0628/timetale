import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
        console.log("Using mockup data mode");
        
        const mockTeachers: Teacher[] = [
          { id: "t1", name: "Dr. A. Shankhar", subjects: ["s1", "s5"], maxHours: 30 },
          { id: "t2", name: "Jane Doe", subjects: ["s2", "s3"], maxHours: 25 },
          { id: "t3", name: "Bob Johnson", subjects: ["s1", "s4"], maxHours: 20 },
          { id: "t4", name: "SAN", subjects: ["s6"], maxHours: 15 },
          { id: "t5", name: "PDT", subjects: ["s7"], maxHours: 15 },
        ];
        setTeachers(mockTeachers);

        const mockSubjects: Subject[] = [
          { id: "s1", name: "Mathematics", sections: ["sec1"], hoursPerWeek: { "sec1": 5 }, type: "lecture" },
          { id: "s2", name: "Physics", sections: ["sec1"], hoursPerWeek: { "sec1": 4 }, type: "lecture" },
          { id: "s3", name: "Chemistry", sections: ["sec1"], hoursPerWeek: { "sec1": 4 }, type: "lecture" },
          { id: "s4", name: "Biology", sections: ["sec1"], hoursPerWeek: { "sec1": 3 }, type: "lecture" },
          { id: "s5", name: "MPL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "DBMS LAB A-420" },
          { id: "s6", name: "DSAL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "S/W LAB A-406" },
          { id: "s7", name: "PBL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "N/W LAB A-402" },
        ];
        setSubjects(mockSubjects);

        const mockSections: Section[] = [
          { id: "sec1", name: "Class 10-A" },
          { id: "s7", name: "S7" },
          { id: "s8", name: "S8" },
          { id: "s9", name: "S9" },
        ];
        setSections(mockSections);

        const mockTimetable: Timetable = {};
        mockSections.forEach((section) => {
          mockTimetable[section.id] = {};
          DAYS.forEach((day) => {
            mockTimetable[section.id][day] = {};
            for (let period = 1; period <= PERIODS_PER_DAY; period++) {
              mockTimetable[section.id][day][period] = null;
            }
          });
        });
        setTimetable(mockTimetable);
        
        toast({
          title: "Mock data loaded",
          description: "Using sample data for frontend testing",
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
        description: "Using mockup mode for frontend testing.",
        variant: "destructive",
      });
      
      if (!ENABLE_MOCKUP) {
        console.log("Falling back to mockup data after API failure");
        
        const mockTeachers: Teacher[] = [
          { id: "t1", name: "Dr. A. Shankhar", subjects: ["s1", "s5"], maxHours: 30 },
          { id: "t2", name: "Jane Doe", subjects: ["s2", "s3"], maxHours: 25 },
          { id: "t3", name: "Bob Johnson", subjects: ["s1", "s4"], maxHours: 20 },
          { id: "t4", name: "SAN", subjects: ["s6"], maxHours: 15 },
          { id: "t5", name: "PDT", subjects: ["s7"], maxHours: 15 },
        ];
        setTeachers(mockTeachers);

        const mockSubjects: Subject[] = [
          { id: "s1", name: "Mathematics", sections: ["sec1"], hoursPerWeek: { "sec1": 5 }, type: "lecture" },
          { id: "s2", name: "Physics", sections: ["sec1"], hoursPerWeek: { "sec1": 4 }, type: "lecture" },
          { id: "s3", name: "Chemistry", sections: ["sec1"], hoursPerWeek: { "sec1": 4 }, type: "lecture" },
          { id: "s4", name: "Biology", sections: ["sec1"], hoursPerWeek: { "sec1": 3 }, type: "lecture" },
          { id: "s5", name: "MPL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "DBMS LAB A-420" },
          { id: "s6", name: "DSAL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "S/W LAB A-406" },
          { id: "s7", name: "PBL", sections: ["sec1"], hoursPerWeek: { "sec1": 2 }, type: "lab", location: "N/W LAB A-402" },
        ];
        setSubjects(mockSubjects);

        const mockSections: Section[] = [
          { id: "sec1", name: "Class 10-A" },
          { id: "s7", name: "S7" },
          { id: "s8", name: "S8" },
          { id: "s9", name: "S9" },
        ];
        setSections(mockSections);

        const mockTimetable: Timetable = {};
        mockSections.forEach((section) => {
          mockTimetable[section.id] = {};
          DAYS.forEach((day) => {
            mockTimetable[section.id][day] = {};
            for (let period = 1; period <= PERIODS_PER_DAY; period++) {
              mockTimetable[section.id][day][period] = null;
            }
          });
        });
        setTimetable(mockTimetable);
      }
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

      const teacherAssignments: Record<string, number> = {};
      teachers.forEach((teacher) => {
        teacherAssignments[teacher.id] = 0;
      });

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

      subjectPriorities.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "lab" ? -1 : 1;
        }
        if (a.eligibleTeachersCount !== b.eligibleTeachersCount) {
          return a.eligibleTeachersCount - b.eligibleTeachersCount;
        }
        return b.hoursNeeded - a.hoursNeeded;
      });

      const specialLabSlots = {
        "Monday": {
          8: ["s7", "s8", "s9"]
        },
        "Thursday": {
          5: ["s7", "s8", "s9"]
        }
      };

      for (const day in specialLabSlots) {
        for (const periodStr in specialLabSlots[day as keyof typeof specialLabSlots]) {
          const period = parseInt(periodStr);
          const sectionIds = specialLabSlots[day as keyof typeof specialLabSlots][period as keyof typeof specialLabSlots[keyof typeof specialLabSlots]];
          
          sectionIds.forEach((sectionId, index) => {
            const labSubject = subjects.find(s => 
              s.type === "lab" && 
              s.sections.includes(sectionId)
            );

            if (labSubject) {
              const eligibleTeacher = teachers.find(t => 
                t.subjects.includes(labSubject.id) && 
                teacherTimeSlots[t.id][day][period] === true &&
                teacherAssignments[t.id] < t.maxHours
              );

              if (eligibleTeacher) {
                newTimetable[sectionId][day][period] = {
                  teacherId: eligibleTeacher.id,
                  subjectId: labSubject.id,
                  type: "lab",
                  location: labSubject.location
                };
                
                teacherTimeSlots[eligibleTeacher.id][day][period] = false;
                teacherAssignments[eligibleTeacher.id]++;
                
                const matchingPriority = subjectPriorities.find(p => 
                  p.sectionId === sectionId && p.subjectId === labSubject.id
                );
                if (matchingPriority) {
                  matchingPriority.hoursNeeded--;
                }
              }
            }
          });
        }
      }

      for (const subjectPriority of subjectPriorities) {
        let { sectionId, subjectId, hoursNeeded, type, location } = subjectPriority;
        
        if (hoursNeeded <= 0) continue;
        
        const section = sections.find(s => s.id === sectionId)!;
        const subject = subjects.find(s => s.id === subjectId)!;
        
        const eligibleTeachers = teachers.filter((teacher) => 
          teacher.subjects.includes(subjectId)
        );

        let hoursAllocated = 0;
        
        const maxPeriodsPerDay = Math.min(2, Math.ceil(hoursNeeded / DAYS.length));
        
        const allocationsPerDay: Record<string, number> = {};
        DAYS.forEach(day => {
          allocationsPerDay[day] = 0;
        });
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (hoursAllocated < hoursNeeded && attempts < maxAttempts) {
          attempts++;
          
          const daysByAllocation = [...DAYS].sort((a, b) => 
            allocationsPerDay[a] - allocationsPerDay[b]
          );
          
          let allocated = false;
          
          for (const day of daysByAllocation) {
            if (allocationsPerDay[day] >= maxPeriodsPerDay) continue;
            
            for (let period = 1; period <= PERIODS_PER_DAY; period++) {
              if (newTimetable[sectionId][day][period] !== null) continue;
              
              if (type === "lab") {
                if (period < PERIODS_PER_DAY && newTimetable[sectionId][day][period + 1] === null) {
                  const availableTeacher = eligibleTeachers.find((teacher) => 
                    teacherTimeSlots[teacher.id][day][period] === true && 
                    teacherTimeSlots[teacher.id][day][period + 1] === true &&
                    teacherAssignments[teacher.id] + 2 <= teacher.maxHours
                  );
                  
                  if (availableTeacher) {
                    newTimetable[sectionId][day][period] = {
                      teacherId: availableTeacher.id,
                      subjectId,
                      type: "lab",
                      location
                    };
                    
                    newTimetable[sectionId][day][period + 1] = {
                      teacherId: availableTeacher.id,
                      subjectId,
                      type: "lab",
                      location
                    };
                    
                    teacherTimeSlots[availableTeacher.id][day][period] = false;
                    teacherTimeSlots[availableTeacher.id][day][period + 1] = false;
                    
                    teacherAssignments[availableTeacher.id] += 2;
                    
                    hoursAllocated += 2;
                    allocationsPerDay[day] += 2;
                    allocated = true;
                    break;
                  }
                }
              } else {
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
                  allocationsPerDay[day]++;
                  allocated = true;
                  break;
                }
              }
            }
            
            if (allocated) break;
          }
          
          if (!allocated && type === "lab") {
            for (const day of daysByAllocation) {
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
                    type: "lab",
                    location
                  };
                  
                  teacherTimeSlots[availableTeacher.id][day][period] = false;
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
          
          if (!allocated && type === "lecture") {
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
      
      if (!ENABLE_MOCKUP) {
        await saveTimetable(newTimetable);
      } else {
        toast({
          title: "Timetable generated successfully (Mock Mode)",
          description: "The timetable has been created",
        });
      }
      
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
    if (ENABLE_MOCKUP) {
      return { success: true };
    }
    
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
      
      return data;
    } catch (error) {
      console.error("Error saving timetable:", error);
      throw error;
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
          title: "Timetable reset (Mock Mode)",
          description: "The timetable has been cleared",
        });
        return;
      }
      
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
