import { VariantProps } from '@stitches/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
} from '../../ui';
import { AppFooter } from '../layout/components/AppFooter';
import { AppHeader } from '../layout/components/AppHeader';
import {
  DashboardContainer,
  FullScreen,
  DashboardSidebar,
  DashboardSidebarNavItem,
} from '../layout/components/DashboardLayout';

interface DashboardLayoutProps extends VariantProps<typeof DashboardContainer> {
  children: React.ReactNode;
}

export const SettingsLayout = ({
  children,
  ...props
}: DashboardLayoutProps) => {
  const router = useRouter();

  const navItems = [
    {
      name: 'Public Profile',
      path: '/settings',
    },
    {
      name: 'Plans',
      path: '/settings/plans',
    },
  ];

  return (
    <FullScreen>
      <AppHeader />
      <DashboardContainer {...props}>
        <DashboardSidebar>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} passHref>
              <DashboardSidebarNavItem selected={router.pathname === item.path}>
                {item.name}
              </DashboardSidebarNavItem>
            </Link>
          ))}
        </DashboardSidebar>
        <Box
          css={{
            mb: '$5',
          }}
        >
          <Accordion
            css={{ '@xl': { display: 'none' } }}
            collapsible
            type="single"
          >
            <AccordionItem value="item1">
              <AccordionTrigger>
                {navItems.find((item) => item.path === router.pathname)?.name}
              </AccordionTrigger>
              <AccordionContent>
                {navItems
                  .filter((item) => item.path !== router.pathname)
                  .map((item) => (
                    <Link key={item.path} href={item.path} passHref>
                      <DashboardSidebarNavItem variant="accordion">
                        {item.name}
                      </DashboardSidebarNavItem>
                    </Link>
                  ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {children}
        </Box>
      </DashboardContainer>
      <AppFooter />
    </FullScreen>
  );
};
