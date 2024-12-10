// app/admin/bookings/page.tsx

"use client";

import SummaryTable from "@/app/components/SummaryTable";

const AdminBookingsPage = () => {

  return (
    <div className="container p-3">
      <div className="mt-8 relative">
        <SummaryTable />
      </div>
    </div>
  );
};

export default AdminBookingsPage;
