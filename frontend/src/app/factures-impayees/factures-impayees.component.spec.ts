import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesImpayeesComponent } from './factures-impayees.component';

describe('FacturesImpayeesComponent', () => {
  let component: FacturesImpayeesComponent;
  let fixture: ComponentFixture<FacturesImpayeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesImpayeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesImpayeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
