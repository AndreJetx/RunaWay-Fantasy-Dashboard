import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, Calendar, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const classData = [
  { name: "Warrior", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Mage", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Rogue", value: 300, color: "hsl(var(--chart-3))" },
  { name: "Cleric", value: 200, color: "hsl(var(--chart-4))" },
];

const rarityData = [
  { name: "Common", amount: 120, fill: "hsl(var(--muted-foreground))" },
  { name: "Rare", amount: 45, fill: "hsl(var(--primary))" },
  { name: "Epic", amount: 12, fill: "hsl(var(--secondary))" },
  { name: "Legendary", amount: 3, fill: "hsl(var(--accent))" },
];

export default function Dashboard() {
  return (
    <FantasyLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(var(--primary),0.5)] font-cinzel mb-2">
              Realm Overview
            </h1>
            <p className="text-muted-foreground">Welcome back, Dungeon Master. The world awaits your command.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.4)] border border-white/10">
            <Sparkles className="mr-2 h-4 w-4" />
            Launch Session
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Active Players", value: "12", icon: Users, color: "text-chart-1" },
            { title: "Campaigns", value: "3", icon: Crown, color: "text-chart-2" },
            { title: "Next Session", value: "2 Days", icon: Calendar, color: "text-chart-3" },
            { title: "New Items", value: "+24", icon: Sparkles, color: "text-chart-4" },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-colors group overflow-hidden relative">
                 <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-cinzel tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground flex items-end gap-2">
                    {stat.value}
                    {i === 3 && <span className="text-xs text-green-400 mb-1 flex items-center"><ArrowUpRight className="w-3 h-3" /> 12%</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur border-white/5 h-[400px]">
              <CardHeader>
                <CardTitle className="font-cinzel text-primary">Class Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card/50 backdrop-blur border-white/5 h-[400px]">
              <CardHeader>
                <CardTitle className="font-cinzel text-accent">Loot Rarity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rarityData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </FantasyLayout>
  );
}
