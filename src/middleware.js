import NextAuth from "next-auth"
import authConfig from "./auth.config.js"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnPaymentPage = req.nextUrl.pathname.startsWith("/how-to-pay")
  
  if (isOnPaymentPage && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/how-to-pay"],
}
