// import { authMiddleware } from '@clerk/nextjs';

// export default authMiddleware({});

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/waitlist', request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
};
