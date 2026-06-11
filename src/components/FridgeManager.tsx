import React, { useState } from "react";
import { FridgeItem, Recipe } from "../types";
import { 
  Plus, Trash2, ShieldAlert, Sparkles, AlertCircle, Calendar, PlusCircle, CheckCircle2,
  Utensils, Info, ToggleLeft, HelpCircle, Package, Layers
} from "lucide-react";

interface FridgeManagerProps {
  fridgeItems: FridgeItem[];
  onAddFridgeItem: (item: FridgeItem) => void;
  onDeleteFridgeItem: (id: string) => void;
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
}

export default function FridgeManager({
  fridgeItems,
  onAddFridgeItem,
  onDeleteFridgeItem,
  recipes,
  onOpenRecipe
}: FridgeManagerProps) {
  // Add item form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState(200);
  const [newItemUnit, setNewItemUnit] = useState("克");
  const [newItemExpiry, setNewItemExpiry] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // default 5 days from now
  );

  // Filter or selection state for Reverse Search
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [customSearchTagList, setCustomSearchTagList] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    const item: FridgeItem = {
      id: `fridge_${Date.now()}`,
      name: newItemName.trim(),
      amount: Number(newItemAmount) || 1,
      unit: newItemUnit.trim() || "克",
      expiryDate: newItemExpiry,
      purchaseDate: new Date().toISOString().split("T")[0]
    };
    onAddFridgeItem(item);
    setNewItemName("");
  };

  const getDaysRemaining = (expiryStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleSelectIngredient = (id: string) => {
    if (selectedIngredientIds.includes(id)) {
      setSelectedIngredientIds(selectedIngredientIds.filter(x => x !== id));
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, id]);
    }
  };

  // Perform Reverse Matching
  // First, compile the active ingredient search terms (from picked fridge items + entered custom tokens)
  const getActiveSearchTerms = (): string[] => {
    const terms: string[] = [];
    
    // Add names of selected fridge items
    fridgeItems.forEach(item => {
      if (selectedIngredientIds.includes(item.id)) {
        terms.push(item.name.toLowerCase().trim());
      }
    });

    // Add any manually entered comma-separated words
    if (customSearchTagList.trim()) {
      customSearchTagList.split(/[,，；;、\s]+/).forEach(tok => {
        const cleaned = tok.trim().toLowerCase();
        if (cleaned && !terms.includes(cleaned)) {
          terms.push(cleaned);
        }
      });
    }

    return terms;
  };

  const searchTerms = getActiveSearchTerms();

  // Find recipes matching these search terms
  // Rank by match count/percentage
  const matchedRecipes = searchTerms.length === 0 ? [] : recipes.map(recipe => {
    let matchedCount = 0;
    const matchedNames: string[] = [];
    
    recipe.ingredients.forEach(ing => {
      const ingNameLower = ing.name.toLowerCase();
      // check if any of our input terms fits this ingredient name (e.g. "肉" fits "猪五花肉", "生五花肉")
      const matches = searchTerms.some(term => ingNameLower.includes(term) || term.includes(ingNameLower));
      if (matches) {
        matchedCount++;
        matchedNames.push(ing.name);
      }
    });

    const totalCount = recipe.ingredients.length;
    const matchRatio = matchedCount / totalCount;

    return {
      recipe,
      matchedCount,
      matchedNames,
      totalCount,
      matchRatio
    };
  })
  .filter(item => item.matchedCount > 0)
  .sort((a, b) => {
    // Rank primary by higher match count, secondary by matching ratio
    if (b.matchedCount !== a.matchedCount) {
      return b.matchedCount - a.matchedCount;
    }
    return b.matchRatio - a.matchRatio;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Expiry alerts list top banner */}
      {fridgeItems.some(x => getDaysRemaining(x.expiryDate) <= 1) && (
        <div className="bg-rose-50 dark:bg-rose-955 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-start space-x-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 animate-bounce" />
          <div>
            <h4 className="font-bold text-sm">库存食材过期警报！</h4>
            <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-1">
              冰箱中有食材已经过期或将在24小时内到期。建议尽快加工利用，可以在下方点击它们反查适合的菜谱！
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Fridge Inventory Management (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-500" />
                  智能食材保质期管理
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">录入你的生鲜干货库存，精确监控新鲜度</p>
              </div>
              
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 rounded-full">
                共存 {fridgeItems.length} 款食材
              </span>
            </div>

            {/* Form to insert item */}
            <form onSubmit={handleAddItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">食材名</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="例如：鸡蛋"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">重量/数量</label>
                <input
                  type="number"
                  min={1}
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">单位</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="克/个"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">保质到期日</label>
                <input
                  type="date"
                  value={newItemExpiry}
                  onChange={(e) => setNewItemExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="col-span-2 sm:col-span-4 mt-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
              >
                <PlusCircle className="w-4 h-4" /> 采购录入冰箱
              </button>
            </form>

            {/* Inventory Grid List */}
            {fridgeItems.length === 0 ? (
              <div className="py-16 text-center text-slate-450 space-y-2 select-none">
                <Layers className="w-12 h-12 stroke-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">冰箱现在空空如也噢</p>
                <p className="text-xs">添加你的常用作料，点击它一键勾选反查菜谱！</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {fridgeItems.map(item => {
                  const days = getDaysRemaining(item.expiryDate);
                  const isSelected = selectedIngredientIds.includes(item.id);
                  
                  // Style based on remaining days
                  let statColor, labelText;
                  if (days < 0) {
                    statColor = "border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-600";
                    labelText = `已过期 ${Math.abs(days)} 天`;
                  } else if (days === 0) {
                    statColor = "border-red-300 bg-red-50 dark:bg-red-950/30 text-red-650";
                    labelText = "今天到期！";
                  } else if (days <= 2) {
                    statColor = "border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-600";
                    labelText = `剩 ${days} 天过期`;
                  } else {
                    statColor = "border-emerald-100 bg-emerald-50/60 dark:bg-emerald-950/15 text-emerald-600";
                    labelText = `剩 ${days} 天过期`;
                  }

                  return (
                    <div 
                      key={item.id}
                      className={`border p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 group ${
                        isSelected 
                          ? "border-orange-400 bg-orange-50/20 dark:bg-orange-950/10 shadow-sm" 
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850"
                      }`}
                    >
                      {/* Check toggler for matching */}
                      <button 
                        type="button"
                        onClick={() => toggleSelectIngredient(item.id)}
                        className="flex-1 flex items-start gap-3.5 text-left"
                      >
                        <div className={`w-5 h-5 mt-1 rounded-md border flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-orange-500 border-orange-500 text-white" 
                            : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3.5px]" />}
                        </div>

                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                            {item.name}
                            <span className="text-xs font-mono text-slate-400 font-normal">({item.amount}{item.unit})</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3 text-slate-350" /> 购入日: {item.purchaseDate}
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center space-x-3.5">
                        <span className={`text-[10px] py-1 px-2.5 rounded-full border font-bold ${statColor}`}>
                          {labelText}
                        </span>
                        <button
                          onClick={() => onDeleteFridgeItem(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-[11px] text-slate-405 flex items-center gap-1 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>说明：勾选上方的食材，或在右边输入更多食材词组，程序会自动交叉比对100+款内置大厨菜谱，给出最契合的食谱推荐。</span>
            </div>

          </div>
        </div>

        {/* Right Side: Ingredient Match results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                剩余食材智能反向搜菜谱
              </h3>
              <p className="text-xs text-slate-500 mt-1">查一查冰箱里剩余的食材，最适合烹饪什么菜肴？</p>
            </div>

            {/* Manual Custom Ingredient Tags Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-550 uppercase mb-1.5">
                其他手输食材标签 (空格、逗号分隔)
              </label>
              <input
                type="text"
                value={customSearchTagList}
                onChange={(e) => setCustomSearchTagList(e.target.value)}
                placeholder="例如：番茄 鸡蛋 五花肉"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            {/* Current Active Search query words overview */}
            {searchTerms.length > 0 && (
              <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl text-xs">
                <span className="text-slate-400 pt-0.5 mr-1 font-semibold">检索词：</span>
                {searchTerms.map((term, i) => (
                  <span key={i} className="bg-orange-100 dark:bg-orange-950/50 text-orange-750 dark:text-orange-400 px-2 py-0.5 rounded text-[11px] font-bold">
                    {term}
                  </span>
                ))}
              </div>
            )}

            {/* Double Check matching products */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                🔍 智能匹配推荐如下 ({matchedRecipes.length} 款)
              </h4>

              {searchTerms.length === 0 ? (
                <div className="py-12 border border-dashed rounded-2xl text-center text-slate-400 text-xs">
                  请勾选左侧冰箱食材或在上方手动输入，马上反向搜寻菜谱！
                </div>
              ) : matchedRecipes.length === 0 ? (
                <div className="py-12 bg-slate-50 dark:bg-slate-850 rounded-2xl text-center text-slate-500 text-xs space-y-1">
                  <ShieldAlert className="w-8 h-8 text-slate-350 mx-auto" />
                  <p className="font-semibold">未匹配到合适食谱</p>
                  <p className="text-[10px] text-slate-400">试试减少过滤项或更换食材词组</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {matchedRecipes.map(({ recipe, matchedCount, matchedNames, totalCount, matchRatio }) => (
                    <button
                      key={recipe.id}
                      onClick={() => onOpenRecipe(recipe)}
                      className="w-full border border-slate-100 dark:border-slate-850 hover:border-orange-200 p-3.5 rounded-2xl text-left bg-slate-50/50 dark:bg-slate-855 hover:bg-white dark:hover:bg-slate-850 transition flex items-center justify-between gap-4 group"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{recipe.imageEmoji}</span>
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-orange-500 transition line-clamp-1">
                              {recipe.name}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">{recipe.category} • {recipe.time}分钟</p>
                          </div>
                        </div>

                        {/* Matching rating progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-orange-600 dark:text-orange-400 font-bold">
                              匹配 {matchedCount} / {totalCount} 种食材
                            </span>
                            <span className="font-medium text-slate-400">{Math.round(matchRatio * 100)}% 契合度</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
                              style={{ width: `${matchRatio * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Matched details */}
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">含有：</span>
                          {matchedNames.join("、")}
                        </p>
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-800 group-hover:bg-orange-500 group-hover:text-white text-slate-450 border border-slate-100 dark:border-slate-750 group-hover:border-orange-500 rounded-xl transition shadow-xs flex-shrink-0">
                        <Utensils className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
