
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import SubjectForm from "@/components/SubjectForm";
import { Edit, Plus, Trash2 } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const Subjects: React.FC = () => {
  const { subjects, sections, removeSubject } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const getSubjectById = (id: string) => {
    return subjects.find((s) => s.id === id);
  };

  const getSectionNames = (sectionIds: string[]) => {
    return sectionIds.map((id) => {
      const section = sections.find((s) => s.id === id);
      return section ? section.name : "";
    }).filter(Boolean);
  };

  const handleEditSubject = (id: string) => {
    setSelectedSubject(id);
    setIsEditOpen(true);
  };

  const handleDeleteSubject = (id: string) => {
    setSelectedSubject(id);
    setIsDeleteOpen(true);
  };

  const confirmDeleteSubject = () => {
    if (selectedSubject) {
      removeSubject(selectedSubject);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <SubjectForm 
              onSubmit={() => setIsAddOpen(false)} 
              onCancel={() => setIsAddOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No subjects added yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddOpen(true)}
              >
                Add your first subject
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Hours per Week</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => {
                    const sectionNames = getSectionNames(subject.sections);
                    
                    return (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {sectionNames.map((name, index) => (
                              <Badge key={index} variant="outline">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {subject.sections.map((sectionId) => {
                              const section = sections.find(s => s.id === sectionId);
                              return section ? (
                                <div key={sectionId} className="text-xs">
                                  {section.name}: {subject.hoursPerWeek[sectionId] || 0} hrs
                                </div>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditSubject(subject.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteSubject(subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedSubject && (
            <SubjectForm 
              subject={getSubjectById(selectedSubject)!}
              onSubmit={() => setIsEditOpen(false)} 
              onCancel={() => setIsEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject
              {selectedSubject && getSubjectById(selectedSubject) && 
                ` "${getSubjectById(selectedSubject)!.name}"`}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubject}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subjects;
