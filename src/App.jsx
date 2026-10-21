import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SignUp } from "@clerk/clerk-react";

import Layout from "./pages/Layout";
import ChooseOrganizationPage from "./pages/ChooseOrganizationPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";

const App = () => {
  return (
    <>
      <Toaster />

      <Routes>
        <Route
          path="/session-tasks/choose-organization"
          element={<ChooseOrganizationPage />}
        />

        <Route
          path="/sign-up/*"
          element={
            <div className="flex min-h-dvh items-center justify-center p-4">
              <SignUp routing="hash" signInUrl="/" forceRedirectUrl="/" />
            </div>
          }
        />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
