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
  if (!src) {
    return null;
  }

  // Handle TMDB image paths - ensure we always have the full URL
  const imageUrl = src.startsWith('http')
    ? src
    : `https://image.tmdb.org/t/p/w500${src}`; // Start with w500 size instead of original

  const combinedClassName = `${className || ""} object-cover`.trim();

  // Try different sizes if current size fails
  const handleImageError = (e: any) => {
    const imgElement = e.target as HTMLImageElement;
    const currentUrl = imgElement.src;

    if (currentUrl.includes("/w500/")) {
      // Try w300 size
      const newUrl = currentUrl.replace("/w500/", "/w300/");
      imgElement.src = newUrl;
    } else if (currentUrl.includes("/w300/")) {
      // Try w185 as final fallback
      const newUrl = currentUrl.replace("/w300/", "/w185/");
      imgElement.src = newUrl;
    } else {
      console.error(`Error loading image: ${src}`);
      // You could set a fallback image here
      // imgElement.src = '/fallback-image.jpg';
    }
  };

  return (
    <Image
      key={id || src}
      src={imageUrl}
      alt={alt}
      fill
      className={combinedClassName}
      sizes={sizes || "(max-width: 768px) 100vw, 33vw"}
      priority={priority}
      quality={quality || 75}
      loading={loading}
      placeholder="blur"
      blurDataURL={rgbDataURL(24, 24, 27, 128)}
      onError={handleImageError}
    />
  );
}
