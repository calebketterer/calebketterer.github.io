// src/app/diep/core/diep.high-scores.service.ts
import { Injectable } from '@angular/core';
import { HighScore } from './diep.interfaces';

@Injectable({
  providedIn: 'root'
})
export class HighScoresService {
  private readonly ALL_TIME_KEY = 'diepSpHighScores';
  private readonly WEEKLY_KEY = 'diepSpWeeklyScores';
  private readonly MAX_SCORES = 10;

  /**
   * Retrieves the all-time leaderboard list.
   */
  getHighScores(): HighScore[] {
    return this.getStoredScores(this.ALL_TIME_KEY);
  }

  /**
   * Retrieves the rolling 7-day leaderboard list, pre-filtered and cleaned.
   */
  getWeeklyScores(): HighScore[] {
    const scores = this.getStoredScores(this.WEEKLY_KEY);
    const cleaned = this.filterRecentScores(scores);
    
    // If expired rows were purged, write the pruned state back to storage immediately
    if (cleaned.length !== scores.length) {
      this.saveScores(this.WEEKLY_KEY, cleaned);
    }
    return cleaned;
  }

  /**
   * Pushes a completed run score to both isolated tracking tracks.
   * @param newScore The player's final score.
   */
  addHighScore(newScore: number): void {
    if (newScore <= 0) return;

    const newEntry: HighScore = {
      score: newScore,
      date: new Date().toISOString()
    };

    // 1. Process All-Time Standings
    const allTimeScores = this.getHighScores();
    allTimeScores.push(newEntry);
    const topAllTime = this.sortScores(allTimeScores).slice(0, this.MAX_SCORES);
    this.saveScores(this.ALL_TIME_KEY, topAllTime);

    // 2. Process Date-Constrained Weekly Standings
    const weeklyScores = this.getStoredScores(this.WEEKLY_KEY);
    weeklyScores.push(newEntry);
    const activeWeekly = this.filterRecentScores(weeklyScores);
    const topWeekly = this.sortScores(activeWeekly).slice(0, this.MAX_SCORES);
    this.saveScores(this.WEEKLY_KEY, topWeekly);
  }

  /**
   * Helper to retrieve and parse data cleanly from LocalStorage.
   */
  private getStoredScores(key: string): HighScore[] {
    try {
      const json = localStorage.getItem(key);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error(`Error reading high scores from key ${key}:`, e);
      return [];
    }
  }

  /**
   * Helper to write lists to disk.
   */
  private saveScores(key: string, scores: HighScore[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(scores));
    } catch (e) {
      console.error(`Error saving high scores to key ${key}:`, e);
    }
  }

  /**
   * Strips out any metrics logged past the rolling 7-day system boundary.
   */
  private filterRecentScores(scores: HighScore[]): HighScore[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return scores.filter(row => {
      const parsedTime = new Date(row.date).getTime();
      return !isNaN(parsedTime) && parsedTime >= sevenDaysAgo;
    });
  }

  /**
   * Sorts scores by score value descending, breaking ties via chronological age.
   */
  private sortScores(scores: HighScore[]): HighScore[] {
    return scores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
}