"use client";

import { useEffect, useMemo, useState } from "react";

const reviews = [
  {
    name: "Rafiqul Islam",
    text:
      "Argentina er jersey ta original er motoi same silo. Dhaka te duidin er moddhe delivery peyechi. Jinish khub quality. COD system tao onek upokari hoise.",
  },
  {
    name: "Sadia Khanam",
    text:
      "Onk sundor fits. Dhonnobad STRIKE. Ami XL size order korsilam, perfectly fit hoise. Stitching and finishing duita e premium mone hoise.",
  },
  {
    name: "Tanvir Ahmed",
    text:
      "Bangladesh er under jersey order korsilam, quality top notch paisi. COD facility ar fast processing dutoi khub useful chilo. Overall smooth experience.",
  },
  {
    name: "Nusrat Jahan",
    text:
      "Packaging ta onek premium chilo. Jersey tar fabric soft and breathable. Chattogram e delivery expected time er aagei paichi.",
  },
  {
    name: "Fahim Hasan",
    text:
      "Hot deals theke niyechilam. Price er tulonay quality onek better. First order hoileo confidence peyechi abar nibo.",
  },
  {
    name: "Shakib Reza",
    text:
      "World Cup collection ta onek premium dekhaise. Product page, size selection and order process sob kichu clean and easy lagse.",
  },
];

function getVisibleReviews(startIndex: number) {
  return [0, 1, 2].map((offset) => reviews[(startIndex + offset) % reviews.length]);
}

export function HomeReviewSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const visibleReviews = useMemo(() => getVisibleReviews(index), [index]);

  return (
    <div className="lux-review-slider-wrap">
      <div className="lux-review-grid">
        {visibleReviews.map((review, cardIndex) => (
          <div
            key={`${review.name}-${index}-${cardIndex}`}
            className="lux-review-card"
          >
            <div className="lux-review-stars">★★★★★</div>

            <div className="lux-review-name">{review.name}</div>
            <div className="lux-review-verified">✓ Verified Purchase</div>

            <p className="lux-review-text">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="lux-review-dots">
        {reviews.map((_, dotIndex) => (
          <span
            key={dotIndex}
            className={
              dotIndex === index
                ? "lux-review-dot lux-review-dot-active"
                : "lux-review-dot"
            }
          />
        ))}
      </div>
    </div>
  );
}