import { TbCheck, TbInfoCircleFilled, TbSettings } from 'react-icons/tb';
import { Tooltip, TooltipContent, TooltipTrigger, Typography } from '@sigle/ui';

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

export const TableFeatures = () => {
  return (
    <>
      {features.map((feature) => (
        <tr key={feature.name}>
          <th
            scope="row"
            className="flex items-center justify-between py-3 text-left"
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
          <td className="px-6 py-3">
            <div className="flex justify-center">
              {getFeatureStatus(feature.starterPlan)}
            </div>
          </td>
          <td className="px-6 py-3 text-center">
            <div className="flex justify-center">
              {getFeatureStatus(feature.basicPlan)}
            </div>
          </td>
          <td className="px-6 py-3 text-center">
            <div className="flex justify-center">
              {getFeatureStatus(feature.publisherPlan)}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};
