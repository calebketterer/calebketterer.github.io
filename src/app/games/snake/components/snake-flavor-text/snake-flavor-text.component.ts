import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snake-flavor-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-flavor-text.component.html',
  styleUrls: ['./snake-flavor-text.component.css']
})
export class SnakeFlavorTextComponent implements OnInit, OnDestroy {
  public readonly quotes: string[] = [
    "Eatin' glowing dots since '76 when Blockade thought two monochrome lines were peak gaming.",
    "Nokia 6110 shipped this in '97 because your dad needed something to do while waiting for texts to send.",
    "Consuming energy nodes makes you longer. Brilliant engineering, isn't it?",
    "1976 called. It wants its two-bit raster collision detection back.",
    "The timeless sport of running in circles until you accidentally eat your own ass.",
    "Engineered without network latency so you have no one else to blame for your garbage reaction time.",
    "You're essentially a glorified 1-bit memory leak with an appetite.",
    "Remember when this was the only thing preventing mobile phone users from losing their minds?",
    "Every dot consumed increases kinetic momentum. Newton is crying in his grave.",
    "Brought to you by Gremlin Industries, arcade cabinet CRT burn-in, and caffeine.",
    "Spatial navigation tip: Walls are solid. Trying to pass through them usually ends poorly.",
    "In 1998, this game consumed more corporate work-hours than Microsoft Excel.",
    "You are a vector serpent. Your life purpose is eating neon pixels. Live it proudly.",
    "Warning: Self-intersection violates temporal mechanics and leads to instant obliteration.",
    "Imagine surviving deep space combat only to get outplayed by a 14x14 grid border.",
    "The original arcade cabinets didn't have save files either. Suffer gracefully.",
    "Algorithm running at 60 FPS just to record you running directly into a corner.",
    "Pathfinding logic status: Operator error detected between chair and keyboard.",
    "Nokia engineers spent months optimizing this so you could ignore work in 1999.",
    "The grid is finite. Your hubris is apparently boundless.",
    "Consuming data nodes... processing... nope, still just a digital snake.",
    "Gremlin's 1976 'Blockade' had no food. Just two lines trying to trap each other in CRT purgatory.",
    "Your neural link is operating at 100% capacity... to control a 2D line.",
    "Why build complex physics when a tile grid can ruin your day just as effectively?",
    "'Surround' on Atari 2600 was the same thing, just with uglier colors.",
    "Your tail is not a snack. Stop trying to eat it.",
    "High score tracking enabled. No pressure or anything.",
    "Simulating quantum vector trajectory... or just pressing 'W' repeatedly.",
    "If you crash on Cadet difficulty, we won't tell anyone. But the system knows.",
    "Grid density calibrated. Try not to panic when space runs out.",
    "An elegant algorithm from a more civilized age. Before microtransactions ruined everything.",
    "Snake II on the 3310 added mazes. You don't even have mazes here and you're struggling.",
    "Zero network dependencies. Pure, unadulterated operator incompetence on display.",
    "Data node acquired. Length incremented. Regret delayed.",
    "System advisory: Turning right when moving left is physically impossible.",
    "Per aspera ad astra... or at least until you crash into row 0."
  ];

  public currentQuoteIndex = 0;
  public isFading = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.selectRandomQuote();
    this.startAutoCycle();
  }

  public ngOnDestroy(): void {
    this.stopAutoCycle();
  }

  public triggerNextQuote(): void {
    if (this.isFading) return;
    this.isFading = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * this.quotes.length);
      if (nextIdx === this.currentQuoteIndex) {
        nextIdx = (nextIdx + 1) % this.quotes.length;
      }
      this.currentQuoteIndex = nextIdx;
      this.isFading = false;
      this.cdr.detectChanges();
    }, 250);
  }

  private selectRandomQuote(): void {
    this.currentQuoteIndex = Math.floor(Math.random() * this.quotes.length);
  }

  private startAutoCycle(): void {
    this.stopAutoCycle();
    this.intervalId = setInterval(() => {
      this.triggerNextQuote();
    }, 20000);
  }

  private stopAutoCycle(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}