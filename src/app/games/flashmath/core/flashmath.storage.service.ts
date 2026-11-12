import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlashmathStorageService {
  private storageKey = 'flashmath_xp_data';

  getXp(subjectId: string): number {
    try {
      const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return data[subjectId] || 0;
    } catch {
      return 0;
    }
  }

  addXp(subjectId: string, amount: number): number {
    try {
      const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      data[subjectId] = (data[subjectId] || 0) + amount;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return data[subjectId];
    } catch {
      return amount;
    }
  }
}