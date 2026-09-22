import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomePage from "./(modules)/home/page";

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const isMobile = cookieStore.get("is_mobile")?.value;
  const isAuthenticated = Boolean(authToken || isMobile);

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  return <HomePage />;
}



