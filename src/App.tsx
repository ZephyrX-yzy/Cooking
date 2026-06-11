import React, { useState, useEffect, useMemo } from "react";
import { Recipe, FridgeItem, CookingRecord, WeeklyMenu, ShoppingItem } from "./types";
import { BUILTIN_RECIPES } from "./data/recipes";
import RecipeForm from "./components/RecipeForm";
import RecipeDetail from "./components/RecipeDetail";
import Wheel from "./components/Wheel";
import FridgeManager from "./components/FridgeManager";
import WeeklyMenuPlanner from "./components/WeeklyMenuPlanner";
import AchievementsGrid from "./components/AchievementsGrid";
import { 
  Compass, ChefHat, Search, SlidersHorizontal, Sun, Moon, Heart, Sliders, Sparkles, Plus,
  Database, RefreshCw, Star, Clock, Flame, Coins, Calendar, Trophy, List, History
} from "lucide-react";

export default function App() {
  // Outermost UI Tabs state: 'market' | 'fridge' | 'menu' | 'wheel' | 'chef'
  const [currentTab, setCurrentTab] = useState<"market" | "fridge" | "menu" | "wheel" | "chef">("market");
  
  // Theme state (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("recipe_dark_mode") === "true";
  });

  // Master Lists loaded from localStorage
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_custom_list") || "[]");
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_favorites_v1") || "[]");
  });

  const [history, setHistory] = useState<CookingRecord[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_history_v1") || "[]");
  });

  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_fridge_items") || "[]");
  });

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const saved = localStorage.getItem("recipe_weekly_menu");
    if (saved) return JSON.parse(saved);
    return {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_shopping_list") || "[]");
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("recipe_recent_views") || "[]");
  });

  // Editing / Detail Overlays State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showCreateOrEditForm, setShowCreateOrEditForm] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  // Search & Filtering core state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [activeDifficulty, setActiveDifficulty] = useState<"全部" | "简单" | "中等" | "困难">("全部");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filterMaxTime, setFilterMaxTime] = useState<number>(90); // minutes
  const [filterMaxCalories, setFilterMaxCalories] = useState<number>(800); // kcal
  const [filterOnlyShowFavorites, setFilterOnlyShowFavorites] = useState(false);
  const [filterOnlyShowCustom, setFilterOnlyShowCustom] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "time_asc" | "cost_asc" | "cal_asc">("default");

  // Sync state modifications directly to localStorage
  useEffect(() => {
    localStorage.setItem("recipe_custom_list", JSON.stringify(customRecipes));
  }, [customRecipes]);

  useEffect(() => {
    localStorage.setItem("recipe_favorites_v1", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("recipe_history_v1", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("recipe_fridge_items", JSON.stringify(fridgeItems));
  }, [fridgeItems]);

  useEffect(() => {
    localStorage.setItem("recipe_weekly_menu", JSON.stringify(weeklyMenu));
  }, [weeklyMenu]);

  useEffect(() => {
    localStorage.setItem("recipe_shopping_list", JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem("recipe_recent_views", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("recipe_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  // Combine built-in + self-made recipes
  const allRecipes = useMemo(() => {
    return [...BUILTIN_RECIPES, ...customRecipes];
  }, [customRecipes]);

  // Unified list of categories available in databases
  const categories = useMemo(() => {
    return [
      "全部",
      "川菜",
      "粤菜",
      "湘菜",
      "江南菜",
      "东北菜",
      "西北菜",
      "西餐",
      "日韩料理",
      "东南亚菜",
      "烘焙甜品",
      "潮流饮品",
      "家常素菜"
    ];
  }, []);

  // Today's choice (seeded chosen recipe consistently changing daily based on Epoch day)
  const todaysChoiceRecipe = useMemo(() => {
    if (BUILTIN_RECIPES.length === 0) return null;
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const fixedIndex = daysSinceEpoch % BUILTIN_RECIPES.length;
    return BUILTIN_RECIPES[fixedIndex];
  }, []);

  // Smart Recommendations Engine
  const smartRecommendations = useMemo(() => {
    // 1. Gather historical favorite categories
    const categoryCounts: { [key: string]: number } = {};
    history.forEach(log => {
      const matchR = allRecipes.find(r => r.id === log.recipeId);
      if (matchR) {
        categoryCounts[matchR.category] = (categoryCounts[matchR.category] || 0) + 1;
      }
    });
    
    // Sort to find favorite category name
    let favoriteCuisine = "";
    let maxCount = 0;
    Object.keys(categoryCounts).forEach((key) => {
      if (categoryCounts[key] > maxCount) {
        maxCount = categoryCounts[key];
        favoriteCuisine = key;
      }
    });

    // 2. Score candidates that user has NOT cooked or views
    const suggestions = allRecipes
      .map(recipe => {
        let score = 0;
        
        // Favorite cuisine matches +10
        if (recipe.category === favoriteCuisine) score += 10;
        
        // Match with things in direct fridge +5 each
        recipe.ingredients.forEach(ing => {
          const matchingInFridge = fridgeItems.some(f => f.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(f.name.toLowerCase()));
          if (matchingInFridge) score += 5;
        });

        // Newly added custom items gets bonus +3
        if (!recipe.isBuiltIn) score += 4;

        // Is favorited +2
        if (favorites.includes(recipe.id)) score += 2;

        return { recipe, score };
      })
      .filter(item => item.score > 2 && !history.some(h => h.recipeId === item.recipe.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.recipe);

    // Fallback if score criteria is empty: select 3 gorgeous high rated dishes
    if (suggestions.length < 3) {
      const remainingNeeded = 3 - suggestions.length;
      allRecipes.forEach(r => {
        if (suggestions.length < 3 && !suggestions.some(ex => ex.id === r.id)) {
          suggestions.push(r);
        }
      });
    }

    return suggestions;
  }, [allRecipes, history, favorites, fridgeItems]);

  // Filter & Sort recipe list
  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...allRecipes];

    // Live search match (on name, ingredient, description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(recipe => {
        return (
          recipe.name.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.ingredients.some(i => i.name.toLowerCase().includes(query))
        );
      });
    }

    // Category Filter
    if (activeCategory !== "全部") {
      result = result.filter(recipe => recipe.category === activeCategory);
    }

    // Difficulty filter
    if (activeDifficulty !== "全部") {
      result = result.filter(recipe => recipe.difficulty === activeDifficulty);
    }

    // Sliders filter
    result = result.filter(recipe => {
      const matchesTime = recipe.time <= filterMaxTime;
      const matchesCalories = recipe.calories <= filterMaxCalories;
      return matchesTime && matchesCalories;
    });

    // Favorites checkbox
    if (filterOnlyShowFavorites) {
      result = result.filter(recipe => favorites.includes(recipe.id));
    }

    // Custom creations checkbox
    if (filterOnlyShowCustom) {
      result = result.filter(recipe => !recipe.isBuiltIn);
    }

    // Sorting block
    if (sortBy === "time_asc") {
      result.sort((a, b) => a.time - b.time);
    } else if (sortBy === "cost_asc") {
      result.sort((a, b) => a.budgetCost - b.budgetCost);
    } else if (sortBy === "cal_asc") {
      result.sort((a, b) => a.calories - b.calories);
    }

    return result;
  }, [allRecipes, searchQuery, activeCategory, activeDifficulty, filterMaxTime, filterMaxCalories, filterOnlyShowFavorites, filterOnlyShowCustom, sortBy, favorites]);

  // State handlers & mutators
  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(x => x !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleOpenRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    // Add to recently viewed without repeats, capping at 8 entries
    const updatedRecent = [recipe.id, ...recentlyViewed.filter(x => x !== recipe.id)].slice(0, 8);
    setRecentlyViewed(updatedRecent);
  };

  const handleCookCheckIn = (record: CookingRecord) => {
    setHistory([...history, record]);
  };

  const handleAddFridgeItem = (item: FridgeItem) => {
    setFridgeItems([...fridgeItems, item]);
  };

  const handleDeleteFridgeItem = (id: string) => {
    setFridgeItems(fridgeItems.filter(x => x.id !== id));
  };

  const handleAddCustomRecipe = (recipe: Recipe) => {
    if (recipeToEdit) {
      // Edit mode
      setCustomRecipes(customRecipes.map(r => r.id === recipe.id ? recipe : r));
      setRecipeToEdit(null);
    } else {
      // Create mode
      setCustomRecipes([...customRecipes, recipe]);
    }
    setShowCreateOrEditForm(false);
  };

  const handleDeleteCustomRecipe = (id: string) => {
    setCustomRecipes(customRecipes.filter(r => r.id !== id));
    setSelectedRecipe(null);
  };

  const handleAddShoppingItem = (item: ShoppingItem) => {
    setShoppingList([...shoppingList, item]);
  };

  const handleToggleShoppingPurchased = (id: string) => {
    setShoppingList(shoppingList.map(item => {
      if (item.id === id) {
        return { ...item, purchased: !item.purchased };
      }
      return item;
    }));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const handleClearShoppingList = () => {
    setShoppingList([]);
  };

  const handleImportBackup = (backup: any) => {
    if (backup.favorites) setFavorites(backup.favorites);
    if (backup.history) setHistory(backup.history);
    if (backup.customRecipes) setCustomRecipes(backup.customRecipes);
  };

  return (
    <div className={isDarkMode ? "dark min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300" : "min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300"}>
      
      {/* Top Header Navigation Panel */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-805/85 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Brand logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentTab("market")}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 select-none">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg tracking-tight uppercase text-slate-900 dark:text-white">
                菜谱大全
              </h1>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">102+款离线美食全典</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: "market", label: "美食大集", icon: Compass },
              { id: "fridge", label: "我的冰箱", icon: Database },
              { id: "menu", label: "买菜规划", icon: Calendar },
              { id: "wheel", label: "幸运转盘", icon: RefreshCw },
              { id: "chef", label: "我的厨艺", icon: Trophy }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive 
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold scale-102"
                      : "text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Theme Toggler */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              title="切换主模式"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            <button
              onClick={() => {
                setRecipeToEdit(null);
                setShowCreateOrEditForm(true);
              }}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-lg shadow-orange-500/15"
            >
              <Plus className="w-4 h-4" />
              <span>新创配方</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Tab Controller Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
        
        {showCreateOrEditForm ? (
          <div className="animate-fade-in">
            <RecipeForm
              recipeToEdit={recipeToEdit}
              onSave={handleAddCustomRecipe}
              onCancel={() => {
                setShowCreateOrEditForm(false);
                setRecipeToEdit(null);
              }}
              categories={categories.filter(x => x !== "全部")}
            />
          </div>
        ) : (
          <>
            {/* Market Tab Display */}
            {currentTab === "market" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Visual Recommendation Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Today's feature (7 cols) */}
                  {todaysChoiceRecipe && (
                    <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-201 dark:border-slate-805 rounded-3xl overflow-hidden shadow-xl flex flex-col sm:flex-row relative group">
                      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold uppercase rounded-full">
                            ✨ 今日特别推荐
                          </span>
                          <h3 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white leading-tight">
                            {todaysChoiceRecipe.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {todaysChoiceRecipe.description}
                          </p>
                        </div>

                        {/* stats */}
                        <div className="flex items-center space-x-4 text-xs text-slate-505 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-405" /> {todaysChoiceRecipe.time} 分钟
                          </div>
                          <div>{todaysChoiceRecipe.difficulty}</div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-slate-405" /> {todaysChoiceRecipe.calories} kcal
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenRecipeDetail(todaysChoiceRecipe)}
                          className="px-5 py-2.5 bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition w-max shadow"
                        >
                          开始做这道菜
                        </button>
                      </div>

                      <div className={`w-full sm:w-48 bg-gradient-to-br ${todaysChoiceRecipe.colorBg} flex items-center justify-center text-7xl p-8 shadow-inner select-none`}>
                        {todaysChoiceRecipe.imageEmoji}
                      </div>
                    </div>
                  )}

                  {/* Personalization Recommendation Column (5 cols) */}
                  <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-201 dark:border-slate-855 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        智能专属个性推荐
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">根据您的常用分类、收藏及库存自动关联比对</p>
                    </div>

                    <div className="space-y-2.5">
                      {smartRecommendations.slice(0, 3).map(rec => (
                        <button
                          key={rec.id}
                          onClick={() => handleOpenRecipeDetail(rec)}
                          className="w-full text-left p-2.5 border border-slate-100 dark:border-slate-850 hover:border-orange-100 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition group"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">{rec.imageEmoji}</span>
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-orange-500 transition">{rec.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{rec.category} • {rec.time}分钟 • {rec.difficulty}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-md">查看</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Filters control block section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-5 md:p-6 rounded-3xl shadow-lg space-y-6">
                  
                  {/* Category strip buttons */}
                  <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex-shrink-0 ${
                            isActive
                              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-102"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search input & buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="输入菜名、口味关键词或者食材原料..."
                        className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className={`px-4.5 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isAdvancedOpen 
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-orange-500 dark:border-orange-500" 
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        高级筛选
                      </button>

                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e: any) => setSortBy(e.target.value)}
                          className="appearance-none font-bold text-xs bg-white dark:bg-slate-400/10 text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                        >
                          <option value="default">默认推荐排序</option>
                          <option value="time_asc">起制作用时（短-长）</option>
                          <option value="cost_asc">预算成本（低-高）</option>
                          <option value="cal_asc">卡路里糖度（低-高）</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters Area */}
                  {isAdvancedOpen && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in text-xs">
                      
                      {/* Difficulty choices */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase">烹饪难度</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(["全部", "简单", "中等", "困难"] as const).map(d => (
                            <button
                              key={d}
                              onClick={() => setActiveDifficulty(d)}
                              className={`py-1.5 rounded-lg border text-[10px] font-semibold transition ${
                                activeDifficulty === d
                                  ? "bg-orange-500 border-orange-500 text-white"
                                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-55 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-400 uppercase">最高制作用时</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{filterMaxTime} 分钟内</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={filterMaxTime}
                          onChange={(e) => setFilterMaxTime(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer"
                        />
                      </div>

                      {/* Calories Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-400 uppercase">最高热量</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{filterMaxCalories} kcal内</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="900"
                          step="20"
                          value={filterMaxCalories}
                          onChange={(e) => setFilterMaxCalories(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer"
                        />
                      </div>

                      {/* Special lists filter checkboxes */}
                      <div className="flex flex-col justify-center space-y-2.5">
                        <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={filterOnlyShowFavorites}
                            onChange={(e) => setFilterOnlyShowFavorites(e.target.checked)}
                            className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                          />
                          <span>只看收藏的菜谱</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={filterOnlyShowCustom}
                            onChange={(e) => setFilterOnlyShowCustom(e.target.checked)}
                            className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                          />
                          <span>只看我自己手创自创</span>
                        </label>
                      </div>

                    </div>
                  )}

                </div>

                {/* Recently Viewed strip (carousel-like) */}
                {recentlyViewed.length > 0 && (
                  <div className="space-y-2.5 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-150 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1 header-fonts">
                      <History className="w-4 h-4" /> 最近浏览历史记录
                    </h4>
                    <div className="flex overflow-x-auto gap-3.5 pb-1">
                      {recentlyViewed.map(rId => {
                        const rec = allRecipes.find(x => x.id === rId);
                        if (!rec) return null;
                        return (
                          <button
                            key={rId}
                            onClick={() => handleOpenRecipeDetail(rec)}
                            className="flex items-center space-x-2 bg-white dark:bg-slate-850 px-3.5 py-2 rounded-2xl hover:text-orange-500 hover:shadow-xs transition flex-shrink-0 text-xs border border-slate-100 dark:border-slate-800/80"
                          >
                            <span>{rec.imageEmoji}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recipes grid list */}
                {filteredAndSortedRecipes.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg mx-auto text-slate-500 text-sm space-y-2">
                    <Database className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-extrabold text-slate-650 dark:text-slate-300">未找到符合条件的菜谱</p>
                    <p className="text-xs text-slate-400">试试调整检索关键词、分类或滑块筛选条</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-5 px-1">
                      <span>找到了多达 {filteredAndSortedRecipes.length} 款大厨菜谱</span>
                      <span>大图查看，滑块比对</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAndSortedRecipes.map((recipe) => {
                        const isFav = favorites.includes(recipe.id);
                        return (
                          <div 
                            key={recipe.id}
                            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 select-none flex flex-col justify-between"
                          >
                            
                            {/* Graphic core panel */}
                            <div 
                              onClick={() => handleOpenRecipeDetail(recipe)}
                              className={`h-40 bg-gradient-to-br ${recipe.colorBg} relative flex items-center justify-center cursor-pointer overflow-hidden group`}
                            >
                              
                              {/* Background scale on hover */}
                              <div className="absolute inset-x-0 bottom-0 top-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-305" />
                              
                              <span className="text-6xl drop-shadow-md select-none transform group-hover:scale-110 transition duration-305">
                                {recipe.imageEmoji}
                              </span>

                              {/* Special build-in vs custom tag */}
                              {!recipe.isBuiltIn && (
                                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur rounded text-[9px] font-bold text-white uppercase tracking-wider">
                                  自制
                                </span>
                              )}

                              {/* Favorite heart button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(recipe.id);
                                }}
                                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition"
                              >
                                <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 stroke-red-500 scale-110" : ""}`} />
                              </button>
                            </div>

                            {/* Descriptions row */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                              <div 
                                onClick={() => handleOpenRecipeDetail(recipe)}
                                className="space-y-1 cursor-pointer"
                              >
                                <div className="flex items-center space-x-1.5 text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">
                                  <span>{recipe.category}</span>
                                  <span>•</span>
                                  <span>{recipe.difficulty}</span>
                                </div>
                                <h3 className="font-extrabold text-slate-850 dark:text-white group-hover:text-orange-500 transition text-sm leading-snug line-clamp-1">
                                  {recipe.name}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                                  {recipe.description}
                                </p>
                              </div>

                              {/* Footer statistics row */}
                              <div className="flex items-center justify-between text-[11px] font-mono leading-none pt-3 border-t border-slate-100 dark:border-slate-805 text-slate-450 dark:text-slate-400">
                                <div className="flex items-center gap-0.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {recipe.time}分
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Flame className="w-3.5 h-3.5 text-slate-400" /> {recipe.calories}卡
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Coins className="w-3.5 h-3.5 text-slate-400" /> {recipe.budgetCost}元
                                </div>
                              </div>

                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Smart Fridge Stock Tab */}
            {currentTab === "fridge" && (
              <div className="animate-fade-in">
                <FridgeManager
                  fridgeItems={fridgeItems}
                  onAddFridgeItem={handleAddFridgeItem}
                  onDeleteFridgeItem={handleDeleteFridgeItem}
                  recipes={allRecipes}
                  onOpenRecipe={handleOpenRecipeDetail}
                />
              </div>
            )}

            {/* Weekly Scheduler Tab */}
            {currentTab === "menu" && (
              <div className="animate-fade-in">
                <WeeklyMenuPlanner
                  weeklyMenu={weeklyMenu}
                  onUpdateMenu={setWeeklyMenu}
                  shoppingList={shoppingList}
                  onAddShoppingItem={handleAddShoppingItem}
                  onToggleShoppingPurchased={handleToggleShoppingPurchased}
                  onDeleteShoppingItem={handleDeleteShoppingItem}
                  onClearShoppingList={handleClearShoppingList}
                  recipes={allRecipes}
                  onOpenRecipe={handleOpenRecipeDetail}
                />
              </div>
            )}

            {/* Spinning Wheel Tab */}
            {currentTab === "wheel" && (
              <div className="animate-fade-in">
                <Wheel
                  recipes={allRecipes}
                  onOpenRecipe={handleOpenRecipeDetail}
                />
              </div>
            )}

            {/* Cooking History Tab */}
            {currentTab === "chef" && (
              <div className="animate-fade-in">
                <AchievementsGrid
                  history={history}
                  onDeleteHistoryItem={(id) => setHistory(history.filter(x => x.id !== id))}
                  onClearHistory={() => setHistory([])}
                  recipes={allRecipes}
                  customRecipesCount={customRecipes.length}
                  onImportBackup={handleImportBackup}
                  favorites={favorites}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Sub-navigation footer bar for absolute responsive mobile experience */}
      <footer className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 transition-colors">
        <div className="grid grid-cols-5 py-2.5 px-1 max-w-lg mx-auto">
          {[
            { id: "market", label: "美食集", icon: Compass },
            { id: "fridge", label: "冰箱", icon: Database },
            { id: "menu", label: "买菜", icon: Calendar },
            { id: "wheel", label: "转盘", icon: RefreshCw },
            { id: "chef", label: "成就", icon: Trophy }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id as any);
                  setShowCreateOrEditForm(false);
                }}
                className={`flex flex-col items-center justify-center space-y-1 text-[10px] font-bold ${
                  isActive ? "text-orange-500" : "text-slate-450 dark:text-slate-500"
                }`}
              >
                <TabIcon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Embedded Recipe Detail Fullscreen Overlay */}
      {selectedRecipe && (
        <div className="animate-fade-in">
          <RecipeDetail
            recipe={selectedRecipe}
            isFavorite={favorites.includes(selectedRecipe.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedRecipe.id)}
            onClose={() => setSelectedRecipe(null)}
            onCookCheckIn={handleCookCheckIn}
            historyCount={history.filter(h => h.recipeId === selectedRecipe.id).length}
            onEdit={() => {
              setRecipeToEdit(selectedRecipe);
              setSelectedRecipe(null);
              setShowCreateOrEditForm(true);
            }}
            onDelete={() => handleDeleteCustomRecipe(selectedRecipe.id)}
          />
        </div>
      )}

    </div>
  );
}
