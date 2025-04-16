
import { useDataState } from "@/contexts/DataContextState";
import { useToast } from "@/hooks/use-toast";
import { DAYS, PERIODS_PER_DAY, Timetable } from "@/types/timetable";

export const useTimetableService = () => {
  const { sections, subjects, teachers, timetable, setTimetable, setLoading } = useDataState();
  const { toast } = useToast();

  const generateTimetable = async () => {
    setLoading(true);
    try {
      if (sections.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one section before generating a timetable.",
          variant: "destructive",
        });
        return false;
      }

      if (subjects.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one subject before generating a timetable.",
          variant: "destructive",
        });
        return false;
      }

      if (teachers.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one teacher before generating a timetable.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Generating timetable with:", { sections, subjects, teachers });
      
      const newTimetable: Timetable = {};
      
      sections.forEach((section) => {
        newTimetable[section.id] = {};
        DAYS.forEach((day) => {
          newTimetable[section.id][day] = {};
        });
      });
      
      sections.forEach((section) => {
        DAYS.forEach((day) => {
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            const availableSubjects = subjects.filter(subject => 
              subject.sections.includes(section.id)
            );
            
            if (availableSubjects.length > 0) {
              const randomSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
              
              const availableTeachers = teachers.filter(teacher => 
                teacher.subjects.includes(randomSubject.name)
              );
              
              if (availableTeachers.length > 0) {
                const randomTeacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
                
                newTimetable[section.id][day][period] = {
                  teacherId: randomTeacher.id,
                  subjectId: randomSubject.id,
                  type: randomSubject.type,
                  location: randomSubject.type === 'lab' ? randomSubject.location : undefined
                };
                
                console.log(`Assigned ${randomSubject.name} taught by ${randomTeacher.name} to ${section.name} on ${day} period ${period}`);
              } else {
                console.log(`No teachers available for ${randomSubject.name} on ${day} period ${period}`);
                newTimetable[section.id][day][period] = null;
              }
            } else {
              console.log(`No subjects available for section ${section.name}`);
              newTimetable[section.id][day][period] = null;
            }
          }
        });
      });
      
      console.log("Generated timetable:", newTimetable);
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

  return {
    generateTimetable,
    resetTimetable
  };
};
