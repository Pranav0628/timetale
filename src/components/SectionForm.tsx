
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, Section } from "@/contexts/DataContext";

interface SectionFormProps {
  section?: Section;
  onSubmit: () => void;
  onCancel: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({ section, onSubmit, onCancel }) => {
  const { addSection, updateSection } = useData();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (section) {
      setName(section.name);
    }
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const sectionData = {
        name,
      };
      
      if (section) {
        updateSection(section.id, sectionData);
      } else {
        addSection(sectionData);
      }
      
      onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section ? "Edit Section" : "Add New Section"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Section Name</Label>
            <Input
              id="name"
              placeholder="Class 10-A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || name.trim() === ''}>
            {isSubmitting ? "Saving..." : (section ? "Update Section" : "Add Section")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SectionForm;
