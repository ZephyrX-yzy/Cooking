import React, { useRef } from "react";
import { CookingRecord, Recipe } from "../types";
import { 
  Award, Calendar, Trophy, CalendarDays, Trash2, Download, Upload, CheckCircle2,
  Lock, ArrowUpRight, Flame, Clock, RefreshCcw
} from "lucide-react";

interface AchievementsGridProps {
  history: CookingRecord[];
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  recipes: Recipe[];
  customRecipesCount: number;
  onImportBackup: (importedData: any) => void;
  favorites: string[];
}

export default function AchievementsGrid({
  history,
  onDeleteHistoryItem,
  onClearHistory,
  recipes,
  customRecipesCount,
  onImportBackup,
  favorites
}: AchievementsGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic achievement calculations
  const totalCooks = history.length;
  
  // Count unique dishes cooked
  const uniqueFinishedRecipeIds = Array.from(new Set(history.map(x => x.recipeId)));
  const uniqueCount = uniqueFinishedRecipeIds.length;

  // Count by cuisines/categories cooked
  const cookedRecipesCategories = history.map(x => {
    const rc = recipes.find(r => r.id === x.recipeId);
    return rc ? rc.category : "";
  }).filter(c => c !== "");

  const szechuanCooked = cookedRecipesCategories.filter(c => c === "川菜").length;
  const cantoneseCooked = cookedRecipesCategories.filter(c => c === "粤菜").length;
  const dessertCooked = cookedRecipesCategories.filter(c => c === "烘焙甜品" || c === "甜品").length;

  // Form structured achievements list
  const achievements = [
    {
      id: "ach_novice",
      name: "新手厨师",
      desc: "成功完成 1 次经典菜谱烹饪打卡",
      target: 1,
      current: totalCooks,
      icon: "🍳",
      color: "from-blue-400 to-indigo-500",
      unlocked: totalCooks >= 1
    },
    {
      id: "ach_haoma",
      name: "家常达人",
      desc: "成功完成 5 次经典菜谱烹饪打卡",
      target: 5,
      current: totalCooks,
      icon: "🍲",
      color: "from-amber-400 to-orange-500",
      unlocked: totalCooks >= 5
    },
    {
      id: "ach_god",
      name: "大内厨神",
      desc: "成功完成 15 次经典菜谱烹饪打卡",
      target: 15,
      current: totalCooks,
      icon: "👑",
      color: "from-red-500 to-rose-600 animate-pulse",
      unlocked: totalCooks >= 15
    },
    {
      id: "ach_variety",
      name: "涉猎广贤",
      desc: "制作过 5 种不同款式的美味佳肴",
      target: 5,
      current: uniqueCount,
      icon: "🍱",
      color: "from-purple-400 to-indigo-500",
      unlocked: uniqueCount >= 5
    },
    {
      id: "ach_szechuan",
      name: "巴蜀百味",
      desc: "打卡烹制 3 顿又麻又辣的川味大餐",
      target: 3,
      current: szechuanCooked,
      icon: "🌶️",
      color: "from-red-600 to-orange-600",
      unlocked: szechuanCooked >= 3
    },
    {
      id: "ach_canton",
      name: "食在广东",
      desc: "打卡烹制 3 次鲜美养胃的广式靓菜",
      target: 3,
      current: cantoneseCooked,
      icon: "🐟",
      color: "from-cyan-400 to-teal-500",
      unlocked: cantoneseCooked >= 3
    },
    {
      id: "ach_custom",
      name: "自立门户",
      desc: "在数据库中手动新创 1 道专属菜谱",
      target: 1,
      current: customRecipesCount,
      icon: "✍️",
      color: "from-teal-400 to-emerald-500",
      unlocked: customRecipesCount >= 1
    },
    {
      id: "ach_favs",
      name: "珍馐集邮",
      desc: "收藏多达 8 个梦幻心动菜谱名单",
      target: 8,
      current: favorites.length,
      icon: "🌟",
      color: "from-yellow-400 to-amber-500",
      unlocked: favorites.length >= 8
    }
  ];

  const unlockedCount = achievements.filter(x => x.unlocked).length;

  // Handle Export to JSON file
  const handleExportBackup = () => {
    // Collect local states from parents indirectly
    const fullBackup = {
      localPrefix: "caipudaquan_v1",
      timestamp: new Date().toISOString(),
      favorites: favorites,
      history: history,
      customRecipesCount: customRecipesCount,
      customRecipes: JSON.parse(localStorage.getItem("recipe_custom_list") || "[]")
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `美食菜谱大全_备份数据_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchorElem.click();
  };

  // Handle Import from JSON file
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.favorites || parsed.history || parsed.customRecipes)) {
          onImportBackup(parsed);
          alert("🎉 备份数据导入恢复成功！您的收藏、做饭历史和自创菜谱已刷新。");
        } else {
          alert("格式不不合符，请确定上传的是菜谱大全导出导出的备份JSON文件。");
        }
      } catch (err) {
        alert("JSON解析错误，损坏的备份文件。");
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Achievements metrics banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Background visual graphics */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 select-none pointer-events-none">
          <Trophy className="w-80 h-80" />
        </div>

        <div className="space-y-3 z-10 text-center md:text-left">
          <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[11px] font-bold">
            👑 小当家大厨成长徽章体系
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">
            我的厨艺与成就徽章
          </h2>
          <p className="text-white/85 text-xs max-w-lg leading-relaxed">
            积累你在厨房里的每一次切磋与下锅体验。做菜能解压，打卡做记录！一共解锁了 <span className="font-extrabold text-white text-base underline">{unlockedCount}</span> 个勋章。
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center gap-4 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20 px-6 min-w-[200px] text-center z-10 justify-between">
          <div>
            <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">累计做饭打卡</div>
            <div className="text-3xl font-black mt-1">{totalCooks} 次</div>
          </div>
          <div className="w-px h-8 bg-white/20 md:w-full md:h-px md:my-2" />
          <div>
            <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">解锁成就徽勋率</div>
            <div className="text-lg font-bold mt-1">{unlockedCount} / {achievements.length} ({Math.round((unlockedCount / achievements.length) * 100)}%)</div>
          </div>
        </div>
      </div>

      {/* Main Grid: split achievements & cooking history logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Achievements dashboard (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-805">
            <div>
              <h3 className="font-bold text-lg text-slate-805 dark:text-white flex items-center gap-1.5">
                <Trophy className="w-5.5 h-5.5 text-amber-500 fill-amber-500" />
                勋章墙 探索进度
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">达成下列要求自动即刻拥有以下荣誉徽章</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const progressRatio = Math.min(ach.current / ach.target, 1);
              return (
                <div 
                  key={ach.id}
                  className={`p-4 rounded-2xl border flex gap-4 transition-all duration-250 relative overflow-hidden ${
                    ach.unlocked
                      ? "bg-gradient-to-br from-slate-50/20 to-slate-100/5 dark:from-slate-850 dark:to-slate-850 border-orange-200/50 dark:border-slate-800 shadow-sm"
                      : "bg-slate-50/20 dark:bg-slate-900/40 border-slate-100 dark:border-slate-850 opacity-60"
                  }`}
                >
                  {/* Badge Icon block */}
                  <div className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-md border ${
                    ach.unlocked 
                      ? `bg-gradient-to-br ${ach.color} text-white border-white/10` 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}>
                    {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-slate-400" />}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-1.5 flex flex-col justify-center">
                    <div>
                      <h4 className={`font-extrabold text-sm flex items-center gap-1 text-slate-800 dark:text-white ${
                        ach.unlocked ? "text-slate-900" : "text-slate-450"
                      }`}>
                        {ach.name}
                        {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-snug mt-0.5">{ach.desc}</p>
                    </div>

                    {/* Progress slider bar and numerical indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-medium text-slate-400">
                        <span>指标：{ach.current} / {ach.target}</span>
                        <span>{Math.round(progressRatio * 100)}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${ach.unlocked ? "from-orange-400 to-amber-500" : "from-slate-300 to-slate-400"}`}
                          style={{ width: `${progressRatio * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Cooking Log history & Backups Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* History log block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-805">
              <h3 className="font-bold text-sm text-slate-805 dark:text-white flex items-center gap-1.5">
                <CalendarDays className="w-5 h-5 text-orange-500" />
                下厨历史打卡记录
              </h3>

              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-500 hover:underline font-bold"
                >
                  清空列表
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs border border-dashed rounded-2xl space-y-1">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                <p className="font-semibold text-slate-500">尚无打卡打卡记录</p>
                <p className="text-[10px] text-slate-400">在任何一道菜谱页面，点击中下部的「制作完成，打卡」大按钮保存即可成长。</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.slice(0).reverse().map((record) => (
                  <div 
                    key={record.id}
                    className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/40 dark:bg-slate-855 flex justify-between items-center gap-3 transition hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-light text-xs line-clamp-1">{record.recipeName}</div>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-400 mt-1">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{record.date}</span>
                        <span>•</span>
                        <span>{record.servings} 人人份</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteHistoryItem(record.id)}
                      className="p-1.5 text-slate-350 hover:text-rose-500 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup / Export portal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-805 dark:text-white">💾 我的本地配置数据硬备份</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">将你的收藏、自撰菜谱、下厨经历导出到电脑/手机或恢复。</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={handleExportBackup}
                className="py-2 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> 导出备份
              </button>

              <button
                onClick={handleImportClick}
                className="py-2 px-3 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center gap-1.5 transition shadow"
              >
                <Upload className="w-3.5 h-3.5" /> 恢复备份
              </button>
            </div>

            {/* Hidden Input File tag */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
