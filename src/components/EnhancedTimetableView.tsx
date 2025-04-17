
import React, { useState, useEffect } from "react";
import { useData, DAYS, PERIODS_PER_DAY, TIME_SLOTS } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";

// Define the period mapping here to resolve the error
const PERIOD_MAPPING: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 4,
  "4": 5,
  "5": 7,
  "6": 8,
  "7": 9
};

const TeacherAvailabilityTable = ({ teacherTimeSlots, teachers, selectedSection }: any) => {
  if (!teacherTimeSlots || !selectedSection) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Teacher Availability</h3>
      <div className="bg-white rounded-lg border shadow-sm overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Teacher</TableHead>
              {DAYS.map((day) => (
                <TableHead key={day} className="min-w-[120px]">{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher: any) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                {DAYS.map((day) => (
                  <TableCell key={day} className="p-2">
                    <div className="text-xs">
                      {Array.from({ length: PERIODS_PER_DAY }, (_, period) => period + 1).map((period) => (
                        <span 
                          key={period}
                          className={`inline-block w-6 h-6 m-0.5 rounded-sm text-center leading-6 
                            ${teacherTimeSlots[teacher.id]?.[day]?.[period] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {period}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const EnhancedTimetableView: React.FC = () => {
  const { sections, teachers, subjects, timetable, generateTimetable, resetTimetable, loading } = useData();
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sections.length > 0 ? sections[0].id : undefined
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [teacherTimeSlots, setTeacherTimeSlots] = useState<any>(null);

  // Update selected section when sections change
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);

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
      // Initialize teacher availability
      const newTeacherTimeSlots: Record<string, Record<string, Record<number, boolean>>> = {};
      teachers.forEach((teacher) => {
        newTeacherTimeSlots[teacher.id] = {};
        DAYS.forEach((day) => {
          newTeacherTimeSlots[teacher.id][day] = {};
          for (let period = 1; period <= PERIODS_PER_DAY; period++) {
            newTeacherTimeSlots[teacher.id][day][period] = true;
          }
        });
      });

      // Update teacher availability based on timetable
      Object.values(timetable).forEach((sectionTimetable) => {
        Object.entries(sectionTimetable).forEach(([day, periods]) => {
          Object.entries(periods).forEach(([period, slot]) => {
            if (slot && slot.teacherId) {
              const periodNum = parseInt(period);
              if (newTeacherTimeSlots[slot.teacherId]?.[day]?.[periodNum]) {
                newTeacherTimeSlots[slot.teacherId][day][periodNum] = false;
              }
            }
          });
        });
      });

      setTeacherTimeSlots(newTeacherTimeSlots);
      await generateTimetable();
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

      {!hasData ? (
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium">Setup Required</h3>
            <p className="text-muted-foreground mt-1">
              Please add teachers, subjects, and sections before generating a timetable.
            </p>
          </div>
        </Card>
      ) : (
        <>
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

          {hasSelectedSection ? (
            <>
              <div className="bg-white rounded-lg border shadow-sm overflow-x-auto timetable-container">
                <div className="min-w-[900px]">
                  <div className="text-center py-4 border-b">
                    <h1 className="text-xl font-bold uppercase">K.J. College of Engineering & Management Research, Pune.</h1>
                    <h2 className="text-lg font-medium">DEPARTMENT OF COMPUTER ENGINEERING</h2>
                    <div className="flex justify-center items-center space-x-6 mt-2">
                      <p>Time Table Academic Year: 2024-2025</p>
                      <p>SEMESTER-II</p>
                      <p>Section: {sections.find(s => s.id === selectedSection)?.name}</p>
                    </div>
                    <p className="mt-1">Class Room No: 13</p>
                  </div>
                  
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
                          {TIME_SLOTS.map((slot) => {
                            if (slot.type === 'break') {
                              return (
                                <TableCell key={slot.id} className="text-center font-medium bg-gray-100">
                                  {slot.label}
                                </TableCell>
                              );
                            }

                            const periodKey = Object.entries(PERIOD_MAPPING).find(([_, id]) => id === slot.id)?.[0];
                            if (!periodKey) return <TableCell key={slot.id} />;

                            const period = parseInt(periodKey);
                            const timeSlot = timetable[selectedSection]?.[day]?.[period];

                            return (
                              <TableCell key={slot.id} className="p-2">
                                {timeSlot ? (
                                  <div className={`p-1 ${timeSlot.type === 'lab' ? 'bg-blue-50' : ''}`}>
                                    <div className="font-medium">
                                      {getSubjectName(timeSlot.subjectId)} {timeSlot.type === 'lab' ? 'LAB' : ''}
                                    </div>
                                    {timeSlot.location && <div className="text-xs">[{timeSlot.location}]</div>}
                                    <div className="text-xs text-gray-600">[{getTeacherName(timeSlot.teacherId)}]</div>
                                  </div>
                                ) : (
                                  <div className="text-center text-sm text-gray-500">-</div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="text-right p-4 text-sm text-gray-500">
                    W.E.F: 1/1/2025
                  </div>
                </div>
              </div>

              <TeacherAvailabilityTable 
                teacherTimeSlots={teacherTimeSlots} 
                teachers={teachers}
                selectedSection={selectedSection}
              />
            </>
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
        </>
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
