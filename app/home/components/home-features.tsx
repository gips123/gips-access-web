"use client";

import { useState } from "react";
import Link from "next/link";
import { HardDrive, KeyRound, StickyNote, Settings, ArrowRight } from "lucide-react";
import { StorageModal } from "@/components/storage/storage-modal";

interface HomeFeaturesProps {
  isLoggedIn: boolean;
}

export function HomeFeatures({ isLoggedIn }: HomeFeaturesProps) {
  const [isStorageModalOpen, setStorageModalOpen] = useState(false);

  const cards = [
    {
      title: "Storage",
      description: "Manage and store files securely in the local cloud.",
      href: null,
      onClick: () => setStorageModalOpen(true),
      icon: HardDrive,
      color: "from-blue-600 to-cyan-400",
      glow: "group-hover:shadow-blue-500/20",
    },
    {
      title: "Access",
      description: "Manage access rights and authentication to various systems.",
      href: "/(protected)/access",
      onClick: undefined,
      icon: KeyRound,
      color: "from-purple-600 to-pink-500",
      glow: "group-hover:shadow-purple-500/20",
    },
    {
      title: "Notes",
      description: "Note ideas and important team documentation in real-time.",
      href: "/(protected)/notes",
      onClick: undefined,
      icon: StickyNote,
      color: "from-amber-500 to-orange-400",
      glow: "group-hover:shadow-amber-500/20",
    },
    {
      title: "Settings",
      description: "Advanced configuration for Access Dashboard.",
      href: "/(protected)/settings",
      onClick: undefined,
      icon: Settings,
      color: "from-emerald-500 to-teal-400",
      glow: "group-hover:shadow-emerald-500/20",
    },
  ];

  const cardClass = (glow: string) =>
    `group relative flex flex-col p-6 space-y-5 overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1.5 shadow-xl ${glow}`;

  const cardInner = (card: typeof cards[number]) => (
    <>
      <div className="flex justify-between items-start">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/50 ring-1 ring-white/10`}>
          <card.icon className="w-7 h-7 text-white drop-shadow-sm" strokeWidth={2} />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-4 h-4 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>
      <div className="space-y-2 flex-grow">
        <h3 className="text-2xl font-semibold tracking-tight text-neutral-100 group-hover:text-white transition-colors">
          {card.title}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors line-clamp-2">
          {card.description}
        </p>
      </div>
      <div className="h-[2px] w-12 bg-white/10 group-hover:w-full transition-all duration-500 rounded-full mt-4"></div>
    </>
  );

  return (
    <>
      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setStorageModalOpen(false)}
        isLoggedIn={isLoggedIn}
      />

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) =>
          card.onClick ? (
            <button
              key={card.title}
              onClick={card.onClick}
              className={cardClass(card.glow) + " text-left w-full cursor-pointer"}
            >
              {cardInner(card)}
            </button>
          ) : (
            <Link key={card.title} href={card.href!} className={cardClass(card.glow)}>
              {cardInner(card)}
            </Link>
          )
        )}
      </div>
    </>
  );
}
