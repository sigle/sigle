import { Button } from '@sigle/ui';
import { TbPlus } from 'react-icons/tb';

export default function Home() {
  return (
    <main>
      <div style={{ marginTop: 20 }}>
        <Button size="sm" rightIcon={<TbPlus />}>
          Button
        </Button>
        <Button size="md">Button</Button>
        <Button size="lg">Button</Button>
        <Button size="lg" disabled>
          Button
        </Button>
      </div>
      <div style={{ marginTop: 20 }}>
        <Button size="sm" variant="outline">
          Button
        </Button>
        <Button size="md" variant="outline">
          Button
        </Button>
        <Button size="lg" variant="outline">
          Button
        </Button>
        <Button size="lg" variant="outline" disabled>
          Button
        </Button>
      </div>
      <div style={{ marginTop: 20 }}>
        <Button size="sm" variant="ghost">
          Button
        </Button>
        <Button size="md" variant="ghost">
          Button
        </Button>
        <Button size="lg" variant="ghost">
          Button
        </Button>
        <Button size="lg" variant="ghost" disabled>
          Button
        </Button>
      </div>
    </main>
  );
}
