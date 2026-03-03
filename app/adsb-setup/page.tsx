import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADS-B Receiver Setup — Spotboard",
  description:
    "How to set up a Raspberry Pi ADS-B receiver at your dropzone for live aircraft tracking.",
};

export default function AdsbSetupPage() {
  return (
    <main className="min-h-screen bg-[#f0f2f7]">
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          ADS-B Receiver Setup
        </h1>
        <p className="text-slate-400 mt-1.5 mb-10">
          Set up a Raspberry Pi to track aircraft at your dropzone
        </p>

        <div className="space-y-6">
          {/* Intro */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <p className="text-slate-600 leading-relaxed">
              ADS-B (Automatic Dependent Surveillance–Broadcast) is a system
              where aircraft continuously transmit their position, altitude, and
              speed on 1090 MHz. With a cheap SDR dongle and a Raspberry Pi, you
              can receive these signals at your dropzone and see every aircraft
              within roughly 200–300 miles. This guide walks through the full
              setup.
            </p>
          </section>

          {/* Hardware */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              What You&apos;ll Need
            </h2>
            <ul className="space-y-3 text-slate-600 leading-relaxed">
              <li>
                <span className="font-medium text-slate-800">
                  Raspberry Pi 3B+ or newer
                </span>{" "}
                — A Pi 4 or Pi 5 works great too. Any model with USB and
                ethernet/Wi-Fi will do.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  RTL-SDR USB dongle
                </span>{" "}
                — Any RTL2832U-based dongle. The FlightAware Pro Stick Plus
                (~$30) has a built-in 1090 MHz filter and LNA, which helps a
                lot.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  1090 MHz antenna
                </span>{" "}
                — A purpose-built ADS-B antenna is ideal. You can also make a
                DIY quarter-wave ground plane antenna from a coax connector and
                some wire.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  MicroSD card (16 GB+)
                </span>{" "}
                — For the Raspberry Pi OS.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  Power supply &amp; internet connection
                </span>{" "}
                — The Pi needs to be powered and connected to your network
                (Wi-Fi or ethernet).
              </li>
            </ul>
          </section>

          {/* Software setup */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Software Setup
            </h2>
            <p className="text-slate-600 leading-relaxed mb-5">
              We use{" "}
              <span className="font-medium text-slate-800">dump1090-fa</span>,
              the FlightAware fork of dump1090. It&apos;s the most actively
              maintained version and includes a built-in web interface.
            </p>

            <div className="space-y-5">
              {/* Step 1 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  1. Flash Raspberry Pi OS Lite
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">
                  Download the{" "}
                  <span className="font-medium">
                    Raspberry Pi Imager
                  </span>{" "}
                  and flash{" "}
                  <span className="font-medium">
                    Raspberry Pi OS Lite (64-bit)
                  </span>{" "}
                  to your MicroSD card. Enable SSH and configure Wi-Fi in the
                  imager settings so you can connect headless.
                </p>
              </div>

              {/* Step 2 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  2. Install dump1090-fa
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">
                  SSH into the Pi and run:
                </p>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 overflow-x-auto">
                  <code>{`sudo apt update && sudo apt upgrade -y

# Add the FlightAware repository
wget https://repo-feed.flightaware.com/flightaware-apt-repository.deb
sudo dpkg -i flightaware-apt-repository.deb
sudo apt update

# Install dump1090-fa
sudo apt install -y dump1090-fa`}</code>
                </pre>
              </div>

              {/* Step 3 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  3. Verify it&apos;s running
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">
                  After installation, dump1090-fa starts automatically. Check
                  the service status:
                </p>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 overflow-x-auto">
                  <code>{`sudo systemctl status dump1090-fa`}</code>
                </pre>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  Open a browser and go to{" "}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">
                    http://&lt;pi-ip&gt;:8080
                  </code>{" "}
                  — you should see a map with aircraft appearing. The JSON feed
                  is available at{" "}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">
                    http://&lt;pi-ip&gt;:8080/data/aircraft.json
                  </code>
                  .
                </p>
              </div>

              {/* Step 4 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  4. Set your location (optional but recommended)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">
                  Edit the dump1090-fa config to set your receiver&apos;s
                  coordinates. This enables accurate distance/bearing
                  calculations in the web UI:
                </p>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 overflow-x-auto">
                  <code>{`sudo nano /etc/default/dump1090-fa

# Set these values to your dropzone's coordinates:
# RECEIVER_LAT="41.xxxx"
# RECEIVER_LON="-88.xxxx"

sudo systemctl restart dump1090-fa`}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Antenna tips */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Antenna Placement Tips
            </h2>
            <ul className="space-y-3 text-slate-600 leading-relaxed">
              <li>
                <span className="font-medium text-slate-800">
                  Higher is better
                </span>{" "}
                — 1090 MHz is line-of-sight. Mounting the antenna on a roof or
                elevated pole dramatically improves range.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  Keep it outdoors
                </span>{" "}
                — Walls and roofing materials attenuate the signal. Even a
                window mount is a big improvement over being fully indoors.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  Clear line of sight
                </span>{" "}
                — Trees, buildings, and terrain all block signals. A clear
                horizon in all directions is the goal.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  Expect 200–300 miles
                </span>{" "}
                — With a decent antenna and good placement, you can typically
                see aircraft out to 200–300 nautical miles.
              </li>
            </ul>
          </section>

          {/* Connecting to Spotboard */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Connecting to Spotboard
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Direct integration between your receiver and Spotboard is coming
              soon. Once available, you&apos;ll be able to enter your
              receiver&apos;s URL in your dropzone&apos;s settings and Spotboard
              will pull aircraft data directly from it.
            </p>
            <p className="text-slate-600 leading-relaxed">
              In the meantime, your receiver still works great on its own — you
              can view the built-in map at port 8080, and optionally feed your
              data to services like FlightAware or ADS-B Exchange for public
              flight tracking.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link
            href="/about"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            &larr; Back to about
          </Link>
        </div>
      </div>
    </main>
  );
}
