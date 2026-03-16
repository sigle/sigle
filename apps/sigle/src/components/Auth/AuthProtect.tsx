import { IconInfoCircle } from "@tabler/icons-react";
import { useSession } from "@/lib/auth-hooks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Spinner } from "../ui/spinner";

interface AuthProtectProps {
  children?: React.ReactNode;
}

export const AuthProtect = ({ children }: AuthProtectProps) => {
  const { data: session, isPending } = useSession();

  if (session) {
    return children;
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14">
        <Spinner />
        <p className="text-muted-foreground">loading auth</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10">
      <Alert>
        <IconInfoCircle size={16} />
        <AlertTitle>Authentication required</AlertTitle>
        <AlertDescription>
          Please sign in with your wallet to access this page.
        </AlertDescription>
      </Alert>
    </div>
  );
};
