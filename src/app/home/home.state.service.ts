import { Injectable } from '@angular/core';
import { TIPS_LIST } from './home.constants';

@Injectable({
  providedIn: 'root'
})
export class HomeStateService {
  selectedView = 'main-site';
  globalClickCount = 0;
  showClickerGame = false;
  currentTipText = TIPS_LIST[0];
  reverse = false;

  handleGlobalClick() {
    this.globalClickCount++;
    if (this.globalClickCount >= 5) {
      this.showClickerGame = true;
    }
  }

  updateView(view: string) {
    this.selectedView = view;
    this.globalClickCount = 0;
    this.showClickerGame = false;
  }

  cycleTip() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * TIPS_LIST.length);
    } while (TIPS_LIST[newIndex] === this.currentTipText);
    
    this.currentTipText = TIPS_LIST[newIndex];
    return this.currentTipText;
  }
}