import { CustomersListClient } from "@/components/admin/customers/customers-list-client";

export const metadata = { title: "Khách hàng" };

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Khách hàng</h1>
      <CustomersListClient />
    </div>
  );
}
