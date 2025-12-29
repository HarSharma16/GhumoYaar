import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, IndianRupee, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
}

interface ExpenseTrackerProps {
  tripId: string;
  userId: string;
  budget: number | null;
}

const CATEGORIES = ["Food", "Travel", "Stay", "Activities"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Food: "hsl(28, 90%, 55%)",
  Travel: "hsl(175, 50%, 35%)",
  Stay: "hsl(45, 90%, 55%)",
  Activities: "hsl(350, 70%, 50%)",
};

const ExpenseTracker = ({ tripId, userId, budget }: ExpenseTrackerProps) => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newExpense, setNewExpense] = useState({
    category: "" as string,
    amount: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.expense_date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        trip_id: tripId,
        user_id: userId,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description || null,
        expense_date: newExpense.expense_date,
      });

      if (error) throw error;

      toast({
        title: "Expense added",
        description: "Your expense has been recorded.",
      });

      setNewExpense({
        category: "",
        amount: "",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      setIsDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      setExpenses(expenses.filter((e) => e.id !== id));
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      });
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingBudget = budget ? budget - totalSpent : null;

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter((d) => d.value > 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          Expense Tracker
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) =>
                    setNewExpense({ ...newExpense, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, expense_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., Lunch at local restaurant"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                />
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleAddExpense}
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className="font-display text-2xl font-bold text-foreground flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
            {totalSpent.toLocaleString("en-IN")}
          </p>
        </div>

        {budget && (
          <>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Budget</p>
              <p className="font-display text-2xl font-bold text-muted-foreground flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
                {budget.toLocaleString("en-IN")}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 text-center ${
                remainingBudget! >= 0
                  ? "bg-secondary/10"
                  : "bg-destructive/10"
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                {remainingBudget! >= 0 ? (
                  <TrendingDown className="w-3 h-3 text-secondary" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-destructive" />
                )}
                Remaining
              </p>
              <p
                className={`font-display text-2xl font-bold flex items-center justify-center ${
                  remainingBudget! >= 0 ? "text-secondary" : "text-destructive"
                }`}
              >
                <IndianRupee className="w-5 h-5" />
                {Math.abs(remainingBudget!).toLocaleString("en-IN")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Budget vs Actual Chart */}
      {budget && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Budget vs Actual Spending
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Budget", value: budget, fill: "hsl(var(--muted-foreground))" },
                  { name: "Spent", value: totalSpent, fill: totalSpent > budget ? "hsl(var(--destructive))" : "hsl(var(--primary))" },
                ]}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={50}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-muted-foreground" />
              Budget
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${totalSpent > budget ? "bg-destructive" : "bg-primary"}`} />
              Spent
            </span>
          </div>
        </div>
      )}

      {/* Category Chart */}
      {categoryData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Category-wise Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name]}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.name] }}
                    />
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">
                      ₹{cat.value.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({((cat.value / totalSpent) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Recent Expenses
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No expenses recorded yet. Add your first expense!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {expenses.map((expense, idx) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between bg-muted/50 rounded-xl p-3 hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {expense.description || expense.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} • {formatDate(expense.expense_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    ₹{Number(expense.amount).toLocaleString("en-IN")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
