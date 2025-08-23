import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, TrendingUp, Users, Calendar } from 'lucide-react';
import { useVisitorCount } from '../hooks/useVisitorCount';

export function VisitorStats() {
  const { visitorCount, dailyVisitors, isNewVisitor, isNewDailyVisitor } = useVisitorCount();

  return (
    <Card className="p-4 border border-border/50 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Total Visitors</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {visitorCount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            {isNewVisitor && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                New Visitor!
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Today:</span>
            <span className="text-sm font-medium">{dailyVisitors}</span>
          </div>
          {isNewDailyVisitor && (
            <Badge variant="secondary" className="text-xs">
              First today!
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
