import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css'
})
export class ContactPageComponent {
  @ViewChild('bizCardRef', { static: false }) bizCardRef!: ElementRef;

  cardInfo = {
    name: 'Caleb Ketterer',
    email: 'calebketterer8@gmail.com',
    website: 'calebketterer.github.io',
    github: 'github.com/calebketterer'
  };

  copied = false;

  copyEmail(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.cardInfo.email).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      });
    }
  }

  async downloadCard(): Promise<void> {
    if (!this.bizCardRef) return;
    const cardElement = this.bizCardRef.nativeElement;

    try {
      // Render the live DOM element to a high-resolution canvas
      const canvas = await html2canvas(cardElement, {
        scale: 3, // 3x scale for crisp print-ready resolution (300 DPI equivalent)
        useCORS: true,
        backgroundColor: null // Preserves your card's transparent glass gradients
      });

      // Create a print-ready canvas with a solid black padding frame
      const printCanvas = document.createElement('canvas');
      const padding = 40; // Print padding border
      printCanvas.width = canvas.width + padding * 2;
      printCanvas.height = canvas.height + padding * 2;
      
      const ctx = printCanvas.getContext('2d');
      if (ctx) {
        // Solid black background frame
        ctx.fillStyle = '#050910';
        ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

        // Draw the exact card screenshot centered inside the black frame
        ctx.drawImage(canvas, padding, padding);
      }

      // Trigger browser download
      const link = document.createElement('a');
      link.download = 'caleb-ketterer-business-card.png';
      link.href = printCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to capture card snapshot:', error);
    }
  }
}