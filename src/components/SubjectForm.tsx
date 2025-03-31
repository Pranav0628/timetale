
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, Subject, Section } from "@/contexts/DataContext";
import { Check, X } from "lucide-react";

interface SubjectFormProps {
  subject?: Subject;
  onSubmit: () => void;
  onCancel: () => void;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSubmit, onCancel }) => {
  const { sections, addSubject, updateSubject } = useData();
  const [name, setName] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [hoursPerSection, setHoursPerSection] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setSelectedSections(subject.sections);
      setHoursPerSection(subject.hoursPerWeek);
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Filter hours to only include selected sections
      const filteredHours: Record<string, number> = {};
      selectedSections.forEach(sectionId => {
        filteredHours[sectionId] = hoursPerSection[sectionId] || 1;
      });
      
      const subjectData = {
        name,
        sections: selectedSections,
        hoursPerWeek: filteredHours,
      };
      
      if (subject) {
        updateSubject(subject.id, subjectData);
      } else {
        addSubject(subjectData);
      }
      
      onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
      
      // Initialize hours if not set
      if (!hoursPerSection[sectionId]) {
        setHoursPerSection({
          ...hoursPerSection,
          [sectionId]: 1
        });
      }
    }
  };

  const setHoursForSection = (sectionId: string, hours: number) => {
    setHoursPerSection({
      ...hoursPerSection,
      [sectionId]: Math.max(1, Math.min(10, hours))
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subject ? "Edit Subject" : "Add New Subject"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Sections & Hours per Week</Label>
            <div className="space-y-2 mt-1">
              {sections.length > 0 ? (
                sections.map((section) => (
                  <div 
                    key={section.id}
                    className={`
                      border rounded-md p-3 flex items-center justify-between
                      ${selectedSections.includes(section.id) ? 'border-primary bg-primary/5' : 'border-input'}
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-5 h-5 border rounded flex items-center justify-center cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        {selectedSections.includes(section.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className="font-medium">{section.name}</span>
                    </div>
                    
                    {selectedSections.includes(section.id) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Hours/week:</span>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          className="w-16 h-8"
                          value={hoursPerSection[section.id] || 1}
                          onChange={(e) => setHoursForSection(section.id, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No sections added yet. Please add sections first.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || name.trim() === '' || selectedSections.length === 0}>
            {isSubmitting ? "Saving..." : (subject ? "Update Subject" : "Add Subject")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SubjectForm;
