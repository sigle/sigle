import { Button } from '@sigle/ui';

export default function Home() {
  return (
    <main>
      <div style={{ marginTop: 20 }}>
        <Button size="sm">Button</Button>
        <Button size="md">Button</Button>
        <Button size="lg">Button</Button>
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
      </div>
    </main>
  );
}
