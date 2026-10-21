import { TaskChooseOrganization } from "@clerk/clerk-react";

const ChooseOrganizationPage = () => {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
      <TaskChooseOrganization redirectUrlComplete="/" />
    </div>
  );
};

export default ChooseOrganizationPage;
