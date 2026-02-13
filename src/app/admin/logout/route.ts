import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth";

export async function GET() {
  await deleteSession();
  redirect("/admin/login");
}
