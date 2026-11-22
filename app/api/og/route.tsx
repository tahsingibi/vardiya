import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OgXCard } from "@/components/og-image";

// The social crawler preview is generated once during build, never at runtime.
export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(
    <OgXCard score={0} deliveries={0} reason="shift_end" violations={0} highScore={0}
      logoUrl={`data:image/png;base64,${readFileSync(path.join(process.cwd(), "public/logo.png")).toString("base64")}`} host="vardiya.sungur.dev" />,
    { width: 1200, height: 630 },
  );
}
