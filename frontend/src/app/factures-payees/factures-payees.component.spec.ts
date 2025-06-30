import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesPayeesComponent } from './factures-payees.component';

describe('FacturesPayeesComponent', () => {
  let component: FacturesPayeesComponent;
  let fixture: ComponentFixture<FacturesPayeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesPayeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesPayeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
