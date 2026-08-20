import { ShieldWarning } from "@phosphor-icons/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, Reveal } from "./ui.jsx";

const NEVER = [
  "Paid signal tiers",
  "Affiliate links to launchpads",
  "A cut of anything you lose",
];

export default function Safety() {
  return (
    <section id="rules" className="relative isolate border-t border-line py-28 md:py-40">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-[14ch] text-[clamp(2.4rem,6vw,4.6rem)]">
            Small rooms fail differently.
          </h2>
          <p className="max-w-[36ch] text-[15.5px] leading-relaxed text-ink-2">
            Eight people can be wrong together. They cannot quietly farm each
            other, which is the failure mode of every 4000 person alpha server.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(140px,auto)] grid-flow-dense grid-cols-1 gap-3 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2">
            <div className="edge flex h-full flex-col justify-between gap-10 rounded-[34px] bg-paper-2 p-8 md:p-10">
              <h3 className="display max-w-[16ch] text-[clamp(1.6rem,3.2vw,2.6rem)]">
                A linked wallet proves a person. It never proves a token.
              </h3>
              <p className="max-w-[50ch] text-[15px] leading-relaxed text-ink-2">
                FNF checks that the trader across from you is one wallet with one
                history and one account. That is the entire claim. Nobody here
                audits a contract for you, and any room that says it does is
                selling something.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="md:col-span-5">
            <div className="edge relative h-full min-h-[240px] overflow-hidden rounded-[34px] bg-paper-2">
              <AmbientVideo
                src={VIDEO.wallet}
                poster={IMG.hands}
                className="photo-grain absolute inset-0 opacity-70 transition-transform duration-500 ease-out hover:scale-[1.025]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5">
            <div className="flex h-full flex-col justify-between gap-6 rounded-[34px] bg-volt p-8 text-on-volt md:p-10">
              <span className="nums text-[clamp(3.6rem,8vw,5.6rem)] font-black leading-[0.78]">8</span>
              <p className="max-w-[26ch] text-[15px] leading-relaxed font-bold">
                The hard cap. Past eight people a room stops being a room and
                starts being a broadcast.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.14} className="md:col-span-6">
            <div className="edge flex h-full flex-col justify-center gap-4 rounded-[34px] bg-paper-2 p-8 md:p-10">
              <h3 className="utility text-ink-3">
                things fnf will never ship
              </h3>
              {NEVER.map((line) => (
                <p key={line} className="display text-[clamp(1.15rem,2vw,1.6rem)]">
                  {line}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18} className="md:col-span-6">
            <div className="edge flex h-full flex-col justify-between gap-8 rounded-[34px] bg-paper-3 p-8 md:p-10">
              <ShieldWarning size={30} weight="bold" className="text-volt" aria-hidden="true" />
              <p className="max-w-[34ch] text-[clamp(1.15rem,2vw,1.6rem)] leading-snug font-bold text-ink">
                One report freezes a room for everybody in it while a human reads
                the log.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
