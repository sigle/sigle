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
import { AppHeader } from '../../components/layout/header/header';
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
      name: 'Email',
      path: '/settings/email',
    },
    {
      name: 'Newsletter',
      path: '/settings/newsletter',
    },
    {
      name: 'Custom domain',
      path: '/settings/custom-domain',
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
            <Link key={item.path} href={item.path} passHref legacyBehavior>
              <DashboardSidebarNavItem selected={router.pathname === item.path}>
                {item.name}
              </DashboardSidebarNavItem>
            </Link>
          ))}
        </DashboardSidebar>
        <Box
          css={{
            mb: '$5',
            overflowY: 'hidden',
          }}
        >
          {router.pathname !== '/settings/plans/compare' && (
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
                      <Link
                        key={item.path}
                        href={item.path}
                        passHref
                        legacyBehavior
                      >
                        <DashboardSidebarNavItem variant="accordion">
                          {item.name}
                        </DashboardSidebarNavItem>
                      </Link>
                    ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {children}
        </Box>
      </DashboardContainer>
      <AppFooter />
    </FullScreen>
  );
};
