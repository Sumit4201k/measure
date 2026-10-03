import {Stitch,StitchToolClient} from "@google/stitch-sdk";
import {env} from "cloudflare:workers";

type Settings={STITCH_API_KEY?:string;STITCH_PROJECT_ID?:string;STITCH_ENABLED?:string};
const settings=()=>env as unknown as Settings;
const prompts:Record<string,string>={
 search:"Search timeout for a travel app named roam. Preserve the query Weekend in Kyoto. Explain the timeout, offer Try search again, and never promise retry success.",
 upload:"Interrupted file upload in an app named folio. Keep Brand explorations.fig selected. Offer Try upload again. Do not claim server-side resume support.",
 checkout:"Unconfirmed order in an app named form. Offer Check order status before any repeat payment. Never tell the user payment failed definitively or promise safe duplicate payment."
};
let inFlight=false,lastStarted=0;
export async function GET(){const s=settings();return Response.json({configured:!!s.STITCH_API_KEY&&s.STITCH_ENABLED==="true",mode:s.STITCH_API_KEY&&s.STITCH_ENABLED==="true"?"live":"prepared"},{headers:{"Cache-Control":"no-store"}});}
export async function POST(request:Request){
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Cross-origin generation is not allowed."},{status:403});
 const s=settings();if(!s.STITCH_API_KEY||s.STITCH_ENABLED!=="true")return Response.json({error:"Live Stitch is not configured. Explore the prepared example instead."},{status:503});
 // The private deployment is the access boundary; additionally require its authenticated identity.
 if(!request.headers.get("oai-authenticated-user-id"))return Response.json({error:"Sign in to this private demo to generate a design."},{status:401});
 if(Number(request.headers.get("content-length")||0)>1024)return Response.json({error:"Request too large."},{status:413});
 let scenario:string;try{const body=await request.text();if(body.length>1024)throw Error();scenario=JSON.parse(body).scenario;if(!Object.hasOwn(prompts,scenario))throw Error();}catch{return Response.json({error:"Choose a supported scenario."},{status:400});}
 if(inFlight||Date.now()-lastStarted<60000)return Response.json({error:"A design is running or cooling down. Please wait before trying again."},{status:429});
 inFlight=true;lastStarted=Date.now();const client=new StitchToolClient({apiKey:s.STITCH_API_KEY,timeout:180000});
 try{const stitch=new Stitch(client);const project=s.STITCH_PROJECT_ID?stitch.project(s.STITCH_PROJECT_ID):await stitch.createProject("Measure Flow demo");
 const screen=await project.generate(`Design one polished mobile recovery screen. Warm white background, olive buttons, editorial typography, accessible contrast. ${prompts[scenario]} This is a design proposal, not implemented business behavior.`,"MOBILE");
 const image=await screen.getImage();if(!image)throw Error("MISSING_IMAGE");
 const url=new URL(image);if(url.protocol!=="https:"||!(url.hostname.endsWith(".googleusercontent.com")||url.hostname==="storage.googleapis.com"||url.hostname.endsWith(".gstatic.com")))throw Error("UNEXPECTED_ASSET_HOST");
 return Response.json({image:url.href,source:"stitch",projectId:project.id,screenId:screen.id},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"Stitch could not return a preview. Check server credentials or use the prepared example. A timed-out request may still complete in Stitch; no automatic retry was made."},{status:502});}
 finally{inFlight=false;await client.close().catch(()=>{});}
}
