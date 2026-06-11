import React, { useState } from "react";
import { Recipe, CookingRecord } from "../types";
import { 
  X, Star, Clock, Flame, ShieldAlert, Check, ChevronLeft, ChevronRight, 
  Printer, Play, Edit, Trash2, Award, Calendar, Users, SquareCheck, RefreshCw, FileCode
} from "lucide-react";

interface RecipeDetailProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onCookCheckIn: (record: CookingRecord) => void;
  historyCount: number;
}

export default function RecipeDetail({
  recipe,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onClose,
  onCookCheckIn,
  historyCount
}: RecipeDetailProps) {
  const [servings, setServings] = useState(2); // default 2 servings
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Portion Scaling Factor (all recipes are authored for 2 portions)
  const scalingFactor = servings / 2;

  const handleNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleCheckIn = () => {
    const newRecord: CookingRecord = {
      id: `cook_${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      date: new Date().toISOString().split("T")[0],
      servings: servings
    };
    onCookCheckIn(newRecord);
    setIsCheckedIn(true);
    setTimeout(() => {
      setIsCheckedIn(false);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract ingredients that match what's near or in steps (for cooking mode if helpful)
  // But a simple, gorgeous clean screen is best.

  if (isPrintMode) {
    return (
      <div className="bg-white text-slate-900 p-8 max-w-2xl mx-auto rounded-3xl shadow-xl border border-slate-250 relative print:shadow-none print:border-none print:p-0 my-4">
        {/* Back control */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 print:hidden">
          <button 
            onClick={() => setIsPrintMode(false)}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> 返回详情
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-lg flex items-center gap-1 transition shadow"
          >
            <Printer className="w-4 h-4" /> 打印该菜谱
          </button>
        </div>

        {/* Real Print Template */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{recipe.imageEmoji}</div>
          <h1 className="text-3xl font-bold tracking-tight">{recipe.name}</h1>
          <p className="text-slate-500 mt-2 italic text-sm">{recipe.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y py-4 mb-6 text-sm text-slate-700">
          <div>
            <span className="font-bold">所属分类：</span>{recipe.category}
          </div>
          <div>
            <span className="font-bold">烹饪硬度：</span>{recipe.difficulty}
          </div>
          <div>
            <span className="font-bold">制作时间：</span>{recipe.time} 分钟
          </div>
          <div>
            <span className="font-bold">热量估算：</span>{recipe.calories} kcal/两份
          </div>
          <div>
            <span className="font-bold">食材份数：</span>{servings} 人份 (已按比例换算)
          </div>
          <div>
            <span className="font-bold">成本售价：</span>约 {Math.round(recipe.budgetCost * scalingFactor)} 元
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold border-b pb-2 mb-3">📋 所需食材清单</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between pr-4 odd:border-r border-slate-100">
                <span className="font-medium text-slate-800">{ing.name}</span>
                <span className="text-slate-550">
                  {ing.amount ? (Number((ing.amount * scalingFactor).toFixed(1))) : ""} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold border-b pb-2 mb-3">👩‍🍳 烹饪制作步骤</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-650">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-700 mt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-xs text-slate-400">
          打印自：菜谱大全App (离线美食指南) • 时间：{new Date().toLocaleDateString("zh-CN")}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative my-8 min-h-[500px]">
        
        {/* Top visual banner */}
        <div className={`p-8 md:p-12 bg-gradient-to-br ${recipe.colorBg} relative text-white flex flex-col md:flex-row items-center justify-between gap-6`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/25 dark:bg-slate-800/40 hover:bg-black/35 text-white dark:text-white rounded-full transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">{recipe.category}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">{recipe.difficulty}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">{recipe.name}</h1>
            <p className="text-white/85 text-sm md:text-base max-w-xl leading-relaxed">{recipe.description}</p>
            
            {/* Quick action shortcuts */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => setIsCookingMode(true)}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-orange-50 font-bold text-sm rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
                入大字烹饪模式
              </button>

              <button
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-xl border backdrop-blur flex items-center gap-1.5 font-semibold text-sm transition ${
                  isFavorite 
                    ? "bg-amber-400 border-amber-400 text-slate-900" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? "fill-slate-900" : ""}`} />
                {isFavorite ? "已收藏" : "加收藏"}
              </button>

              <button 
                onClick={() => setIsPrintMode(true)}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl flex items-center gap-1.5 text-sm font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                打印/导出
              </button>
            </div>
          </div>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center text-7xl md:text-8xl shadow-inner select-none transition hover:scale-105 duration-300">
            {recipe.imageEmoji}
          </div>
        </div>

        {/* Cooking mode Overlay */}
        {isCookingMode && (
          <div className="absolute inset-0 bg-slate-950 text-white flex flex-col z-50 p-6 md:p-12 animate-fade-in justify-between">
            {/* Top exit row */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{recipe.imageEmoji}</span>
                <div>
                  <h3 className="font-bold text-lg md:text-xl text-slate-150">{recipe.name}</h3>
                  <p className="text-xs text-orange-400">大字烹饪模式 · 安全看步骤</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCookingMode(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-1"
              >
                退出引导
              </button>
            </div>

            {/* Step Content */}
            <div className="my-auto max-w-3xl mx-auto space-y-6 md:space-y-8 py-8">
              <div className="flex items-center justify-center space-x-3">
                <span className="px-5 py-2 bg-orange-500 rounded-full text-base font-extrabold tracking-widest text-white shadow shadow-orange-500/50">
                  步骤 {currentStepIndex + 1} / {recipe.steps.length}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-snug md:leading-normal text-center text-slate-100 tracking-wide select-none p-4 bg-slate-900/50 rounded-3xl border border-slate-850 shadow-inner">
                {recipe.steps[currentStepIndex]}
              </h2>
            </div>

            {/* Bottom Navigation */}
            <div className="space-y-6 border-t border-slate-850 pt-6">
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-20 disabled:hover:bg-slate-900 rounded-2xl flex items-center gap-2 font-bold transition flex-1 justify-center border border-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" /> 上一步
                </button>
                {currentStepIndex === recipe.steps.length - 1 ? (
                  <button
                    onClick={() => {
                      handleCheckIn();
                      setIsCookingMode(false);
                    }}
                    className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl flex items-center gap-2 font-bold transition flex-1 justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-5 h-5" /> 烹饪完成，打卡！
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl flex items-center gap-2 font-bold transition flex-1 justify-center shadow-lg shadow-orange-500/30"
                  >
                    下一步 <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-50/50 dark:bg-slate-900">
          
          {/* Left panel: Info & Ingredients (7 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-orange-500 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">美味时间</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{recipe.time} 分钟</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-855 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-orange-500 rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">卡路里</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{recipe.calories} kcal</div>
                </div>
              </div>
            </div>

            {/* Scaler controller */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">智能份量比例缩放</h3>
                </div>
                <span className="text-xs bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-md">
                  {servings} 人份
                </span>
              </div>
              <p className="text-xs text-slate-400">滑动滑块，配料分量和预估成本将自动自动换算计算。</p>
              
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-400">1人</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="flex-1 accent-orange-500 h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-400">10人</span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1.5 text-slate-500 border-t border-slate-100 dark:border-slate-800">
                <span>估计成成本：</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">
                  约 {Math.round(recipe.budgetCost * scalingFactor)} 元
                </span>
              </div>
            </div>

            {/* Ingredients component */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>📋 配料原料清单</span>
                <span className="text-[11px] font-normal text-slate-400">按两份标准 x {scalingFactor.toFixed(1)}</span>
              </h3>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-300">
                    <span className="font-medium hover:text-orange-500 transition">{ing.name}</span>
                    <span className="font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-450">
                      {ing.amount ? Number((ing.amount * scalingFactor).toFixed(1)) : ""} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right panel: Steps & Controls (5 cols) */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Steps panel */}
            <div className="bg-white dark:bg-slate-850 p-5 md:p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>👩‍🍳 烹饪详尽步骤步骤</span>
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full font-semibold">
                  共 {recipe.steps.length} 步
                </span>
              </h3>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {recipe.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 group">
                    <span className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] flex items-center justify-center group-hover:scale-110 transition">
                      {idx + 1}
                    </span>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 mt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in controls */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-850 dark:to-orange-950/15 p-5 rounded-2xl border border-amber-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">做饭打卡系统</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    这道菜你已做过 <span className="font-bold text-orange-500">{historyCount}</span> 次。做饭打卡累积经验！
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className={`w-full sm:w-auto px-5 py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm ${
                  isCheckedIn 
                    ? "bg-emerald-500 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {isCheckedIn ? (
                  <>
                    <Check className="w-4 h-4" />
                    已打卡成功 +1
                  </>
                ) : (
                  <>
                    <SquareCheck className="w-4 h-4" />
                    制作完成 马上打卡
                  </>
                )}
              </button>
            </div>

            {/* Custom Recipe Controls (only if isBuiltIn === false) */}
            {!recipe.isBuiltIn && (
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={onEdit}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                >
                  <Edit className="w-4 h-4" />
                  编辑我的菜谱
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  删除菜谱数据
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
