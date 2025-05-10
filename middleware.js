// Temporary middleware while debugging deploy issues
export function middleware() {
  // No-op
  return;
}
 
// Skip running middleware
export const config = {
  matcher: []
}; 