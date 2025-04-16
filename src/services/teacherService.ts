
import { useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDataState } from "@/contexts/DataContextState";
import { Teacher, generateId } from "@/types/timetable";

const API_URL = "http://localhost/timetable/api";
const ENABLE_MOCKUP = true;

export const useTeacherService = () => {
  const { teachers, setTeachers, setLoading } = useDataState();
  const { toast } = useToast();

  const addTeacher = async (teacher: Omit<Teacher, "id">) => {
    setLoading(true);
    try {
      if (ENABLE_MOCKUP) {
        const newTeacher = { ...teacher, id: generateId() };
        setTeachers(prev => [...prev, newTeacher]);
        toast({
          title: "Teacher added",
          description: `${teacher.name} has been added successfully.`,
        });
        return;
      }
      
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
      setTeachers(prevTeachers => prevTeachers.map((t) => (t.id === id ? { ...t, ...teacher } : t)));
      toast({
        title: "Teacher updated",
        description: `${teacher.name || "Teacher"} has been updated successfully.`,
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
      setTeachers(prevTeachers => prevTeachers.filter((teacher) => teacher.id !== id));
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

  return {
    addTeacher,
    updateTeacher,
    removeTeacher
  };
};
