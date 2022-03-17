import { Protected } from '../modules/auth/Protected';
import { NewDashboardLayout } from '../modules/layout/components/NewDashboardLayout';

const DashboardPage = () => {
  return (
    <Protected>
      <NewDashboardLayout />
    </Protected>
  );
};

export default DashboardPage;
