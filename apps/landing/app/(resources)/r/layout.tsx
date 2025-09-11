export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-16 h-full">
     <div className="pt-16"> {children}</div>
    </div>
  );
} 