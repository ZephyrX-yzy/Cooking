import React, { useState, useEffect } from "react";
import { Recipe, Ingredient } from "../types";
import { X, Plus, BookOpen, Clock, Flame, Receipt, ChevronDown } from "lucide-react";

interface RecipeFormProps {
  recipeToEdit: Recipe | null;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  categories: string[];
}

export default function RecipeForm({ recipeToEdit, onSave, onCancel, categories }: RecipeFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState(20);
  const [difficulty, setDifficulty] = useState<"简单" | "中等" | "困难">("简单");
  const [budgetCost, setBudgetCost] = useState(20);
  const [calories, setCalories] = useState(250);
  const [description, setDescription] = useState("");
  const [imageEmoji, setImageEmoji] = useState("🍳");
  const [colorBg, setColorBg] = useState("from-orange-400 to-red-500");
  
  // Ingredients (default is 2 servings)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: 100, unit: "克" }
  ]);
  
  // Steps
  const [steps, setSteps] = useState<string[]>([""]);

  const emojis = ["🍳", "🍲", "🍗", "🥩", "🌶️", "🍛", "🔥", "🐟", "🥗", "🥘", "🥓", "🍖", "🐔", "🥬", "🍜", "🧆", "🦪", "🦆", "🍚", "🍤", "🍆", "🍔", "🍝", "🍕", "🥣", "🥞", "🍱", "🍍", "🍰", "🥭", "🍮", "🍸", "☕", "🥧", "🥤", "🍧", "🍿", "🥦", "🫑", "🍇", "🥑", "🧅", "🥕", "🧄"];
  const gradients = [
    { value: "from-orange-400 to-red-500", label: "活力暖橙" },
    { value: "from-red-500 to-amber-600", label: "浓郁复古" },
    { value: "from-yellow-400 to-amber-500", label: "温馨暖黄" },
    { value: "from-green-400 to-emerald-500", label: "清新草绿" },
    { value: "from-emerald-400 to-teal-500", label: "自然青绿" },
    { value: "from-cyan-400 to-blue-500", label: "静谧海蓝" },
    { value: "from-purple-500 to-indigo-600", label: "梦幻浅紫" },
    { value: "from-pink-500 to-rose-600", label: "甜蜜莓红" },
    { value: "from-zinc-700 to-slate-900", label: "极简黑灰" }
  ];

  useEffect(() => {
    if (recipeToEdit) {
      setName(recipeToEdit.name);
      setCategory(recipeToEdit.category);
      setTime(recipeToEdit.time);
      setDifficulty(recipeToEdit.difficulty);
      setBudgetCost(recipeToEdit.budgetCost);
      setCalories(recipeToEdit.calories);
      setDescription(recipeToEdit.description);
      setImageEmoji(recipeToEdit.imageEmoji);
      setColorBg(recipeToEdit.colorBg);
      setIngredients(recipeToEdit.ingredients.length > 0 ? [...recipeToEdit.ingredients] : [{ name: "", amount: 100, unit: "克" }]);
      setSteps(recipeToEdit.steps.length > 0 ? [...recipeToEdit.steps] : [""]);
    } else {
      setCategory(categories[0] || "家常素菜");
    }
  }, [recipeToEdit, categories]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: 100, unit: "克" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("请输入菜谱名称");
    if (!category) return alert("请选择分类");
    
    // Filter out empty ingredients/steps
    const filteredIngredients = ingredients.filter(i => i.name.trim() !== "");
    const filteredSteps = steps.filter(s => s.trim() !== "");

    if (filteredIngredients.length === 0) {
      alert("请至少添加一个有效的食材");
      return;
    }
    if (filteredSteps.length === 0) {
      alert("请至少添写一个制作步骤");
      return;
    }

    const savedRecipe: Recipe = {
      id: recipeToEdit ? recipeToEdit.id : `custom_${Date.now()}`,
      name: name.trim(),
      category,
      time: Number(time) || 15,
      difficulty,
      budgetCost: Number(budgetCost) || 15,
      calories: Number(calories) || 200,
      ingredients: filteredIngredients,
      steps: filteredSteps,
      description: description.trim() || `${name}是一道美味的家常菜色。`,
      isBuiltIn: false,
      imageEmoji,
      colorBg
    };

    onSave(savedRecipe);
  };

  return (
    <div id="recipe-form-container" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
              {recipeToEdit ? "编辑我的菜谱" : "创立专属菜谱"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">自造美味灵感，数据保存在本地浏览器</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              菜品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：自制香烤鸡胸肉"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              菜系分类 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Nutritional & Stats Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              制作用时 (分钟)
            </label>
            <input
              type="number"
              min={1}
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              烹饪难度
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["简单", "中等", "困难"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    difficulty === lvl
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              估计成本 (RMB)
            </label>
            <input
              type="number"
              min={1}
              value={budgetCost}
              onChange={(e) => setBudgetCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-slate-400" />
              热量估算 (kcal)
            </label>
            <input
              type="number"
              min={1}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Visual Styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              设计配图标签 (Emoji 形象)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-850">
              {emojis.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setImageEmoji(em)}
                  className={`w-9 h-9 text-lg flex items-center justify-center rounded-lg transition ${
                    imageEmoji === em
                      ? "bg-orange-500 text-white scale-110 shadow-md"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              渐变主题色 (卡片视觉渐变)
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-850">
              {gradients.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setColorBg(g.value)}
                  className={`p-1.5 text-[10px] text-center rounded-lg border font-semibold flex items-center justify-center transition truncate ${
                    colorBg === g.value
                      ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full mr-1 bg-gradient-to-br ${g.value}`} />
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            一道菜简介 (小故事或风味特色)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简述一下该菜品的美味秘诀吧..."
            rows={2}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
          />
        </div>

        {/* Ingredients List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              所需食材列表 <span className="text-slate-400 text-xs font-normal">(按 2 人份标准填写)</span>
            </label>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-2.5 py-1 text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/80 rounded-lg flex items-center transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> 增加食材
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(i, "name", e.target.value)}
                  placeholder="食材名 (如：鸡胸肉)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                />
                <input
                  type="number"
                  min={0.1}
                  step="any"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(i, "amount", parseFloat(e.target.value) || 0)}
                  placeholder="数量"
                  className="w-20 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(i, "unit", e.target.value)}
                  placeholder="单位 (克/勺)"
                  className="w-20 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(i)}
                  disabled={ingredients.length === 1}
                  className="p-2 text-rose-500 hover:bg-rose-55 hover:text-rose-600 disabled:opacity-30 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              制作步骤步骤
            </label>
            <button
              type="button"
              onClick={handleAddStep}
              className="px-2.5 py-1 text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/80 rounded-lg flex items-center transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> 增加步骤
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {steps.map((st, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="w-6 h-6 mt-1.5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                  {i + 1}
                </span>
                <textarea
                  value={st}
                  onChange={(e) => handleStepChange(i, e.target.value)}
                  placeholder={`第 ${i + 1} 步操作说明...`}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(i)}
                  disabled={steps.length === 1}
                  className="p-2 text-rose-500 hover:bg-rose-55 rounded-lg mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            取消返回
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-550/30 transition"
          >
            完成并保存
          </button>
        </div>
      </form>
    </div>
  );
}
