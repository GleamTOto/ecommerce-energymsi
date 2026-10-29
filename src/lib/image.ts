export function isRemoteImageSource(src: string): boolean {
  return /^https?:\/\//i.test(src)
}
