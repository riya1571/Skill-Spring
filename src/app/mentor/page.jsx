import AIMentorChat from "@/components/AIMentorChat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MentorPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-4">
            Meet Your Personal Mentor
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Skill Spring AI Mentor এখন আপনার হাতের মুঠোয়। কোডিং থেকে শুরু করে ক্যারিয়ার গাইডলাইন—সব পাবেন এক জায়গায়।
          </p>
        </div>
        
        <AIMentorChat userEmail={session.user.email} />
      </div>
    </div>
  );
}