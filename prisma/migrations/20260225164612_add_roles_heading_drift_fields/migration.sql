-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('JUMPER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "HeadingMode" AS ENUM ('AUTO', 'RUNWAY', 'FIXED');

-- AlterTable
ALTER TABLE "Dropzone" ADD COLUMN     "aircraftCruiseSpeedKts" INTEGER,
ADD COLUMN     "aircraftName" TEXT,
ADD COLUMN     "airplaneDriftMiles" DOUBLE PRECISION,
ADD COLUMN     "canopyDescentRateMph" DOUBLE PRECISION,
ADD COLUMN     "canopyForwardSpeedMph" DOUBLE PRECISION,
ADD COLUMN     "fixedHeadingDeg" INTEGER,
ADD COLUMN     "freefallTerminalVelocityMph" DOUBLE PRECISION,
ADD COLUMN     "headingMode" "HeadingMode" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "jumpRunLengthMiles" DOUBLE PRECISION,
ADD COLUMN     "lightToDoorMiles" DOUBLE PRECISION,
ADD COLUMN     "maxOffsetMiles" DOUBLE PRECISION,
ADD COLUMN     "runwayHeading1Deg" INTEGER,
ADD COLUMN     "runwayHeading2Deg" INTEGER,
ADD COLUMN     "separationTableJson" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'JUMPER';
