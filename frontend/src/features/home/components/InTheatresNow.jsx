import { useEffect, useMemo, useRef, useState } from "react";
import "./InTheatresNow.css";


export default function InTheatresNow({
  limit = 100,
  speed = 0.6,
  hover = "pause",
  slowFactor = 0.25,
}) {
  const [shows, setShows] = useState([]);
  const scrollerRef = useRef(null);
  const hoverRef = useRef(false); 

  
  useEffect(() => {
    (async () => {
      try {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const finnDate = `${dd}.${mm}.${yyyy}`;

        const res = await fetch(
          `https://www.finnkino.fi/xml/Schedule/?area=1029&dt=${finnDate}`
        );
        const xml = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        const nodes = doc.getElementsByTagName("Show");

        const list = [];
        for (let i = 0; i < nodes.length && list.length < limit; i++) {
          const s = nodes[i];
          const get = (tag) => s.getElementsByTagName(tag)[0]?.textContent || "";

          const imgLarge = get("EventLargeImagePortrait");
          const imgMedium = get("EventMediumImagePortrait");
          const imgSmall = get("EventSmallImagePortrait");

          list.push({
            id: get("ID"),
            title: get("Title"),
            theatre: get("Theatre"),
            start: get("dttmShowStart"),
            imgLarge,
            imgMedium,
            imgSmall,
          });
        }
        setShows(list);
      } catch (e) {
        console.error("Finnkino fetch failed:", e);
        setShows([]);
      }
    })();
  }, [limit]);

  
  const looped = useMemo(() => shows.concat(shows), [shows]);

  
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !shows.length) return;

    let raf;
    const tick = () => {
      let v = speed;

      if (hoverRef.current) {
        if (hover === "pause") v = 0;
        else if (hover === "slow") v = Math.max(0, speed * slowFactor);
      }

      el.scrollLeft += v;

      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    
    const enter = () => (hoverRef.current = true);
    const leave = () => (hoverRef.current = false);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    
    el.addEventListener("touchstart", enter, { passive: true });
    el.addEventListener("touchend", leave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("touchstart", enter);
      el.removeEventListener("touchend", leave);
    };
  }, [shows, speed, hover, slowFactor]);

  const fmtTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <section className="theatres-row">
      <h2>In theaters right Now</h2>
      <div className="theatres-scroll" ref={scrollerRef}>
        {looped.map((s, i) => {
          const key = `${s.id}-${i}`;
          const src = s.imgMedium || s.imgLarge || s.imgSmall || "";
          const srcSet = [
            s.imgSmall ? `${s.imgSmall} 185w` : "",
            s.imgMedium ? `${s.imgMedium} 342w` : "",
            s.imgLarge ? `${s.imgLarge} 500w` : "",
          ]
            .filter(Boolean)
            .join(", ");
          const sizes = "(max-width: 768px) 160px, 180px";

          return (
            <div key={key} className="theatre-card">
              <img
                className="poster"
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                alt={s.title}
                loading="lazy"
                decoding="async"
              />
              <h3 className="title" title={s.title}>
                {s.title}
              </h3>
              <div className="meta">
                <span className="time">{fmtTime(s.start)}</span>
                <span className="theatre" title={s.theatre}>
                  {s.theatre}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
