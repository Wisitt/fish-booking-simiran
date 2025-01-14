// app/admin/bookings/page.tsx 
"use client";

import SummaryTable from "@/app/admin/bookings/components/SummaryTable";


const AdminBookingsPage = () => {
  return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4 lg:p-8">
      <SummaryTable />
      </div>
  );
};

export default AdminBookingsPage;
