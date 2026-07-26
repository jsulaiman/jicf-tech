import Image from "next/image";
import foundationImg from "../../../public/foundation-of-discipleship.png";

export default function CurrentSeriesCard() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
      <div className="grid sm:grid-cols-2">
        <div className="relative aspect-[16/9] sm:aspect-auto sm:min-h-[220px] bg-slate-950">
          <Image
            src={foundationImg}
            alt="JICF Men's Fellowship — Foundation of Discipleship, beginning Saturday, August 8, 2026"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5 flex flex-col justify-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Current series
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Foundation of Discipleship
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A 12-topic journey to build a strong foundation and grow as
            faithful disciples of Jesus Christ &mdash; walking together,
            growing in Christ, making disciples.
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Beginning Saturday, August 8, 2026</li>
            <li>Every Saturday, 7:00&ndash;9:00 AM</li>
            <li>
              25th Floor, Graha CIMB Niaga, Jl. Jendral Sudirman Kav. 58,
              Jakarta Selatan
            </li>
          </ul>
          <a
            href="https://www.jicf.org/men/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-fit rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Learn more &amp; join us &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
