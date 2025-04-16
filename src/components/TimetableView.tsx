
import React, { useState, useEffect } from "react";
import { useData, DAYS, PERIODS_PER_DAY } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const TimetableView: React.FC = () => {
  const { sections, teachers, subjects, timetable, generateTimetable, resetTimetable, loading } = useData();
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sections.length > 0 ? sections[0].id : undefined
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
      const success = await generateTimetable();
      
      if (success) {
        toast({
          title: "Success",
          description: "Timetable generated successfully!"
        });
      }
    } catch (error) {
      console.error("Error in timetable generation:", error);
      toast({
        title: "Error",
        description: "Failed to generate timetable. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    // In a real application, you would implement PDF export functionality here
    alert("PDF export functionality would be implemented here in a real application.");
  };

  // Function to get free teachers for a specific day and period
  const getFreeTeachersForTimeSlot = (day: string, period: number) => {
    const busyTeacherIds = new Set<string>();
    
    // Check all sections to find busy teachers
    Object.values(timetable).forEach((sectionTimetable) => {
      if (sectionTimetable[day] && sectionTimetable[day][period]) {
        const slot = sectionTimetable[day][period];
        if (slot && slot.teacherId) {
          busyTeacherIds.add(slot.teacherId);
        }
      }
    });
    
    // Return teachers who are not busy
    return teachers.filter(teacher => !busyTeacherIds.has(teacher.id));
  };

  const handleSlotClick = (day: string, period: number) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
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
  const colors = [
    "bg-blue-100 border-blue-400",
    "bg-indigo-100 border-indigo-400",
    "bg-purple-100 border-purple-400",
    "bg-pink-100 border-pink-400",
    "bg-orange-100 border-orange-400",
    "bg-green-100 border-green-400"
  ];

  const subjectColors: Record<string, string> = {};
  subjects.forEach((subject, index) => {
    subjectColors[subject.id] = colors[index % colors.length];
  });

  // Get free teachers for selected time slot
  const freeTeachers = selectedDay && selectedPeriod !== null 
    ? getFreeTeachersForTimeSlot(selectedDay, selectedPeriod) 
    : [];

  console.log("Current timetable state:", { timetable, selectedSection, hasSelectedSection });
  console.log("Data available:", { teachers, subjects, sections });

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
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
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
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <h3 className="text-lg font-medium">Setup Required</h3>
              <p className="text-muted-foreground mt-1">
                Please add teachers, subjects, and sections before generating a timetable.
              </p>
            </div>
          </CardContent>
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
              <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                        {DAYS.map((day) => (
                          <th key={day} className="px-4 py-3 text-left text-sm font-medium">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: PERIODS_PER_DAY }, (_, period) => period + 1).map((period) => (
                        <tr key={period} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                            {period}
                          </td>
                          {DAYS.map((day) => {
                            const sectionTimetable = timetable[selectedSection] || {};
                            const daySchedule = sectionTimetable[day] || {};
                            const slot = daySchedule[period];
                            
                            return (
                              <td 
                                key={day} 
                                className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSlotClick(day, period)}
                              >
                                {slot ? (
                                  <div className={`p-2 rounded-md ${subjectColors[slot.subjectId]}`}>
                                    <div className="font-medium">{getSubjectName(slot.subjectId)}</div>
                                    <div className="text-xs text-muted-foreground">{getTeacherName(slot.teacherId)}</div>
                                    {slot.type === 'lab' && slot.location && (
                                      <div className="text-xs font-medium mt-1">{slot.location}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-md border border-dashed text-center">
                                    <span className="text-xs text-muted-foreground">Free</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Free Faculty Members Panel */}
              {selectedDay && selectedPeriod !== null && (
                <Card className="mt-4">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Faculty Available on {selectedDay}, Period {selectedPeriod}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {freeTeachers.length > 0 ? (
                      <ul className="divide-y">
                        {freeTeachers.map(teacher => (
                          <li key={teacher.id} className="py-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <span className="font-medium text-primary">{teacher.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {teacher.subjects.join(', ')}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No faculty members are available during this time slot.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-6">
                  <h3 className="text-lg font-medium">No timetable generated yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Click the "Generate Timetable" button to create a new timetable.
                  </p>
                  <Button onClick={handleGenerateTimetable} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Timetable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default TimetableView;
