(()=>{var e={};e.id=558,e.ids=[558],e.modules={6330:e=>{"use strict";e.exports=require("@prisma/client")},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},918:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>y,routeModule:()=>d,serverHooks:()=>l,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{GET:()=>p});var a=t(2706),i=t(8203),o=t(5994),u=t(9187);let n=new(t(6330)).PrismaClient;async function p(e){let r=new URL(e.url),t=parseInt(r.searchParams.get("weekNumber")||"0",10),s=parseInt(r.searchParams.get("year")||"0",10);try{let e=(await n.booking.findMany({where:{weekNumber:t||void 0,year:s||void 0},orderBy:{createdAt:"desc"}})).map(e=>{let r=e.dailyQuantities,t=r?Object.values(r).reduce((e,r)=>e+Number(r),0):0;return{id:e.id,code:e.code,customerName:e.customerName,team:e.team,fishSize:e.fishSize,totalQuantity:t,weekNumber:e.weekNumber,year:e.year,createdAt:e.createdAt,dailyQuantities:r}});return u.NextResponse.json(e,{status:200})}catch(e){return console.error("Error fetching summary:",e),u.NextResponse.json({error:"Failed to fetch summary"},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/summary/route",pathname:"/api/summary",filename:"route",bundlePath:"app/api/summary/route"},resolvedPagePath:"/Users/Fufu/booking/fish-booking-system/app/api/summary/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:c,workUnitAsyncStorage:m,serverHooks:l}=d;function y(){return(0,o.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:m})}},6487:()=>{},8335:()=>{}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[994,452],()=>t(918));module.exports=s})();