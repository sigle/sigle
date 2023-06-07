import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TbCheck, TbInfoCircleFilled, TbSettings } from 'react-icons/tb';
import {
  Badge,
  Box,
  Button,
  Container,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';

type PlanStatus = 'active' | 'inactive' | 'progress' | string;

interface Feature {
  name: string;
  starterPlan: PlanStatus;
  basicPlan: PlanStatus;
  publisherPlan: PlanStatus;
  info: string;
}

const features: Feature[] = [
  {
    name: 'Unlimited publishing',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Write as many articles as you want on Sigle, whatever the plan you choose.',
  },
  {
    name: 'Blog on app.sigle.io',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'We create a profile page for you on app.sigle.io/yourname where your articles will be listed.',
  },
  {
    name: 'Data stored on Gaïa',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Gaia is an off-chain storage solution created by Stacks. All your stories are truly yours and only you can edit and delete them.',
  },
  {
    name: 'Create Ordinals',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: "Inscribe your stories as Ordinals on Bitcoin, the world's most secure blockchain.",
  },
  {
    name: 'Send newsletters',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Connect your Mailjet account and start sending newsletters to your subscribers.',
  },
  {
    name: 'Privacy focused analytics',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: "Get stats about the performance of your blog without sacrificing your user's privacy. Service provided by Plausible.",
  },
  {
    name: 'Monetize your content',
    starterPlan: 'inactive',
    basicPlan: 'progress',
    publisherPlan: 'progress',
    info: 'Connect Unlock Protocol or use Stripe and create a recurring revenue stream.',
  },
  {
    name: 'Custom domain',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Boost your SEO (100/100 Lighthouse score) with a personalized domain that truly stands out while maintaining full ownership of your content.',
  },
  {
    name: 'Page views (custom domain)',
    starterPlan: 'inactive',
    basicPlan: '2,000',
    publisherPlan: '100,000',
    info: 'This indicates the limit of views per month that your custom domain can support. Your articles will always remain visible on app.sigle.io even if the limit is reached.',
  },
  {
    name: 'Custom CSS',
    starterPlan: 'inactive',
    basicPlan: 'inactive',
    publisherPlan: 'progress',
    info: 'Create the blog of your dreams by editing the CSS of your custom domain.',
  },
  {
    name: 'Themes (custom domain)',
    starterPlan: 'inactive',
    basicPlan: '1',
    publisherPlan: '1 (more soon)',
    info: 'Choose among several themes for your custom domain.',
  },
  {
    name: 'Premium support',
    starterPlan: 'inactive',
    basicPlan: 'inactive',
    publisherPlan: 'active',
    info: 'Get fast and prioritized support on our Discord server.',
  },
];

const getFeatureStatus = (value: PlanStatus) => {
  switch (value) {
    case 'active':
      return <TbCheck size={20} />;
    case 'inactive':
      return '—';
    case 'progress':
      return <TbSettings size={20} />;
    default:
      return value;
  }
};

const SettingsPlans = () => {
  return (
    <DashboardLayout
      headerContent={
        <Typography size="xl" fontWeight="bold">
          Settings
        </Typography>
      }
    >
      <Container css={{ py: '$5' }}>
        <div className="relative">
          <div className="absolute inset-0 -z-10 flex">
            <div className="ml-[50%] flex w-1/4">
              <Box
                css={{
                  backgroundColor: '$gray2',
                  borderColor: '$gray5',
                }}
                className="w-full rounded-t-xl border-x border-t"
              />
            </div>
          </div>
          <table className="w-full">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead>
              <tr>
                <td />
                <th scope="col" className="flex gap-2 px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Starter
                  </Typography>
                  <Badge>Current plan</Badge>
                </th>
                <th scope="col" className="px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Basic
                  </Typography>
                </th>
                <th scope="col" className="px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Publisher
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" />
                <td className="px-6 pt-2 flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      Free
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    The fundamentals
                  </Typography>
                </td>
                <td className="px-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      $12
                    </Typography>
                    <Typography size="sm" fontWeight="semiBold">
                      /month
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    or free with 1 NFT
                  </Typography>
                  <Button className="mt-6 w-full">Buy plan</Button>
                </td>
                <td className="px-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      $29
                    </Typography>
                    <Typography size="sm" fontWeight="semiBold">
                      /month
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    or free with 3 NFT
                  </Typography>
                  <Button className="mt-6 w-full">Buy plan</Button>
                </td>
              </tr>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="pb-2 pt-4 text-left"
                >
                  <Typography size="sm" fontWeight="semiBold">
                    Features
                  </Typography>
                </th>
              </tr>
              {features.map((feature) => (
                <tr key={feature.name}>
                  <th
                    scope="row"
                    className="flex items-center justify-between py-2 text-left"
                  >
                    <Typography size="sm" fontWeight="normal">
                      {feature.name}
                    </Typography>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger>
                        <TbInfoCircleFilled size={16} className="ml-1" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={4}
                        css={{
                          textAlign: 'center',
                          boxShadow: 'none',
                          width: 240,
                        }}
                      >
                        <Typography>{feature.info}</Typography>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <td className="px-6 py-2">
                    <div className="flex justify-center">
                      {getFeatureStatus(feature.starterPlan)}
                    </div>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <div className="flex justify-center">
                      {getFeatureStatus(feature.basicPlan)}
                    </div>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <div className="flex justify-center">
                      {getFeatureStatus(feature.publisherPlan)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return (
    <TooltipProvider>{session ? <SettingsPlans /> : null}</TooltipProvider>
  );
}
