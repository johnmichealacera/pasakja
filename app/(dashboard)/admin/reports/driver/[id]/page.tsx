import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPh, startOfMonthPh, subMonthsPh } from "@/lib/datetime";
import { PLATFORM_COMMISSION_RATE } from "@/lib/commission";
import { PrintButton } from "./print-button";

export default async function DriverReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const { id } = await params;

  const now = new Date();
  const thisMonthStart = startOfMonthPh(now);
  const lastMonthStart = startOfMonthPh(subMonthsPh(now, 1));

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      user: true,
      earnings: {
        include: {
          driver: { include: { user: { select: { name: true } } } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!driver) redirect("/admin/reports");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const safeDriver = driver!;

  const commissionPct = Math.round(PLATFORM_COMMISSION_RATE * 100);
  const driverPct = 100 - commissionPct;

  const thisMonthEarnings = safeDriver.earnings.filter(
    (e) => new Date(e.date) >= thisMonthStart
  );
  const lastMonthEarnings = safeDriver.earnings.filter(
    (e) => new Date(e.date) >= lastMonthStart && new Date(e.date) < thisMonthStart
  );

  function summarize(earnings: typeof safeDriver.earnings) {
    const gross = earnings.reduce((s, e) => s + Number(e.amount) + Number(e.platformFee), 0);
    const fees  = earnings.reduce((s, e) => s + Number(e.platformFee), 0);
    const net   = earnings.reduce((s, e) => s + Number(e.amount), 0);
    return { gross, fees, net, trips: earnings.length };
  }

  const thisMonth = summarize(thisMonthEarnings);
  const lastMonth = summarize(lastMonthEarnings);
  const allTime   = summarize(safeDriver.earnings);

  return (
    <>
      {/* Print-only global style */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #driver-report, #driver-report * { visibility: visible !important; }
          #driver-report { position: fixed; inset: 0; padding: 32px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Actions bar — hidden on print */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h2 className="text-2xl font-bold">Driver Earnings Report</h2>
            <p className="text-muted-foreground">{safeDriver.user.name}</p>
          </div>
          <PrintButton />
        </div>

        {/* ── Printable report area ── */}
        <div id="driver-report" className="space-y-6 bg-background">
          {/* Report header */}
          <div className="border rounded-xl p-6 space-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-bold">Pasakja Transportation System</p>
                <p className="text-muted-foreground text-sm">Driver Earnings Report</p>
                <p className="text-xs text-muted-foreground">
                  Generated: {formatPh(now, "MMMM d, yyyy h:mm a")}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Commission Rate: {commissionPct}% to Pasakja</p>
                <p>Driver Share: {driverPct}% of gross fare</p>
              </div>
            </div>
            <hr className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">{safeDriver.user.name}</p>
                <p className="text-muted-foreground">{safeDriver.user.email}</p>
                <p className="text-muted-foreground">{safeDriver.user.phone ?? "—"}</p>
              </div>
              <div>
                <p><span className="text-muted-foreground">License No.: </span>{safeDriver.licenseNo}</p>
                <p><span className="text-muted-foreground">Vehicle: </span>{safeDriver.vehicleModel}</p>
                <p><span className="text-muted-foreground">Plate: </span>{safeDriver.vehiclePlate}</p>
                <p><span className="text-muted-foreground">Status: </span>
                  <span className={safeDriver.status === "VERIFIED" ? "text-green-600 font-medium" : "text-amber-600"}>
                    {safeDriver.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Period summaries */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: formatPh(thisMonthStart, "MMMM yyyy"), data: thisMonth },
              { label: formatPh(lastMonthStart, "MMMM yyyy"), data: lastMonth },
              { label: "All Time", data: allTime },
            ].map(({ label, data }) => (
              <div key={label} className="border rounded-lg p-4 text-sm">
                <p className="font-semibold text-muted-foreground mb-2">{label}</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trips</span>
                    <span className="font-medium">{data.trips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Fares</span>
                    <span className="font-medium">₱{data.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Platform Fee ({commissionPct}%)</span>
                    <span>−₱{data.fees.toFixed(2)}</span>
                  </div>
                  <hr className="my-1" />
                  <div className="flex justify-between font-bold text-green-700">
                    <span>Driver Net</span>
                    <span>₱{data.net.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trip-by-trip breakdown */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Trip History</span>
              <span>{safeDriver.earnings.length} trips total</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-xs text-muted-foreground">
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-right px-4 py-2">Gross Fare</th>
                  <th className="text-right px-4 py-2">Platform ({commissionPct}%)</th>
                  <th className="text-right px-4 py-2">Driver Net</th>
                </tr>
              </thead>
              <tbody>
                {safeDriver.earnings.map((e, i) => {
                  const gross = Number(e.amount) + Number(e.platformFee);
                  const fee   = Number(e.platformFee);
                  const net   = Number(e.amount);
                  return (
                    <tr key={e.id} className={i % 2 === 0 ? "" : "bg-muted/10"}>
                      <td className="px-4 py-2 text-muted-foreground">
                        {formatPh(new Date(e.date), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-4 py-2 text-right">₱{gross.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-destructive">−₱{fee.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold text-green-700">₱{net.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold bg-muted/30 text-sm">
                  <td className="px-4 py-3">TOTAL ({safeDriver.earnings.length} trips)</td>
                  <td className="px-4 py-3 text-right">₱{allTime.gross.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-destructive">−₱{allTime.fees.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-green-700">₱{allTime.net.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-center pb-2">
            Pasakja: A Web-Based Community Transportation Booking & Dispatching System ·
            Socorro, Surigao del Norte
          </p>
        </div>
      </div>
    </>
  );
}
