
import React, { useState } from "react";
import { useData, DAYS } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Define time slots with specific times
const TIME_SLOTS = [
  { id: 1, startTime: "8:45", endTime: "9:45", type: "regular" },
  { id: 2, startTime: "9:45", endTime: "10:45", type: "regular" },
  { id: 3, startTime: "10:45", endTime: "11:00", type: "break", label: "SHORT RECESS" },
  { id: 4, startTime: "11:00", endTime: "12:00", type: "regular" },
  { id: 5, startTime: "12:00", endTime: "1:00", type: "regular" },
  { id: 6, startTime: "1:00", endTime: "1:45", type: "break", label: "LUNCH BREAK" },
  { id: 7, startTime: "1:45", endTime: "2:45", type: "regular" },
  { id: 8, startTime: "2:45", endTime: "3:45", type: "regular" },
  { id: 9, startTime: "3:45", endTime: "4:30", type: "regular" },
];

// Map period numbers to time slot ids
const PERIOD_MAPPING: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 8,
  7: 9
};

// Lab data
const LAB_DATA: Record<string, Record<number, string[]>> = {
  "Monday": {
    8: [
      "S7- MPL [DBMS LAB A-420] [Dr. A. Shankhar]",
      "S8 -DSAL [S/W LAB A-406] [SAN]",
      "S9 - PBL[N/W LAB A-402] [PDT]"
    ]
  },
  "Thursday": {
    5: [
      "S7- DSAL [S/W LAB A-406] [SAN]",
      "S8 -PBL[PL-II LAB A-413] [PDT]",
      "S9 - MPL [H/W LAB A-417] [Dr. A. Shankhar]"
    ]
  }
};

// Component for rendering timetable cell content
const TimetableCell = ({ day, timeSlotId, selectedSection, timetable, getSubjectName, getTeacherName }:
  {
    day: string,
    timeSlotId: number,
    selectedSection: string,
    timetable: any,
    getSubjectName: (subjectId: string) => string,
    getTeacherName: (teacherId: string) => string
  }) => {
  
  // Handle break slots
  const timeSlot = TIME_SLOTS.find(ts => ts.id === timeSlotId);
  if (timeSlot?.type === "break") {
    return (
      <div className="text-center font-medium bg-gray-100">
        {timeSlot.label}
      </div>
    );
  }
  
  // Convert time slot to period
  const periodKey = Object.entries(PERIOD_MAPPING).find(([_, slotId]) => slotId === timeSlotId)?.[0];
  if (!periodKey) return null;
  
  const period = parseInt(periodKey);
  const slot = timetable[selectedSection]?.[day]?.[period];
  
  if (!slot) {
    // Check for lab data
    const labEntries = LAB_DATA[day as keyof typeof LAB_DATA]?.[timeSlotId as keyof typeof LAB_DATA[keyof typeof LAB_DATA]];
    
    if (labEntries && labEntries.length > 0) {
      return (
        <div className="p-1">
          {labEntries.map((lab, index) => (
            <div key={index} className="text-xs mb-1">{lab}</div>
          ))}
        </div>
      );
    }
    
    return null;
  }
  
  const subjectName = getSubjectName(slot.subjectId);
  const teacherName = getTeacherName(slot.teacherId);
  
  return (
    <div className="p-1">
      <div className="font-medium">{subjectName}</div>
      <div className="text-xs text-gray-600">[{teacherName}]</div>
    </div>
  );
};

// Header component for timetable
const TimetableHeader = () => (
  <div className="text-center py-4 border-b">
    <h1 className="text-xl font-bold uppercase">K.J. College of Engineering & Management Research, Pune.</h1>
    <h2 className="text-lg font-medium">DEPARTMENT OF COMPUTER ENGINEERING</h2>
    <div className="flex justify-center items-center space-x-6 mt-2">
      <p>Time Table Academic Year: 2024-2025</p>
      <p>SEMESTER-II</p>
      <p>Section: SE-B</p>
    </div>
    <p className="mt-1">Class Room No: 13</p>
  </div>
);

const EnhancedTimetableView: React.FC = () => {
  const { sections, teachers, subjects, timetable, generateTimetable, resetTimetable, loading } = useData();
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sections.length > 0 ? sections[0].id : undefined
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "Unknown";
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Unknown";
  };

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    try {
      await generateTimetable();
      toast({
        title: "Success",
        description: "Timetable generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate timetable",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const hasData = teachers.length > 0 && subjects.length > 0 && sections.length > 0;
  const hasSelectedSection = selectedSection && timetable[selectedSection];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Timetable</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={handleGenerateTimetable} 
            className="flex items-center gap-2"
            disabled={isGenerating || !hasData}
          >
            <RefreshCw className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Timetable"}
          </Button>
          <Button 
            variant="outline"
            onClick={resetTimetable}
            disabled={!hasSelectedSection}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrint}
            disabled={!hasSelectedSection}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportToPDF}
            disabled={!hasSelectedSection}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-xs">
          <Select
            value={selectedSection}
            onValueChange={setSelectedSection}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium">Setup Required</h3>
            <p className="text-muted-foreground mt-1">
              Please add teachers, subjects, and sections before generating a timetable.
            </p>
          </div>
        </Card>
      ) : hasSelectedSection ? (
        <div className="bg-white rounded-lg border shadow-sm overflow-auto print:shadow-none">
          <div className="min-w-[900px]">
            <TimetableHeader />
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 font-bold">DAY / TIME</TableHead>
                  {TIME_SLOTS.map((slot) => (
                    <TableHead 
                      key={slot.id}
                      className={`font-bold text-center ${slot.type === 'break' ? 'bg-gray-100' : ''}`}
                    >
                      {slot.startTime} - {slot.endTime}
                      <div className="text-xs font-normal">
                        {slot.type === 'regular' && 
                          Object.entries(PERIOD_MAPPING).find(([_, id]) => id === slot.id)?.[0]
                        }
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS.map((day) => (
                  <TableRow key={day}>
                    <TableCell className="font-bold">{day.toUpperCase()}</TableCell>
                    {TIME_SLOTS.map((slot) => (
                      <TableCell 
                        key={slot.id} 
                        className={`border ${slot.type === 'break' ? 'bg-gray-100' : ''} p-1`}
                      >
                        <TimetableCell
                          day={day}
                          timeSlotId={slot.id}
                          selectedSection={selectedSection}
                          timetable={timetable}
                          getSubjectName={getSubjectName}
                          getTeacherName={getTeacherName}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="text-right p-4 text-sm text-gray-500">
              W.E.F: 1/1/2025
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium">No timetable generated yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Click the "Generate Timetable" button to create a new timetable.
            </p>
            <Button onClick={handleGenerateTimetable} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Timetable"}
            </Button>
          </div>
        </Card>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .timetable-container, .timetable-container * {
            visibility: visible;
          }
          .timetable-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: landscape;
          }
        }
      `}} />
    </div>
  );
};

export default EnhancedTimetableView;
