
import React from "react";
import LoginForm from "@/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">TimeTale</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Automatic Timetable Generator
          </p>
        </div>
        <LoginForm />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2"><strong>Server Setup Instructions:</strong></p>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Install a local server like XAMPP or WAMP</li>
                  <li>Start Apache and MySQL services in your server control panel</li>
                  <li>Copy the <code>api</code> folder to your web server directory (e.g., htdocs/timetable/)</li>
                  <li>Create a MySQL database named <code>timetable_db</code></li>
                  <li>Import the <code>api/db_setup.sql</code> file into your database</li>
                  <li>Verify the API URL in <code>src/contexts/AuthContext.tsx</code> and <code>src/contexts/DataContext.tsx</code> matches your server path (default: http://localhost/timetable/api)</li>
                  <li>Test the API by navigating to <code>http://localhost/timetable/api/teachers/read.php</code> in your browser</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
