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
import { useFeatureFlags } from '../../utils/featureFlags';
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
  const { isExperimentalNewsletterEnabled } = useFeatureFlags();

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

  if (isExperimentalNewsletterEnabled) {
    navItems.splice(
      1,
      0,
      {
        name: 'Private data',
        path: '/settings/private-data',
      },
      {
        name: 'Newsletter',
        path: '/settings/newsletter',
      }
    );
  }

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
