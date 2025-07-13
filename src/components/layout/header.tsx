import Link from "next/link"
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { getUser, getUserProfile } from "@/lib/auth"
import { UserNav } from "@/components/auth/user-nav"
import { Button } from "@/components/ui/button"

export async function Header({ cookieStore }: { cookieStore: ReadonlyRequestCookies }) {
  const user = await getUser(cookieStore)
  const profile = user ? await getUserProfile(user.id, cookieStore) : null

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">TW</span>
          </div>
          <span className="font-bold">Task Workflow</span>
        </Link>
        
        <nav className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/projects" className="text-sm font-medium">
                Projects
              </Link>
              <UserNav user={user} profile={profile} />
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
