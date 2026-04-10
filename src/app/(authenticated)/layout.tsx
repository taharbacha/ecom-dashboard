import SidebarLayout from '@/components/SidebarLayout';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
