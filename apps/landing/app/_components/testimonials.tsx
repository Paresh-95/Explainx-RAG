"use client";

import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import { motion } from 'framer-motion';

const featuredTestimonial = {
  body: "Best Deal in Influencer Marketing: I recently tried out ExplainX, and I was amazed by the experience. Their AI-powered creator matching and performance-based pricing model is exactly what small businesses need. I found the perfect creators for my brand at a fraction of the cost of traditional platforms. The ROI tracking is incredible!",
  author: {
    name: "AppSumo User",
    handle: "106812663271318157415",
    imageUrl: "/images/blog/yt.jpg",
    logoUrl: "/images/blog/yt.jpg",
  },
};

const testimonials: {
  body: string;
  author: {
    name: string;
    handle: string;
    imageUrl: string;
  };
}[][][] = [
  [
    [
      {
        body: "Finally got my lifetime subscription to ExplainX. The AI-powered creator matching is saving me hours of manual search time. The performance analytics make it easy to track ROI and optimize campaigns in real-time.",
        author: {
          name: "Aman Sharma",
          handle: "amanintech",
          imageUrl: "https://ph-avatars.imgix.net/2179893/0b68c40a-0596-4222-bb92-03b99c41bb4e.png",
        },
      },
      {
        body: "This platform is a game-changer for marketing agencies. The ability to find and connect with verified creators, track performance, and only pay for actual results makes scaling influencer campaigns so much more efficient.",
        author: {
          name: "Roberto Perez",
          handle: "rockyperezz",
          imageUrl: "https://ph-avatars.imgix.net/6212118/e65b8927-e1df-4197-a6ea-c75f1c20ee6f.gif",
        },
      },
      {
        body: "Love the pay-per-performance model. It's refreshing to see a platform that aligns costs with actual results. The AI matching is spot-on, and the creator verification process gives us confidence.",
        author: {
          name: "Florian Myter",
          handle: "florian_myter",
          imageUrl: "https://ph-avatars.imgix.net/5413468/c0037336-08b0-4570-9375-0ea68c9b2563.png",
        },
      },
    ],
    [
      {
        body: "Perfect for Growing Brands: From day one with ExplainX, I knew this was different. The AI matches us with creators who truly align with our brand values. The performance tracking and automated payments make management a breeze. A must-have for modern marketing teams!",
        author: {
          name: "AppSumo User",
          handle: "jazzyb9090",
          imageUrl: "https://appsumo2-cdn.appsumo.com/media/users/avatars/image-1244211669559.jpg?width=256&height=256&aspect_ratio=1:1",
        },
      },
    ],
  ],
  [
    [
      {
        body: "Finally, an influencer marketing platform that makes sense for smaller brands. The credit system and performance-based pricing remove all the risk. Already seeing great engagement rates!",
        author: {
          name: "Alex Egorov",
          handle: "alex_egorov",
          imageUrl: "https://ph-avatars.imgix.net/3695082/53ef7bc8-b0d2-40c0-96df-1873caf289d9.gif",
        },
      },
      {
        body: "The ROI tracking and analytics features are impressive! ExplainX makes it easy to measure the impact of every creator partnership. Essential for any data-driven marketing team.",
        author: {
          name: "Chirag",
          handle: "chiragshelar",
          imageUrl: "https://ph-avatars.imgix.net/6429993/c24d940d-c5c0-4ca9-903f-0e5e91a2b8ea.png",
        },
      }
    ],
    [
      {
        body: "ExplainX has streamlined our entire creator collaboration process. The automatic payment system and performance tracking save us hours of manual work.",
        author: {
          name: "Mike Wakoz",
          handle: "mike_wakoz",
          imageUrl: "https://ph-avatars.imgix.net/5873417/8599ac4a-12c3-476d-8e1a-e1c78f9e786e.jpeg",
        },
      },
      {
        body: "Congratulations Yash, ExplainX is the perfect example of how AI can transform influencer marketing. The creator matching is incredibly accurate!",
        author: {
          name: "Jawad Naeem",
          handle: "jawadnaeem243",
          imageUrl: "https://ph-avatars.imgix.net/6557527/18bf441a-1347-4969-a7ad-95fe4352cea5.jpeg",
        },
      },
    ],
  ],
];

export function Testimonials() {
  return (
    <div className="relative isolate pb-20 pt-24 sm:pt-32" id="testimonials">
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-[#1F1328] bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 font-geist px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit mx-auto mb-4">
            Wall of Love ❤️
          </div>
          <h1 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent md:text-5xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">Loved</span> by 1000+ users
          </h1>
        </motion.div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          <figure className="col-span-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 sm:col-span-2 xl:col-start-2 xl:row-end-1">
            <blockquote className="p-6 text-lg font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-100 sm:p-12 sm:text-xl sm:leading-8">
              <p>{`"${featuredTestimonial.body}"`}</p>
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sm:flex-nowrap">
              <Image
                className="h-10 w-10 flex-none rounded-full bg-muted"
                src={featuredTestimonial.author.imageUrl}
                alt=""
                width={40}
                height={40}
              />
              <div className="flex-auto">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {featuredTestimonial.author.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400">{`@${featuredTestimonial.author.handle}`}</div>
              </div>
              <Image
                className="h-8 w-auto flex-none"
                src={featuredTestimonial.author.logoUrl}
                alt=""
                height={32}
                width={98}
                unoptimized
              />
            </figcaption>
          </figure>
          {testimonials.map((columnGroup, columnGroupIdx) => (
            <div
              key={columnGroupIdx}
              className="space-y-8 xl:contents xl:space-y-0"
            >
              {columnGroup.map((column, columnIdx) => (
                <div
                  key={columnIdx}
                  className={cn(
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonials.length - 1 &&
                        columnIdx === columnGroup.length - 1)
                      ? "xl:row-span-2"
                      : "xl:row-start-1",
                    "space-y-8"
                  )}
                >
                  {column.map((testimonial) => (
                    <figure
                      key={testimonial.author.handle}
                      className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                    >
                      <blockquote>
                        <p className="text-gray-900 dark:text-gray-100">{`"${testimonial.body}"`}</p>
                      </blockquote>
                      <figcaption className="mt-6 flex items-center gap-x-4">
                        <Image
                          className="h-10 w-10 rounded-full bg-muted"
                          src={testimonial.author.imageUrl}
                          alt=""
                          width={40}
                          height={40}
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {testimonial.author.name}
                          </div>
                          {testimonial.author.handle && (
                            <div className="text-gray-500 dark:text-gray-400">
                              @{testimonial.author.handle}
                            </div>
                          )}
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}