import Image from "next/image";

declare type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  loading?: "eager" | "lazy";
  id?: number;
  sizes?: string;
};

// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number, a: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

export default function OptimizedImage({
  src,
  alt,
  className,
  priority,
  quality,
  loading,
  id,
  sizes,
}: OptimizedImageProps) {
  // Handle TMDB image paths that don't include the base URL
  const imageUrl = src.startsWith('http') 
    ? src 
    : `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${src}`;

  return (
    <Image
      key={id || src}
      src={imageUrl}
      alt={alt}
      fill
      className={`${className} object-cover hover:scale-105 transition-transform duration-300`}
      sizes={sizes}
      priority={priority}
      quality={quality}
      loading={loading}
      placeholder="blur"
      blurDataURL={rgbDataURL(24, 24, 27, 128)} // bg-zinc-900/50 equivalent
    />
  );
}
