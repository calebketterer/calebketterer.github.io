import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-card.component.html',
  styleUrl: './preview-card.component.css'
})
export class PreviewCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() category = 'RESOURCE';
  @Input() targetUrl = '';
  @Input() embedUrl?: string;

  safeEmbedUrl?: SafeResourceUrl;
  showIframe = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.embedUrl) {
      this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl);
    }
  }

  togglePreview(): void {
    this.showIframe = !this.showIframe;
  }
}