import React, { useState, useEffect } from "react";
import { useData, DAYS, PERIODS_PER_DAY } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TimetableView: React.FC = () => {
  const { sections, teachers, subjects, timetable, generateTimetable, resetTimetable, loading } = useData();
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sections.length > 0 ? sections[0].id : undefined
  );
  const [isGenerating, setIsGenerating] = useState(false);

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
      await generateTimetable();
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    // In a real application, you would implement PDF export functionality here
    alert("PDF export functionality would be implemented here in a real application.");
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
    "bg-timetable-blue",
    "bg-timetable-indigo",
    "bg-timetable-purple",
    "bg-timetable-pink",
    "bg-timetable-orange",
    "bg-timetable-green"
  ];

  const subjectColors: Record<string, string> = {};
  subjects.forEach((subject, index) => {
    subjectColors[subject.id] = colors[index % colors.length];
  });

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
                          const slot = timetable[selectedSection]?.[day]?.[period];
                          
                          return (
                            <td key={day} className="px-4 py-2">
                              {slot ? (
                                <div className={`p-2 rounded-md ${subjectColors[slot.subjectId]} bg-opacity-15 border-l-4 ${subjectColors[slot.subjectId]}`}>
                                  <div className="font-medium">{getSubjectName(slot.subjectId)}</div>
                                  <div className="text-xs text-muted-foreground">{getTeacherName(slot.teacherId)}</div>
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
