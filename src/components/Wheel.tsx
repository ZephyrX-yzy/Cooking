import React, { useState, useEffect } from "react";
import { Recipe } from "../types";
import { Sparkles, Play, RotateCcw, HelpCircle, Utensils, Check } from "lucide-react";

interface WheelProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
}

export default function Wheel({ recipes, onOpenRecipe }: WheelProps) {
  const [wheelCandidates, setWheelCandidates] = useState<Recipe[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Recipe | null>(null);

  // Pick 8 random recipes to fill the wheel
  const initCandidates = () => {
    if (recipes.length === 0) return;
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    setWheelCandidates(shuffled.slice(0, 8));
    setWinner(null);
    setRotation(0);
  };

  useEffect(() => {
    initCandidates();
  }, [recipes]);

  const handleSpin = () => {
    if (isSpinning || wheelCandidates.length < 8) return;
    setIsSpinning(true);
    setWinner(null);

    // Dynamic spin: at least 5 full rotations (1800 deg) plus a random slice
    const bonusDeg = Math.floor(Math.random() * 360);
    const totalSpinDeg = 1800 + bonusDeg;
    const newRotation = rotation + totalSpinDeg;
    setRotation(newRotation);

    // Calculate landing index
    // 360 degrees divided into 8 slices is 45 deg per slice.
    // The pointer is at the very top (90 deg or 0 deg offset depending on angle).
    // If we rotate the wheel clockwise by 'newRotation' degrees:
    // the slice that lands at the pointer (top, 0 deg) corresponds to the angle.
    // Let's do landing calculation safely.
    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate final relative angle (0 to 359)
      // Since it spins clockwise, the pointer at the top (under 360 relative index)
      // will point to: (360 - (bonusDeg % 360)) % 360
      const landingAngle = (360 - (bonusDeg % 360)) % 360;
      const sliceSize = 360 / 8;
      const winnerIndex = Math.floor(landingAngle / sliceSize) % 8;
      
      setWinner(wheelCandidates[winnerIndex]);
    }, 4500); // 4.5s transition
  };

  const colors = [
    "#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", 
    "#FC4E2A", "#E31A1C", "#BD0026", "#800026"
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl text-center space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-light flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
          今天吃什么？幸运转盘
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">纠结吃什么？让美食转盘为你挑选今日灵感！</p>
      </div>

      {wheelCandidates.length < 8 ? (
        <div className="py-12 text-slate-400 text-sm">
          数据加载中，请确保已有足够数量的菜谱...
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 relative">
          
          {/* Wheel Pointer */}
          <div className="absolute top-1 z-30 flex flex-col items-center select-none">
            <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-rose-600 drop-shadow" />
            <div className="w-3.5 h-3.5 bg-rose-700/80 rounded-full mt-[-10px]" />
          </div>

          {/* The wheel shell */}
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-full border-8 border-amber-400 dark:border-slate-800 shadow-xl overflow-hidden relative select-none bg-slate-100 dark:bg-slate-850">
            
            {/* Sector background wrapper */}
            <div 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none"
              }}
              className="w-full h-full relative"
            >
              {wheelCandidates.map((candidate, idx) => {
                const angle = 45 * idx; // 360 / 8 = 45 deg
                const sliceStyle: React.CSSProperties = {
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "50% 50%",
                };
                return (
                  <div 
                    key={candidate.id}
                    style={sliceStyle}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    {/* Visual Pie Slice Divider */}
                    <div 
                      className="absolute top-0 right-1/2 w-0.5 h-1/2 bg-white/20 dark:bg-black/10 origin-bottom"
                      style={{ transform: "rotate(22.5deg)" }}
                    />
                    
                    {/* Content inside the slice */}
                    <div className="absolute top-8 flex flex-col items-center select-none space-y-0.5 text-center px-1">
                      <span className="text-2xl drop-shadow-sm">{candidate.imageEmoji}</span>
                      <span className="text-[10px] font-bold text-slate-850 truncate max-w-[70px] drop-shadow-sm">
                        {candidate.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inner spin hub */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-900 border-4 border-amber-400 hover:border-amber-300 text-white flex flex-col items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 z-20 group"
            >
              <span className="text-[10px] font-bold tracking-widest text-amber-400 group-hover:text-amber-300">
                {isSpinning ? "旋转" : "抽选"}
              </span>
              <Utensils className="w-4 h-4 text-white mt-0.5" />
            </button>
          </div>

          {/* Winning Banner */}
          {winner && (
            <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-850 dark:to-orange-900/10 p-5 rounded-2xl border border-amber-100 dark:border-slate-805 text-center max-w-md w-full shadow-md animate-fade-in space-y-3">
              <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full">
                👑 恭喜抽中今日幸运美味！
              </span>
              
              <div className="flex items-center justify-center space-x-3 pt-1.5">
                <span className="text-4xl">{winner.imageEmoji}</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-850 dark:text-white text-base leading-tight">
                    {winner.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    制作用时：{winner.time} 分钟 • 难度：{winner.difficulty}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={initCandidates}
                  className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-755 rounded-lg border flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 再抽一次
                </button>
                <button
                  onClick={() => onOpenRecipe(winner)}
                  className="px-5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-1 transition-all shadow-md shadow-orange-500/15"
                >
                  <Utensils className="w-3.5 h-3.5" /> 查看详尽菜谱
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
