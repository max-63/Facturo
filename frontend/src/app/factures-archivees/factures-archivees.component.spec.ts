import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesArchiveesComponent } from './factures-archivees.component';

describe('FacturesArchiveesComponent', () => {
  let component: FacturesArchiveesComponent;
  let fixture: ComponentFixture<FacturesArchiveesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturesArchiveesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturesArchiveesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
