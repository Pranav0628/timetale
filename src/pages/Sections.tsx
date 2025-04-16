
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import SectionForm from "@/components/SectionForm";
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

const Sections: React.FC = () => {
  const { sections, subjects, removeSection } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const getSectionById = (id: string) => {
    return sections.find((s) => s.id === id);
  };

  // Calculate the total subjects and total hours for each section
  const getSectionDetails = (sectionId: string) => {
    const sectionSubjects = subjects.filter((subject) => 
      subject.sections.includes(sectionId)
    );
    
    const totalSubjects = sectionSubjects.length;
    
    const totalHours = sectionSubjects.reduce((sum, subject) => 
      sum + (subject.hoursPerWeek[sectionId] || 0), 0
    );
    
    return { totalSubjects, totalHours };
  };

  const handleEditSection = (id: string) => {
    setSelectedSection(id);
    setIsEditOpen(true);
  };

  const handleDeleteSection = (id: string) => {
    setSelectedSection(id);
    setIsDeleteOpen(true);
  };

  const confirmDeleteSection = async () => {
    if (selectedSection) {
      try {
        await removeSection(selectedSection);
        setIsDeleteOpen(false);
      } catch (error) {
        console.error("Error deleting section:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Sections</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section for your timetable.
            </DialogDescription>
            <SectionForm 
              onSubmit={() => setIsAddOpen(false)} 
              onCancel={() => setIsAddOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section List</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No sections added yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddOpen(true)}
              >
                Add your first section
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Total Subjects</TableHead>
                    <TableHead>Total Hours / Week</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => {
                    const { totalSubjects, totalHours } = getSectionDetails(section.id);
                    
                    return (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>{totalSubjects}</TableCell>
                        <TableCell>{totalHours} hrs</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditSection(section.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteSection(section.id)}
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
          <DialogTitle>Edit Section</DialogTitle>
          <DialogDescription>
            Update the section information.
          </DialogDescription>
          {selectedSection && (
            <SectionForm 
              section={getSectionById(selectedSection)!}
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
              This will permanently delete the section
              {selectedSection && getSectionById(selectedSection) && 
                ` "${getSectionById(selectedSection)!.name}"`}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSection}
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

export default Sections;
