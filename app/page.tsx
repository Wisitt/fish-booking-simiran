// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-5xl font-bold mb-4">Welcome to the Fish Booking System</h1>
      <p className="text-xl mb-8">This system allows you to manage fish bookings, track quantities, and export data.</p>
      <Link href="/bookings" className="text-2xl text-blue-500 hover:underline">
        Go to Booking System
      </Link>
    </div>
  );
}
