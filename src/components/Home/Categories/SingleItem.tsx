import React from "react";
import Image from "next/image";
import type { Category } from "@/types/category";

type SingleItemProps = {
  item: Category;
  index?: number;
  visible?: boolean;
};

const SingleItem = ({ item, index = 0, visible = true }: SingleItemProps) => {
  return (
    // Bahar wala div: scroll par 3D reveal (stagger ke saath)
    <div
      className="transition-all duration-700 ease-out [transform-style:preserve-3d]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "perspective(900px) rotateX(0deg) translateY(0) scale(1)"
          : "perspective(900px) rotateX(40deg) translateY(50px) scale(0.85)",
        transitionDelay: visible ? `${Math.min(index, 8) * 90}ms` : "0ms",
      }}
    >
      <a
        href={`/shop-with-sidebar?category=${item.id}`}
        className="group flex flex-col items-center"
      >
        {/* Circle */}
        <div className="relative mb-4 h-32.5 w-32.5 transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105">
          {/* Glow ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue to-blue opacity-0 blur-[2px] transition-opacity duration-300 group-hover:opacity-30" />

          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-[#F2F3F8] shadow-[0_8px_20px_-6px_rgba(60,80,224,0.25)] ring-1 ring-gray-3 transition-all duration-300 group-hover:shadow-[0_18px_30px_-8px_rgba(60,80,224,0.45)] group-hover:ring-2 group-hover:ring-blue">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="130px"
                className="rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-semibold uppercase text-blue">
                {item.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
            {item.name}
          </h3>
        </div>
      </a>
    </div>
  );
};

export default SingleItem;