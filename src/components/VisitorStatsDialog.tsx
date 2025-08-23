import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, TrendingUp, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import { useVisitorCount } from '../hooks/useVisitorCount';

export function VisitorStatsDialog() {
  const { 
    visitorCount, 
    dailyVisitors, 
    lastVisitDate, 
    isNewVisitor, 
    isNewDailyVisitor,
    resetStats 
  } = useVisitorCount();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          View Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visitor Statistics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Total Visitors */}
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {visitorCount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Daily Visitors */}
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Visitors</p>
                <p className="text-2xl font-bold text-green-600">
                  {dailyVisitors}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Last Visit */}
          <Card className="p-4 border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">Last Visit</p>
              <p className="text-sm font-medium">
                {formatDate(lastVisitDate)}
              </p>
            </div>
          </Card>

          {/* Status Badges */}
          <div className="flex gap-2">
            {isNewVisitor && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                New Visitor
              </Badge>
            )}
            {isNewDailyVisitor && (
              <Badge variant="secondary">
                First Visit Today
              </Badge>
            )}
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border/30">
            <Button 
              variant="outline" 
              onClick={resetStats}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Statistics
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This will clear all visitor data
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
