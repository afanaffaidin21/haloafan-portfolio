import { Reveal } from "@/components/motion-primitives";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";

/**
 * Big centered quote (992x228): 28px quote, bold highlight, 38px avatar +
 * name/role, 24px padding, 32px gap.
 */
export function BigQuote({
  text,
  bold,
  tail,
  name,
  role,
  avatar,
}: {
  text: string;
  bold: string;
  tail: string;
  name: string;
  role: string;
  avatar: string;
}) {
  if (!text && !bold) return null;

  return (
    <section className="flex w-full flex-col items-center py-8 md:py-16">
      <div className="container-1080">
        <Reveal className="w-full">
          <div className="flex flex-col items-center gap-6 p-6">
            <p className="max-w-[780px] text-center text-[22px] font-medium leading-[30.8px] tracking-[-0.66px] md:text-[24px] md:leading-[33.6px] md:tracking-[-0.72px] lg:text-[28px] lg:leading-[39.2px] lg:tracking-[-0.84px]">
              {text}
              {bold ? <strong className="font-semibold">{bold}</strong> : null}
              {tail}
            </p>
            {name || role || avatar ? (
              <div className="flex items-center gap-3">
                <span className={`block size-[38px] overflow-hidden rounded-full${emptyFrame(avatar)}`}>
                  <MaybeImg src={avatar} alt="" className="size-[38px] object-cover" />
                </span>
                {name || role ? (
                  <div className="flex flex-col">
                    {name ? <p className="t-label whitespace-pre">{name}</p> : null}
                    {role ? <p className="t-micro text-ink-2 whitespace-pre">{role}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
