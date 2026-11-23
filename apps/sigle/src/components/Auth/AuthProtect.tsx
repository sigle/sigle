import { IconInfoCircle } from "@tabler/icons-react";
import { useSession } from "@/lib/auth-hooks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Spinner } from "../ui/spinner";

interface AuthProtectProps {
  children?: React.ReactNode;
  /** Shown while the session loads, a spinner by default. */
  fallback?: React.ReactNode;
}

export const AuthProtect = ({
  children,
  fallback = (
    <div className="flex justify-center py-14">
      <Spinner />
    </div>
  ),
}: AuthProtectProps) => {
  const { data: session, isPending } = useSession();

  if (session) {
    return children;
  }

  if (isPending) {
    return fallback;
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
