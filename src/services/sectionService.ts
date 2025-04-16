
import { useDataState } from "@/contexts/DataContextState";
import { useToast } from "@/hooks/use-toast";
import { Section, generateId } from "@/types/timetable";

const API_URL = "http://localhost/timetable/api";
const ENABLE_MOCKUP = true;

export const useSectionService = () => {
  const { sections, setSections, setLoading } = useDataState();
  const { toast } = useToast();

  const addSection = async (section: Omit<Section, "id">) => {
    setLoading(true);
    try {
      console.log("Adding section in mock mode:", section);
      
      const newSection = { ...section, id: generateId() };
      console.log("Created new section:", newSection);
      setSections(prevSections => [...prevSections, newSection]);
      
      toast({
        title: "Section added",
        description: `${section.name} has been added successfully.`,
      });
      
      return;
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error adding section",
        description: "Failed to add the section.",
        variant: "destructive",
      });
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

  return {
    addSection,
    updateSection,
    removeSection
  };
};
