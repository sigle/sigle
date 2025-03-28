import { Callout, Flex, Spinner, Text } from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

interface AuthProtectProps {
  children?: React.ReactNode;
}

export const AuthProtect = ({ children }: AuthProtectProps) => {
  const { status } = useSession();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  if (status === "unauthenticated") {
    return (
      <Flex justify="center" py="7">
        <Callout.Root color="gray">
          <Callout.Icon>
            <IconInfoCircle />
          </Callout.Icon>
          <Callout.Text>Please sign in to access this page.</Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14">
      <Spinner />
      <Text color="gray" size="2">
        loading auth
      </Text>
    </div>
  );
};
