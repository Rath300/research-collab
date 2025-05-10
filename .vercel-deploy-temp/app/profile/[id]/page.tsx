export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p>This is a static profile page for demonstration purposes.</p>
      <p>Profile ID: {params.id}</p>
    </div>
  );
} 