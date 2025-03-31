
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData, Teacher, Subject } from "@/contexts/DataContext";
import { Check, X } from "lucide-react";

interface TeacherFormProps {
  teacher?: Teacher;
  onSubmit: () => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSubmit, onCancel }) => {
  const { subjects, addTeacher, updateTeacher } = useData();
  const [name, setName] = useState("");
  const [maxHours, setMaxHours] = useState(20);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setMaxHours(teacher.maxHours);
      setSelectedSubjects(teacher.subjects);
    }
  }, [teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const teacherData = {
        name,
        maxHours,
        subjects: selectedSubjects,
      };
      
      if (teacher) {
        updateTeacher(teacher.id, teacherData);
      } else {
        addTeacher(teacherData);
      }
      
      onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{teacher ? "Edit Teacher" : "Add New Teacher"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Teacher Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxHours">Maximum Hours Per Week</Label>
            <Input
              id="maxHours"
              type="number"
              min={1}
              max={40}
              placeholder="20"
              value={maxHours}
              onChange={(e) => setMaxHours(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div 
                    key={subject.id}
                    className={`
                      border rounded-md p-2 flex items-center justify-between cursor-pointer
                      ${selectedSubjects.includes(subject.id) ? 'border-primary bg-primary/5' : 'border-input'}
                    `}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <span>{subject.name}</span>
                    {selectedSubjects.includes(subject.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-2">
                  No subjects added yet. Please add subjects first.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || name.trim() === '' || selectedSubjects.length === 0}>
            {isSubmitting ? "Saving..." : (teacher ? "Update Teacher" : "Add Teacher")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TeacherForm;
