import { IMG, STEPS, VIDEO } from "../data.js";
import { AmbientVideo, Reveal } from "./ui.jsx";

export default function HowItWorks() {
  return (
    <section id="how" className="relative isolate border-t border-line py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <h2 className="display max-w-[12ch] text-[clamp(2.8rem,6vw,5.7rem)]">
              The trial week ritual.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-ink-2">
              No animated tour. You answer, lurk, then prove you are useful before the room lets you stay.
            </p>
          </div>

          <Reveal>
            <div className="edge group overflow-hidden rounded-[34px] bg-paper-2">
              <AmbientVideo
                src={VIDEO.process}
                poster={IMG.process}
                className="photo-grain aspect-[16/9] transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <article className="edge h-full rounded-[30px] bg-paper-2 p-6 md:p-7">
                <div className="nums mb-10 text-[12px] font-black text-volt">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="font-sans text-[24px] font-black leading-[1] text-ink">
                  {step.title}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
