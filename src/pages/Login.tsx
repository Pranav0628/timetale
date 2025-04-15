
import React from "react";
import LoginForm from "@/components/LoginForm";

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
      </div>
    </div>
  );
};

export default Login;
