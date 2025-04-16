
import { useDataState } from "@/contexts/DataContextState";
import { useToast } from "@/hooks/use-toast";
import { Subject, generateId } from "@/types/timetable";

const API_URL = "http://localhost/timetable/api";
const ENABLE_MOCKUP = true;

export const useSubjectService = () => {
  const { subjects, setSubjects, setLoading } = useDataState();
  const { toast } = useToast();

  const addSubject = async (subject: Omit<Subject, "id">) => {
    setLoading(true);
    try {
      if (ENABLE_MOCKUP) {
        const newSubject = { ...subject, id: generateId() };
        setSubjects(prev => [...prev, newSubject]);
        toast({
          title: "Subject added",
          description: `${subject.name} has been added successfully.`,
        });
        return;
      }
      
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
      setSubjects(prevSubjects => prevSubjects.map((s) => (s.id === id ? { ...s, ...subject } : s)));
      toast({
        title: "Subject updated",
        description: `${subject.name || "Subject"} has been updated successfully.`,
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
      setSubjects(prevSubjects => prevSubjects.filter((subject) => subject.id !== id));
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

  return {
    addSubject,
    updateSubject,
    removeSubject
  };
};
