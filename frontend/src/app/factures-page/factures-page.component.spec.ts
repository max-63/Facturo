import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesPageComponent } from './factures-page.component';

describe('FacturesPageComponent', () => {
  let component: FacturesPageComponent;
  let fixture: ComponentFixture<FacturesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
