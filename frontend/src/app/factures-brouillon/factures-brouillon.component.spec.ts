import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesBrouillonComponent } from './factures-brouillon.component';

describe('FacturesBrouillonComponent', () => {
  let component: FacturesBrouillonComponent;
  let fixture: ComponentFixture<FacturesBrouillonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesBrouillonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesBrouillonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
