import { chromium, expect } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  for(const width of [375,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    const doctors=Array.from({length:13},(_,i)=>({id:`doc_${i+1}`,name:`Doctor ${i+1}`,specialty:'Clinic',introduction:'Profile',qualifications:'MD',experienceYears:5,consultationFee:'200000.00',address:'Clinic address',averageRating:null,reviewCount:0}));
    const calls=[];let failPageTwo=true;
    await page.route('http://localhost:3000/**',async route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/auth/me')return route.fulfill({status:401,json:{code:'AUTH_REQUIRED'}});
      if(url.pathname==='/doctors') {
        const index=Number(url.searchParams.get('page'));const size=Number(url.searchParams.get('pageSize'));calls.push({page:index,size,at:Date.now()});
        await new Promise(r=>setTimeout(r,150));
        if(index===2 && failPageTwo) {failPageTwo=false;return route.fulfill({status:503,json:{code:'SERVICE_UNAVAILABLE'}});}
        return route.fulfill({json:{items:doctors.slice((index-1)*size,index*size),page:index,pageSize:size,total:doctors.length,totalPages:Math.ceil(doctors.length/size)}});
      }
      if(url.pathname.endsWith('/availability'))return route.fulfill({json:{items:[],timezone:'Asia/Ho_Chi_Minh',policy:{leadHours:2,horizonDays:60}}});
      return route.fulfill({json:doctors.find(d=>`/doctors/${d.id}`===url.pathname)});
    });
    await page.goto('http://localhost:5173/booking?doctorId=doc_10');
    const picker=page.getByRole('combobox',{name:'Bác sĩ khám'});
    await expect(page.locator('.MuiSelect-select').first()).toContainText('Doctor 10');
    await picker.click();
    const list=page.getByRole('listbox');
    await expect(list.getByRole('option',{name:'Doctor 5 · Clinic',exact:true})).toBeVisible();
    const scroll=()=>list.evaluate(el=>{const paper=el.closest('.MuiPaper-root');paper.scrollTop=paper.scrollHeight;paper.dispatchEvent(new Event('scroll',{bubbles:true}));});
    const firstScrollAt=Date.now();
    await scroll();
    await expect(list.getByRole('button',{name:'Thử lại'})).toBeVisible();
    expect(calls.find(c=>c.page===2).at-firstScrollAt).toBeGreaterThanOrEqual(280);
    await expect(list.getByRole('option',{name:'Doctor 1 · Clinic',exact:true})).toBeAttached();
    await expect(page.locator('.MuiSelect-select').first()).toContainText('Doctor 10');
    await list.getByRole('button',{name:'Thử lại'}).click();
    await expect(list.getByRole('option',{name:'Doctor 10 · Clinic',exact:true})).toHaveCount(1);
    await expect(list.getByText('Đã tải 10/13 bác sĩ')).toBeAttached();
    await scroll();await scroll();
    await expect(list.getByText('Đã tải 13/13 bác sĩ')).toBeAttached();
    await expect(list.getByText('Đã hiển thị tất cả bác sĩ')).toHaveCount(0);
    expect(await list.locator('[role="option"][data-value]').count()).toBe(14);
    await scroll();
    expect(calls.filter(c=>c.page===1)).toHaveLength(1);
    expect(calls.filter(c=>c.page===2)).toHaveLength(2);
    expect(calls.filter(c=>c.page===3)).toHaveLength(1);
    expect(calls.every(c=>c.size===5)).toBe(true);
    await list.getByRole('option',{name:'Doctor 13 · Clinic',exact:true}).click();
    await expect(picker).toContainText('Doctor 13');
    await expect(page.locator('.booking-summary')).toContainText('Doctor 13');
    await picker.click();await expect(page.getByRole('listbox').locator('[role="option"][data-value]')).toHaveCount(14);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    console.log(`PASS ${width}px: 5/page, append, loading/error retry, no duplicate requests or options, end-of-list, deep-link and selection preserved`);
    await page.close();
  }
} finally {await browser.close();}
