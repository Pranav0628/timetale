
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { CalendarDays, GraduationCap, LayoutGrid, Users } from "lucide-react";

const Dashboard: React.FC = () => {
  const { teachers, subjects, sections, timetable } = useData();

  const hasTimetable = Object.keys(timetable).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the TimeTale automatic timetable generator.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teachers.length === 0 ? "No teachers added yet" : `${teachers.length} teachers added`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subjects
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {subjects.length === 0 ? "No subjects added yet" : `${subjects.length} subjects added`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sections
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-muted-foreground">
              {sections.length === 0 ? "No sections added yet" : `${sections.length} sections added`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Timetable Status
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasTimetable ? "Generated" : "Not Generated"}</div>
            <p className="text-xs text-muted-foreground">
              {hasTimetable ? "Timetable is ready to view" : "Generate a new timetable"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to generate your automatic timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal list-inside">
              <li className={`pb-4 border-b ${teachers.length > 0 ? 'text-muted-foreground' : ''}`}>
                <span className="font-medium">Add Teachers</span>
                <p className="mt-1 text-sm text-muted-foreground pl-5">
                  Add teachers with their names and subjects they can teach
                </p>
              </li>
              <li className={`pb-4 border-b ${subjects.length > 0 ? 'text-muted-foreground' : ''}`}>
                <span className="font-medium">Add Subjects</span>
                <p className="mt-1 text-sm text-muted-foreground pl-5">
                  Add subjects and specify which sections need them and how many hours per week
                </p>
              </li>
              <li className={`pb-4 border-b ${sections.length > 0 ? 'text-muted-foreground' : ''}`}>
                <span className="font-medium">Add Sections</span>
                <p className="mt-1 text-sm text-muted-foreground pl-5">
                  Add class sections that need timetables
                </p>
              </li>
              <li className={hasTimetable ? 'text-muted-foreground' : ''}>
                <span className="font-medium">Generate Timetable</span>
                <p className="mt-1 text-sm text-muted-foreground pl-5">
                  Click on "Generate Timetable" to automatically create timetables with no time conflicts
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
