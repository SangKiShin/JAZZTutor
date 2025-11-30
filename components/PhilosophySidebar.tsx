import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Music, Sparkles } from 'lucide-react';
import { PhilosophyItem } from '../types';

const PHILOSOPHIES: PhilosophyItem[] = [
  {
    title: "The Illusion",
    quote: "당신이 듣는 것은 악기가 아닙니다. 당신의 내면입니다. 악기는 단지 확성기일 뿐입니다.",
    author: "Hal Galper"
  },
  {
    title: "Process over Product",
    quote: "과정 자체가 보상입니다. 결과에 집착하는 순간, 당신은 '지금'을 놓치게 됩니다.",
    author: "Mick Goodrick"
  },
  {
    title: "Neuroplasticity",
    quote: "당신이 잠들 때, 뇌는 오늘 연습한 혼란스러운 정보들을 정리하여 '기술'로 변환합니다. 휴식도 연습입니다.",
    author: "Science of Practice"
  },
  {
    title: "The Unitar",
    quote: "한 줄(String)에서 모든 것을 할 수 없다면, 여섯 줄에서는 더욱 불가능합니다.",
    author: "The Advancing Guitarist"
  }
];

const PhilosophySidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<PhilosophyItem>(PHILOSOPHIES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const random = PHILOSOPHIES[Math.floor(Math.random() * PHILOSOPHIES.length)];
      setActiveItem(random);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex flex-col w-80 bg-jazz-900 border-r border-jazz-700 p-6 h-full text-jazz-gold overflow-y-auto">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-bold mb-2 tracking-wide text-white">The Inner Ear</h1>
        <p className="text-jazz-600 text-sm font-sans">Jazz Mentorship & Neural Guidance</p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="bg-jazz-800 p-6 rounded-lg border border-jazz-700 shadow-lg relative overflow-hidden group hover:border-jazz-gold transition-colors duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={48} />
          </div>
          <h3 className="font-serif text-xl mb-4 text-white">{activeItem.title}</h3>
          <p className="font-sans text-jazz-accent text-lg leading-relaxed italic mb-4">
            "{activeItem.quote}"
          </p>
          <p className="text-right text-sm text-jazz-600 font-bold">— {activeItem.author}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm uppercase tracking-widest text-jazz-600 border-b border-jazz-700 pb-2">Core Concepts</h4>
          
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <Brain className="w-5 h-5 text-jazz-gold shrink-0 mt-0.5" />
            <span>
              <strong className="text-white block">Conscious vs Subconscious</strong>
              연습은 의식으로, 연주는 무의식으로.
            </span>
          </div>
          
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <Music className="w-5 h-5 text-jazz-gold shrink-0 mt-0.5" />
            <span>
              <strong className="text-white block">Forward Motion</strong>
              리듬이 멜로디를 이끕니다. 타겟 노트를 향해 나아가세요.
            </span>
          </div>

          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <BookOpen className="w-5 h-5 text-jazz-gold shrink-0 mt-0.5" />
            <span>
              <strong className="text-white block">No Shortcuts</strong>
              왕도는 없습니다. 오직 당신만의 길만 있을 뿐입니다.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 text-xs text-jazz-600 text-center">
        Powered by Gemini 2.5 & Cognitive Science
      </div>
    </div>
  );
};

export default PhilosophySidebar;