import { NextResponse, type NextRequest } from 'next/server';
import { REQUEST_ID_HEADER, newRequestId } from '@/lib/requestId';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default function middleware(req: NextRequest): NextResponse {
  const incomingId = req.headers.get(REQUEST_ID_HEADER);
  const requestId = incomingId ?? newRequestId();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const { pathname, search } = req.nextUrl;
  const ua = req.headers.get('user-agent') ?? '';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  console.log(
    JSON.stringify({
      level: 'info',
      time: new Date().toISOString(),
      msg: 'request.received',
      requestId,
      method: req.method,
      path: pathname,
      query: search,
      ip,
      ua,
    }),
  );

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}
