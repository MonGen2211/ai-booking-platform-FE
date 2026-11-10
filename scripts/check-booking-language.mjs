import { chromium, expect } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const doctor={id:'doctor-test',name:'Bác sĩ Nguyễn An',specialty:'Nội khoa',introduction:'Thông tin từ API',qualifications:'Bác sĩ',experienceYears:10,consultationFee:'250000.00',address:'Địa chỉ từ API',averageRating:null,reviewCount:0};
  const patient={id:'patient-test',kind:'SELF',fullName:'Nguyễn Văn Bình',birthDate:'1990-01-01',phone:'0901234567',relationship:null};
  await page.addInitScript(()=>localStorage.setItem('antam.language','en'));
  await page.route('http://localhost:3000/**',route=>{
    const url=new URL(route.request().url()); let body;
    if(url.pathname==='/auth/me')body={id:'user-test',email:'patient@example.com',createdAt:'2026-01-01'};
    else if(url.pathname==='/doctors')body={items:[doctor],total:1,totalPages:1,page:1,pageSize:6};
    else if(url.pathname.endsWith('/availability'))body={items:[{id:'slot-test',startsAt:'2026-11-11T03:00:00Z',endsAt:'2026-11-11T03:30:00Z'}],timezone:'Asia/Ho_Chi_Minh',policy:{leadHours:2,horizonDays:60,changeHours:24,slotMinutes:30}};
    else if(url.pathname==='/doctors/doctor-test')body=doctor;
    else if(url.pathname==='/me/patient-profiles')body={items:[patient]};
    else body={items:[]};
    return route.fulfill({json:body,headers:{'access-control-allow-origin':'http://localhost:5173','access-control-allow-credentials':'true'}});
  });
  await page.goto('http://localhost:5173/booking?doctorId=doctor-test');
  await expect(page.getByRole('heading',{name:'Choose a doctor & time'})).toBeVisible();
  await page.getByRole('button',{name:/11 Nov 2026/}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByText('Who is this appointment for?')).toBeVisible();
  await expect(page.getByText('Nguyễn Văn Bình',{exact:true})).toBeVisible();
  await page.getByLabel('Reason for visit').fill('Nội dung không được dịch');
  await page.getByRole('button',{name:'Add patient',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByLabel('Full name')).toBeVisible();
  await expect(dialog.getByLabel('Date of birth')).toBeVisible();
  await dialog.getByRole('button',{name:'Close',exact:true}).click();
  await page.getByRole('button',{name:'Tiếng Việt',exact:true}).click();
  await expect(page.getByLabel('Lý do khám')).toHaveValue('Nội dung không được dịch');
  await expect(page.getByText('Bạn đặt khám cho ai?')).toBeVisible();
  console.log('PASS populated booking: EN labels, patient dialog, original API content and draft preserved switching to VI');
} finally {await browser.close();}
