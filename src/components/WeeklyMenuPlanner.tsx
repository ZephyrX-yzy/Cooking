import React, { useState } from "react";
import { WeeklyMenu, ShoppingItem, Recipe } from "../types";
import { 
  Calendar, ShoppingBag, Plus, Trash2, RefreshCw, CheckCircle2, ChevronRight,
  Info, Sparkles, PlusCircle, Check, Utensils, ClipboardList, Minus
} from "lucide-react";

interface WeeklyMenuPlannerProps {
  weeklyMenu: WeeklyMenu;
  onUpdateMenu: (updated: WeeklyMenu) => void;
  shoppingList: ShoppingItem[];
  onAddShoppingItem: (item: ShoppingItem) => void;
  onToggleShoppingPurchased: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onClearShoppingList: () => void;
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
}

export default function WeeklyMenuPlanner({
  weeklyMenu,
  onUpdateMenu,
  shoppingList,
  onAddShoppingItem,
  onToggleShoppingPurchased,
  onDeleteShoppingItem,
  onClearShoppingList,
  recipes,
  onOpenRecipe
}: WeeklyMenuPlannerProps) {
  const daysOfWeek: { key: keyof WeeklyMenu; label: string }[] = [
    { key: "Monday", label: "周一" },
    { key: "Tuesday", label: "周二" },
    { key: "Wednesday", label: "周三" },
    { key: "Thursday", label: "周四" },
    { key: "Friday", label: "周五" },
    { key: "Saturday", label: "周六" },
    { key: "Sunday", label: "周日" }
  ];

  const [activeDay, setActiveDay] = useState<keyof WeeklyMenu>("Monday");
  const [showAddDishSelector, setShowAddDishSelector] = useState(false);
  const [customShoppingName, setCustomShoppingName] = useState("");
  const [customShoppingAmount, setCustomShoppingAmount] = useState(1);
  const [customShoppingUnit, setCustomShoppingUnit] = useState("个");

  // Auto Randomize entire week (fills each day with 1-2 delicious distinct recipes)
  const handleRandomizeWeek = () => {
    if (recipes.length === 0) return;
    const updatedMenu: WeeklyMenu = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };

    // Shuffle and pick
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    let rIdx = 0;

    daysOfWeek.forEach((day, dIdx) => {
      // Pick 2 random recipes for each day
      const r1 = shuffled[rIdx % shuffled.length];
      const r2 = shuffled[(rIdx + 1) % shuffled.length];
      updatedMenu[day.key] = [r1.id, r2.id];
      rIdx += 2;
    });

    onUpdateMenu(updatedMenu);
  };

  // Remove specific dish from specific day
  const handleRemoveDish = (dayKey: keyof WeeklyMenu, recipeId: string) => {
    const updatedDayList = weeklyMenu[dayKey].filter(id => id !== recipeId);
    const updatedMenu = { ...weeklyMenu, [dayKey]: updatedDayList };
    onUpdateMenu(updatedMenu);
  };

  // Add specific dish to active day
  const handleAddDishToDay = (recipeId: string) => {
    // Prevent duplicate dishes on the same day
    if (weeklyMenu[activeDay].includes(recipeId)) {
      setShowAddDishSelector(false);
      return;
    }
    const updatedMenu = {
      ...weeklyMenu,
      [activeDay]: [...weeklyMenu[activeDay], recipeId]
    };
    onUpdateMenu(updatedMenu);
    setShowAddDishSelector(false);
  };

  // AI/Smart Aggregation: compile ingredients from ALL days of the weekly plan
  // Group duplicate ingredients and combine the sum of their weight/amount value
  const handleGenerateShoppingAggregation = () => {
    // 1. Gather all recipe ids in the active menu
    const activeRecipeIds: string[] = [];
    daysOfWeek.forEach(day => {
      weeklyMenu[day.key].forEach(id => {
        if (!activeRecipeIds.includes(id)) {
          activeRecipeIds.push(id);
        }
      });
    });

    if (activeRecipeIds.length === 0) {
      alert("请至少在周计划菜单中选定一个菜品。");
      return;
    }

    // 2. Loop ingredients and map/aggregate
    const mapAggregated: { [key: string]: { amount: number; unit: string; recipeSources: string[] } } = {};

    activeRecipeIds.forEach(id => {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          // Normalize names
          const key = ing.name.trim();
          if (mapAggregated[key]) {
            mapAggregated[key].amount += ing.amount; // default values are for 2 servings
            if (!mapAggregated[key].recipeSources.includes(recipe.name)) {
              mapAggregated[key].recipeSources.push(recipe.name);
            }
          } else {
            mapAggregated[key] = {
              amount: ing.amount,
              unit: ing.unit,
              recipeSources: [recipe.name]
            };
          }
        });
      }
    });

    // 3. Clear existing list and insert
    onClearShoppingList();
    Object.keys(mapAggregated).forEach((key, idx) => {
      const spec = mapAggregated[key];
      const newItem: ShoppingItem = {
        id: `shop_agg_${idx}_${Date.now()}`,
        name: key,
        amount: Number(spec.amount.toFixed(1)),
        unit: spec.unit,
        purchased: false,
        recipeSource: spec.recipeSources.join(", ")
      };
      onAddShoppingItem(newItem);
    });
  };

  const handleAddManualShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customShoppingName.trim()) return;

    const item: ShoppingItem = {
      id: `shop_man_${Date.now()}`,
      name: customShoppingName.trim(),
      amount: Number(customShoppingAmount) || 1,
      unit: customShoppingUnit.trim() || "个",
      purchased: false,
      recipeSource: "手动添加"
    };

    onAddShoppingItem(item);
    setCustomShoppingName("");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Page header desc */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-6.5 h-6.5 text-orange-500" />
            每周菜单规划与智能购物清单汇整
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            提前规划7天的健康每日配餐。系统自动融合关联食材，一键生成无忧采购清单。
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleRandomizeWeek}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-bold bg-orange-50 dark:bg-orange-950/45 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/80 rounded-xl flex items-center justify-center gap-1.5 transition border border-orange-200/40"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            一键智能生成周菜单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: 7-day Menu Calendar Scheduler (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          
          {/* Day selectors tab strip */}
          <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin">
            {daysOfWeek.map((day) => {
              const isActive = activeDay === day.key;
              const count = weeklyMenu[day.key].length;
              return (
                <button
                  key={day.key}
                  onClick={() => {
                    setActiveDay(day.key);
                    setShowAddDishSelector(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-center text-xs font-extrabold flex-1 min-w-[55px] transition-all ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white scale-105"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <div>{day.label}</div>
                  {count > 0 && (
                    <span className="inline-block mt-0.5 text-[9px] bg-orange-500 text-white dark:bg-white dark:text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full">
                      {count} 道
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active schedule display */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-850 p-3 rounded-2xl border border-slate-150">
              <span className="text-xs font-bold text-slate-705 dark:text-slate-300">
                📌 {daysOfWeek.find(x => x.key === activeDay)?.label}的配餐安排
              </span>
              <button
                onClick={() => setShowAddDishSelector(!showAddDishSelector)}
                className="px-2.5 py-1 text-[11px] font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> 加道菜色
              </button>
            </div>

            {/* Popup inline list for choosing recipes */}
            {showAddDishSelector && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-850 max-h-56 overflow-y-auto space-y-2">
                <div className="flex justify-between items-center border-b pb-2 mb-2 text-xs font-bold text-slate-400">
                  <span>选择要加入的菜谱：</span>
                  <button onClick={() => setShowAddDishSelector(false)} className="text-slate-400 hover:text-slate-600">关闭</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddDishToDay(recipe.id)}
                      className="text-left p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl flex items-center space-x-2 text-xs hover:shadow-xs transition"
                    >
                      <span>{recipe.imageEmoji}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-305 truncate">{recipe.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List current scheduled recipes */}
            {weeklyMenu[activeDay].length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-150 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                该天暂未安排菜品。点击右上角“加道菜色”或“一键生成周菜单”。
              </div>
            ) : (
              <div className="space-y-2.5">
                {weeklyMenu[activeDay].map(id => {
                  const recipe = recipes.find(r => r.id === id);
                  if (!recipe) return null;
                  return (
                    <div 
                      key={id}
                      className="border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-855 hover:bg-white dark:hover:bg-slate-850 transition-all duration-200 group"
                    >
                      <button
                        onClick={() => onOpenRecipe(recipe)}
                        className="flex-1 flex items-center space-x-3 text-left"
                      >
                        <span className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                          {recipe.imageEmoji}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-orange-500 transition line-clamp-1">
                            {recipe.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{recipe.category} • {recipe.time}分钟 • {recipe.difficulty}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRemoveDish(activeDay, id)}
                        className="p-1.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right column: Consolidated Shopping checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-855">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-5.5 h-5.5 text-orange-500" />
              <h3 className="font-bold text-base text-slate-805 dark:text-white">智能买菜购物清单</h3>
            </div>
            
            <button
              onClick={handleGenerateShoppingAggregation}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              重新分析提取食材
            </button>
          </div>

          {/* Add custom extra shopping item */}
          <form onSubmit={handleAddManualShopping} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 text-xs">
            <input
              type="text"
              value={customShoppingName}
              onChange={(e) => setCustomShoppingName(e.target.value)}
              placeholder="加备忘项 (如：洗洁精)"
              className="col-span-6 px-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
            />
            <input
              type="number"
              min={1}
              value={customShoppingAmount}
              onChange={(e) => setCustomShoppingAmount(Number(e.target.value))}
              placeholder="数"
              className="col-span-2 px-1 focus:outline-none text-center bg-white dark:bg-slate-801 border rounded-lg text-xs"
            />
            <input
              type="text"
              value={customShoppingUnit}
              onChange={(e) => setCustomShoppingUnit(e.target.value)}
              placeholder="支"
              className="col-span-2 px-1 focus:outline-none text-center bg-white dark:bg-slate-801 border rounded-lg text-xs"
            />
            <button
              type="submit"
              className="col-span-2 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg flex items-center justify-center font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Checklist list */}
          {shoppingList.length === 0 ? (
            <div className="py-16 text-center text-slate-450 text-xs border border-dashed rounded-2xl px-4 space-y-2 select-none">
              <ClipboardList className="w-10 h-10 stroke-slate-300 mx-auto" />
              <p className="font-semibold text-slate-500">尚无购物清单清单</p>
              <p className="text-[10px]/normal text-slate-400">安排完周计划配餐后，点击上方「一键提取食材」汇总需要买什么原材料吧！</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-2 px-1">
                <span>食材买菜清单 ({shoppingList.filter(x => x.purchased).length} / {shoppingList.length} 已备齐)</span>
                <button 
                  onClick={onClearShoppingList}
                  className="text-rose-500 hover:underline"
                >
                  清空清单
                </button>
              </div>

              <div className="space-y-1.5">
                {shoppingList.map((item) => {
                  return (
                    <div 
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        item.purchased 
                          ? "bg-emerald-50/30 dark:bg-emerald-950/5 border-emerald-100" 
                          : "bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-805"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleShoppingPurchased(item.id)}
                        className="flex-1 flex items-start gap-2.5 text-left"
                      >
                        <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                          item.purchased 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-slate-300 dark:border-slate-700 bg-slate-50"
                        }`}>
                          {item.purchased && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                        </div>

                        <div className="leading-tight">
                          <span className={`text-xs font-bold text-slate-700 dark:text-white transition-all ${
                            item.purchased ? "line-through text-slate-400 dark:text-slate-500" : ""
                          }`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                            ({item.amount} {item.unit})
                          </span>
                          {item.recipeSource && (
                            <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[200px]" title={item.recipeSource}>
                              源自：{item.recipeSource}
                            </p>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => onDeleteShoppingItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
