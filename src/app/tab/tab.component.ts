import { Component, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css'],
})
export class TabComponent {
  @ContentChild<TemplateRef<unknown>>('rowRef');
}
