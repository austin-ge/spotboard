import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canEditDZ } from "@/lib/permissions";
import SettingsForm from "./SettingsForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({
    where: { slug },
    include: { jumpPlanes: { select: { hexCode: true, tailNumber: true } } },
  });
  if (!dz) notFound();

  const allowed = await canEditDZ(session.user, dz.id);
  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-gray-500">You do not have permission to edit this dropzone.</p>
      </main>
    );
  }

  const isOwner = dz.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="max-w-2xl mx-auto p-8">
      <a
        href={`/dz/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        Back to {dz.name}
      </a>
      <h1 className="text-2xl font-bold mb-1">{dz.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Dropzone settings</p>
      <SettingsForm
        slug={dz.slug}
        isOwner={isOwner || isAdmin}
        initialData={{
          name: dz.name,
          lat: dz.lat,
          lon: dz.lon,
          airportCode: dz.airportCode ?? "",
          exitAltitudeFt: dz.exitAltitudeFt,
          openingAltitudeFt: dz.openingAltitudeFt,
          holdingAreaAltitudeFt: dz.holdingAreaAltitudeFt,
          patternAltitudeFt: dz.patternAltitudeFt,
          jumpRunAirspeedKnots: dz.jumpRunAirspeedKnots,
          headingMode: dz.headingMode,
          fixedHeadingDeg: dz.fixedHeadingDeg,
          runwayHeading1Deg: dz.runwayHeading1Deg,
          runwayHeading2Deg: dz.runwayHeading2Deg,
          canopyForwardSpeedMph: dz.canopyForwardSpeedMph,
          canopyDescentRateMph: dz.canopyDescentRateMph,
          freefallTerminalVelocityMph: dz.freefallTerminalVelocityMph,
          lightToDoorMiles: dz.lightToDoorMiles,
          airplaneDriftMiles: dz.airplaneDriftMiles,
          maxOffsetMiles: dz.maxOffsetMiles,
          jumpRunLengthMiles: dz.jumpRunLengthMiles,
          aircraftName: dz.aircraftName,
          aircraftCruiseSpeedKts: dz.aircraftCruiseSpeedKts,
          separationTableJson: dz.separationTableJson as [number, number][] | null,
          mapZonesJson: dz.mapZonesJson,
          mapStyle: dz.mapStyle,
          jumpPlanes: dz.jumpPlanes.map((p) => ({
            hexCode: p.hexCode,
            tailNumber: p.tailNumber ?? "",
          })),
        }}
      />
    </main>
  );
}
