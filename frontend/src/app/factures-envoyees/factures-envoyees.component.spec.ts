import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesEnvoyeesComponent } from './factures-envoyees.component';

describe('FacturesEnvoyeesComponent', () => {
  let component: FacturesEnvoyeesComponent;
  let fixture: ComponentFixture<FacturesEnvoyeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesEnvoyeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesEnvoyeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
