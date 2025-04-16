
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

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS_PER_DAY = 8;
export const LAB_LOCATIONS = [
  "DBMS LAB A-420",
  "S/W LAB A-406",
  "N/W LAB A-402",
  "H/W LAB A-417",
  "PL-II LAB A-413"
];

export const generateId = () => Math.random().toString(36).substring(2, 9);
