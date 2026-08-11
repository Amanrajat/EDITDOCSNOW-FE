export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function truncateFilename(name: string, maxLength = 28): string {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf(".");
  const ext = extIndex > -1 ? name.slice(extIndex) : "";
  const base = extIndex > -1 ? name.slice(0, extIndex) : name;
  const keep = Math.max(maxLength - ext.length - 1, 4);
  return `${base.slice(0, keep)}…${ext}`;
}
