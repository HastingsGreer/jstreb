(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function o(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=o(a);fetch(a.href,i)}})();function te(e,t){const o=e.length,n=e[0].length,a=new Array(o).fill(0).map(()=>new Array(o));for(let l=0;l<o;l++){var i=e[l];for(let c=0;c<o;c++){var s=0,r=t[c];for(let f=0;f<n;f++)s+=i[f]*r[f];a[l][c]=s}}return a}function H(e,t){const o=e.length,n=e[0].length,a=new Array(o).fill(0).map(()=>new Array(n));for(let i=0;i<o;i++){let s=a[i],r=e[i];for(let l=0;l<n;l++)s[l]=r[l]/t[l]}return a}function E(e,t){const o=new Array(t.length);for(var n=0;n<t.length;n++)o[n]=t[n]*e;return o}function P(e){const t=new Array(e[0].length);for(var o=0;o<e[0].length;o++){for(var n=0,a=0;a<e.length;a++)n+=e[a][o];t[o]=n}return t}function $(e,t){return[e[0]-t[0],e[1]-t[1]]}function ae(e,t){return new Array(e.length).fill(0).map((o,n)=>e[n]-t[n])}function ne(e,t){const o=e.length,n=e[0].length,a=t.length,i=t[0].length;n!=a&&(console.log(n),console.log(a),assert(n==a));const s=new Array(o).fill(0).map(()=>new Array(i).fill(0));for(let r=0;r<o;r++)for(let l=0;l<i;l++)for(let c=0;c<n;c++)s[r][l]+=e[r][c]*t[c][l];return s}function oe(e,t){const o=e.length;for(let a=0;a<o;a++){let i=Math.abs(e[a][a]),s=a;for(let c=a+1;c<o;c++)Math.abs(e[c][a])>i&&(i=Math.abs(e[c][a]),s=c);const r=e[s];e[s]=e[a],e[a]=r;const l=t[s];t[s]=t[a],t[a]=l;for(let c=a+1;c<o;c++){const f=-e[c][a]/e[a][a];for(let w=a;w<o;w++)a===w?e[c][w]=0:e[c][w]+=f*e[a][w];t[c]+=f*t[a]}}const n=new Array(o).fill(0);for(let a=o-1;a>-1;a--){n[a]=t[a]/e[a][a];for(let i=a-1;i>-1;i--)t[i]-=e[i][a]*n[a]}return n}function T(e){var t=Math.sqrt(e[0]*e[0]+e[1]*e[1]);return[e[0]/t,e[1]/t]}function U(e,t){return e[0]*t[1]-e[1]*t[0]}function p(e,t){return[e[2*t],e[2*t+1]]}function y(e,t,o){e[2*o]=t[0],e[2*o+1]=t[1]}function A(e,t,o){this.p1=e,this.p2=t,this.oneway=o}function O(e,t,o){this.p1=e,this.p2=t,this.p3=o}function N(e,t,o){this.reference=e,this.slide=t,this.base=o,this.fatmode=!1}function z(e,t,o,n){this.reference=e,this.slide=t,this.base=o,this.oneway=n}function F(e,t,o){this.p=e,this.n=T(t),this.oneway=o}function ie(e,t,o,n){this.forces=Array(t.length).fill([0,-1]).flat(),this.constraints=e,this.masses=t.flatMap(a=>[a,a]),this.positions=o,this.velocities=n}function W(e,t,o,n,a){var i=Date.now();let s=[],r=[],l=[];for(var c of e)s.push(c.mass),r.push(c.x),r.push(c.y);for(var f of t.rod)l.push(new A(f.p1,f.p2,f.oneway));for(var w of t.slider)l.push(new F(w.p,[w.normal.x,w.normal.y],w.oneway));for(var h of t.colinear)l.push(new z(h.reference,h.slider,h.base,h.oneway));for(var v of t.f2k)l.push(new N(v.reference,v.slider,v.base));for(var m of t.rope)l.push(new O(m.p1,m.p2,m.p3));var g=new ie(l,s,r,new Array(r.length).fill(0));g.terminate=a;let C=g.positions.concat(g.velocities),j=re(g,C,o,n);var B=Date.now();return document.getElementById("simtime").innerText=B-i,j}function re(e,t,o,n){for(var a=t,i=0,s=o,r=[],l=!1;i<n&&!l;){i+=s;var[c,h]=I(e,a),[f,h]=I(e,P([a,E(s/2,c)])),[w,h]=I(e,P([a,E(s/2,f)])),[v,l]=I(e,P([a,E(s,w)]));a=P([a,E(s/6,P([c,E(2,f),E(2,w),v]))]),r.push(a)}return r}function se(e){var t=e.constraints.map(r=>{if(r instanceof A)return le(r,e);if(r instanceof F)return ce(r,e);if(r instanceof z)return fe(r,e);if(r instanceof N)return he(r,e);if(r instanceof O)return pe(r,e)}),o=H(t,e.masses);o=te(o,t);var n=e.constraints.map(r=>{if(r instanceof A)return de(r,e);if(r instanceof F)return ue(r,e);if(r instanceof z)return me(r,e);if(r instanceof N)return ve(r,e);if(r instanceof O)return we(r,e)});let a=oe(o,n),i=ae(H(ne([a],t),e.masses)[0],e.forces);for(var s=0;s<a.length;s++)if(a[s]>0&&e.constraints[s].oneway===!0){e.constraints.splice(s,1);break}return[i,!1]}function I(e,t){e.positions=t.slice(0,e.positions.length),e.velocities=t.slice(e.positions.length,t.length);let[o,n]=se(e);if(e.terminate(t)){for(var a=0;a<e.constraints.length;a++)if(e.constraints[a].p1===3||e.constraints[a].p2===3||e.constraints[a].p3===3){e.constraints.splice(a,1);break}}return[e.velocities.concat(o),!1]}function le(e,t){let o=T($(p(t.positions,e.p1),p(t.positions,e.p2))),n=new Array(t.positions.length).fill(0);return y(n,o,e.p2),y(n,[-o[0],-o[1]],e.p1),n}function ce(e,t){let o=new Array(t.positions.length).fill(0);return y(o,e.n,e.p),o}function de(e,t){let o=$(p(t.positions,e.p1),p(t.positions,e.p2)),n=$(p(t.velocities,e.p1),p(t.velocities,e.p2)),a=Math.sqrt(o[0]*o[0]+o[1]*o[1]);return(n[0]*n[0]+n[1]*n[1])/a}function pe(e,t){let o=T($(p(t.positions,e.p1),p(t.positions,e.p2))),n=T($(p(t.positions,e.p2),p(t.positions,e.p3))),a=new Array(t.positions.length).fill(0);return y(a,[-o[0],-o[1]],e.p1),y(a,$(o,n),e.p2),y(a,n,e.p3),a}function we(e,t){let o=$(p(t.positions,e.p1),p(t.positions,e.p2)),n=$(p(t.velocities,e.p1),p(t.velocities,e.p2)),a=Math.sqrt(o[0]*o[0]+o[1]*o[1]),i=$(p(t.positions,e.p2),p(t.positions,e.p3)),s=$(p(t.velocities,e.p2),p(t.velocities,e.p3)),r=Math.sqrt(i[0]*i[0]+i[1]*i[1]);return Math.pow(U(o,n),2)/(a*a*a)+Math.pow(U(i,s),2)/(r*r*r)}function ue(e,t){var o=p(t.forces,e.p);return e.n[0]*o[0]+e.n[1]*o[1]}function fe(e,t){var[o,n]=p(t.positions,e.slide);p(t.velocities,e.slide);var[a,i]=p(t.positions,e.reference);p(t.velocities,e.reference);var[s,r]=p(t.positions,e.base);p(t.velocities,e.base),o=o-s,n=n-r,a=a-s,i=i-r;var l=Math.sqrt(a*a+i*i),c=l*l*l,f=-i/l,w=a/l,h=(o*a*i+n*i*i)/c,v=-(o*a*a+a*n*i)/c,m=-f-h,g=-w-v;let C=new Array(t.positions.length).fill(0);return y(C,[f,w],e.slide),y(C,[h,v],e.reference),y(C,[m,g],e.base),C}function me(e,t){var[o,n]=p(t.positions,e.slide),[a,i]=p(t.velocities,e.slide),[s,r]=p(t.positions,e.reference),[l,c]=p(t.velocities,e.reference),[f,w]=p(t.positions,e.base),[h,v]=p(t.velocities,e.base);o=o-f,n=n-w,a=a-h,i=i-v,s=s-f,r=r-w,l=l-h,c=c-v;var m=Math.sqrt(s*s+r*r),g=(2*l*o*s*s-2*a*s*s*s-c*s*s*n+3*c*o*s*r-2*i*s*s*r+3*l*s*n*r-l*o*r*r-2*a*s*r*r+2*c*n*r*r-2*i*r*r*r)*(c*s-l*r)/(m*m*m*m*m);return-g}function he(e,t){var[o,n]=p(t.positions,e.slide);p(t.velocities,e.slide);var[a,i]=p(t.positions,e.reference);p(t.velocities,e.reference);var[s,r]=p(t.positions,e.base);p(t.velocities,e.base),o=o-s,n=n-r,a=a-s,i=i-r;let l=new Array(t.positions.length).fill(0);if(i<0){if(!e.fatmode){var c=o,f=a-o;e.ratio=c/f}e.fatmode=!0}if(e.fatmode)return y(l,[0,1],e.base),y(l,[0,e.ratio],e.reference),l;var w=Math.sqrt(a*a+i*i),h=w*w*w,v=-i/w,m=a/w,g=(o*a*i+n*i*i)/h,C=-(o*a*a+a*n*i)/h,j=-v-g,B=-m-C;return y(l,[v,m],e.slide),y(l,[g,C],e.reference),y(l,[j,B],e.base),l}function ve(e,t){if(e.fatmode)return-1-e.ratio;var[o,n]=p(t.positions,e.slide),[a,i]=p(t.velocities,e.slide),[s,r]=p(t.positions,e.reference),[l,c]=p(t.velocities,e.reference),[f,w]=p(t.positions,e.base),[h,v]=p(t.velocities,e.base);o=o-f,n=n-w,a=a-h,i=i-v,s=s-f,r=r-w,l=l-h,c=c-v;var m=Math.sqrt(s*s+r*r),g=(2*l*o*s*s-2*a*s*s*s-c*s*s*n+3*c*o*s*r-2*i*s*s*r+3*l*s*n*r-l*o*r*r-2*a*s*r*r+2*c*n*r*r-2*i*r*r*r)*(c*s-l*r)/(m*m*m*m*m);return-g}const u=document.getElementById("mechanism"),d=u.getContext("2d");window.data={duration:50,timestep:1,projectile:3,mainaxle:0,armtip:1,axleheight:8,particles:[{x:100,y:100,mass:1,hovered:!1}],constraints:{rod:[],slider:[]}};async function xe(){return new Promise(e=>{setTimeout(()=>{e()},1)})}async function ye(){await new Promise(e=>{requestAnimationFrame(()=>{e()})})}async function ge(){if(window.data.timestep!=0){var e=JSON.stringify(window.data),t=W(window.data.particles,window.data.constraints,window.data.timestep,window.data.duration,D);window.data.timestep=0;for(var o of[window.data.constraints.rod,window.data.constraints.slider])for(var n=o.length,a=0;a<n;a++)o[a].oneway&&(o.splice(a,1),a-=1,n-=1);for(var i of t){for(var a=0;a<window.data.particles.length;a++)window.data.particles[a].x=i[2*a],window.data.particles[a].y=i[2*a+1];x(),await ye()}window.data=JSON.parse(e),x()}}function D(e){e[2*window.data.armtip]-e[2*window.data.projectile],e[2*window.data.armtip+1]-e[2*window.data.projectile+1],e[2*window.data.armtip]-e[2*window.data.mainaxle],e[2*window.data.armtip+1]-e[2*window.data.mainaxle+1];var t=e[2*window.data.projectile+2*window.data.particles.length],o=e[2*window.data.projectile+2*window.data.particles.length+1];return t>40&&o>-15}function K(){const e=W(window.data.particles,window.data.constraints,window.data.timestep,window.data.duration,D);var t=-window.data.particles[window.data.mainaxle].y,o=-window.data.particles[window.data.mainaxle].y,n=0;for(var a of e){for(var i=0;i<window.data.particles.length;i++)a[2*i]<2e3&&(o=Math.min(o,-a[2*i+1])),t=Math.max(t,-a[2*window.data.mainaxle+1]);n=Math.max(n,2*Math.max(0,-a[2*window.data.particles.length+2*window.data.projectile+1])*a[2*window.data.particles.length+2*window.data.projectile])}var s=t-o,r=Math.sqrt(Math.pow(window.data.particles[window.data.armtip].x-window.data.particles[window.data.mainaxle].x,2)+Math.pow(window.data.particles[window.data.armtip].y-window.data.particles[window.data.projectile].y,2));return n=n/Math.max(s,.75*r)*window.data.axleheight,[e,n]}function x(){if(Q(),d.save(),d.setTransform(1,0,0,1,0,0),d.clearRect(0,0,u.width,u.height),d.restore(),window.data.particles.length>1&&window.data.constraints.rod.length+window.data.constraints.slider.length>1&&window.data.timestep>0&&typeof window.data.timestep=="number"){var[e,t]=K();document.getElementById("range").innerText=t,e.forEach(o=>{for(let n=0;n<window.data.constraints.rod.length;n++)if(window.data.constraints.rod[n].oneway!=!0){const a=window.data.constraints.rod[n],i=a.p1*2,s=a.p2*2;d.beginPath(),d.moveTo(o[i],o[i+1]),d.lineTo(o[s],o[s+1]),d.strokeStyle="rgba(255, 0, 0, 0.2)",d.stroke()}for(let n=0;n<window.data.constraints.rope.length;n++)if(window.data.constraints.rope[n].oneway!=!0){const a=window.data.constraints.rope[n],i=a.p1*2,s=a.p2*2,r=a.p3*2;d.beginPath(),d.moveTo(o[i],o[i+1]),d.lineTo(o[s],o[s+1]),d.lineTo(o[r],o[r+1]),d.strokeStyle="rgba(255, 0, 0, 0.2)",d.stroke()}}),d.strokeStyle="black"}window.data.particles.forEach((o,n)=>{const a=Math.cbrt(o.mass)*4;d.beginPath(),d.arc(o.x,o.y,a,0,Math.PI*2),d.fillStyle=o.hovered?"yellow":"black",d.strokeStyle="black",d.fill(),d.stroke(),d.font="18px Arial",d.textAlign="center",d.textBaseline="middle",d.fillStyle="black",d.fillText(`P${n+1}`,o.x,o.y-a-10)}),d.lineWidth=3,window.data.constraints.rod.forEach(o=>{const n=window.data.particles[o.p1],a=window.data.particles[o.p2];d.beginPath(),d.moveTo(n.x,n.y),d.lineTo(a.x,a.y),d.strokeStyle=o.hovered?"blue":"black",d.stroke()}),window.data.constraints.rope.forEach(o=>{const n=window.data.particles[o.p1],a=window.data.particles[o.p2],i=window.data.particles[o.p3];d.setLineDash([8,8]),d.beginPath(),d.moveTo(n.x,n.y),d.lineTo(a.x,a.y),d.lineTo(i.x,i.y),d.strokeStyle=o.hovered?"blue":"black",d.stroke(),d.setLineDash([])}),window.data.constraints.slider.forEach(o=>{const n=window.data.particles[o.p],a=40,i=Math.atan2(o.normal.y,o.normal.x)+Math.PI/2;d.beginPath(),d.moveTo(n.x-a*Math.cos(i),n.y-a*Math.sin(i)),d.lineTo(n.x+a*Math.cos(i),n.y+a*Math.sin(i)),d.strokeStyle=o.hovered?"red":"black",d.stroke()}),window.data.constraints.colinear.concat(window.data.constraints.f2k).forEach(o=>{const n=window.data.particles[o.base],a=window.data.particles[o.reference],i=window.data.particles[o.slider],s=Math.sqrt((n.x-a.x)*(n.x-a.x)+(n.y-a.y)*(n.y-a.y)),r=(n.x-a.x)/s,l=(n.y-a.y)/s,c=Math.abs(r*(n.y-i.y)-l*(n.x-i.x));d.beginPath(),d.arc(i.x,i.y,c,0,Math.PI*2),d.strokeStyle="grey",d.stroke()}),d.lineWidth=1}function be(){const e={x:100,y:100,mass:1,hovered:!1};window.data.particles.push(e),b()}function $e(e,t,o){window.data.particles[e][t]=Number(o),x()}function Ce(e){window.data.particles.splice(e,1),b()}function Me(e){window.data.constraints[e].length;let t={};if(e==="rod"){if(window.data.particles.length<2){alert("At least two particles are required to create a rod constraint.");return}var o=[];for(let n=0;n<window.data.particles.length;n++)for(let a=0;a<window.data.particles.length;a++)S(n,a)||o.push([n,a]);t={p1:o[0][0],p2:o[0][1],hovered:!1},window.data.constraints.rod.push(t)}else if(e==="slider"){if(window.data.particles.length<1){alert("At least one particle is required to create a slider constraint.");return}t={p:0,normal:{x:0,y:1},hovered:!1},window.data.constraints.slider.push(t)}else if(e==="colinear")t={reference:0,slider:1,base:2},window.data.constraints.colinear.push(t);else if(e==="f2k")t={reference:0,slider:1,base:2},window.data.constraints.f2k.push(t);else if(e==="rope")t={p1:0,p2:1,p2:3},window.data.constraints.rope.push(t);else{console.error("Unknown constraint type:",e);return}b()}function Ee(e,t,o,n){const a=n.includes("normal")?parseFloat(e.value):parseInt(e.value),i=window.data.constraints[t][o];n==="p1"||n==="p2"||n==="p"?(i[n]=a,b()):n==="normalX"||n==="normalY"?(i.normal[n.slice(-1).toLowerCase()]=a,x()):(i[n]=a,b())}function _e(e,t){window.data.constraints[e].splice(t,1),b()}function Y(){u.width=window.innerWidth-600,u.height=window.innerHeight,b()}function b(){x(),document.getElementById("timestep").value=window.data.timestep,document.getElementById("duration").value=window.data.duration;const e=document.getElementById("particlesControl");for(;e.children.length>1;)e.removeChild(e.lastChild);window.data.particles.forEach((l,c)=>Z(c));const t=document.getElementById("constraintsControl");for(;t.children.length>5;)t.removeChild(t.lastChild);window.data.constraints.rod.forEach((l,c)=>_("rod",c)),window.data.constraints.slider.forEach((l,c)=>_("slider",c)),window.data.constraints.colinear.forEach((l,c)=>_("colinear",c)),window.data.constraints.f2k.forEach((l,c)=>_("f2k",c)),window.data.constraints.rope.forEach((l,c)=>_("rope",c));const o=document.getElementById("presets");for(;o.children.length>0;)o.removeChild(o.lastChild);const n=document.createElement("option");n.selected="true",n.innerHTML="Presets",o.appendChild(n);for(var a of Object.keys(presets)){const l=document.createElement("option");l.innerHTML=a,l.value=a,o.appendChild(l)}for(var i of["armtip","projectile","mainaxle"]){for(var s=document.getElementById(i);s.children.length>0;)s.removeChild(s.lastChild);for(var r=0;r<window.data.particles.length;r++){const l=document.createElement("option");l.selected=window.data[i]==r,l.innerHTML=`P ${r+1}`,l.value=r,s.appendChild(l)}}document.getElementById("axleheight").value=window.data.axleheight}function V(e){window.data=JSON.parse(window.presets[e.value]),window.data.constraints.colinear===void 0&&(window.data.constraints.colinear=[]),window.data.constraints.f2k===void 0&&(window.data.constraints.f2k=[]),window.data.constraints.rope===void 0&&(window.data.constraints.rope=[]),b()}function Z(e){const t=document.createElement("div");t.className="control-box",t.innerHTML=`
                <label>Mass: <input type="text" min="1" max="500" value="${window.data.particles[e].mass}" oninput="updateParticle(${e}, 'mass', this.value)"></label>
                <label>X: <input type="text" min="0" max="${u.width}" value="${window.data.particles[e].x}" oninput="updateParticle(${e}, 'x', this.value)"></label>
                <label>Y: <input type="text" min="0" max="${u.height}" value="${window.data.particles[e].y}" oninput="updateParticle(${e}, 'y', this.value)"></label>
                <button onclick="deleteParticle(${e})">X</button>
              `,t.addEventListener("mouseenter",()=>{window.data.particles[e].hovered=!0,x()}),t.addEventListener("mouseleave",()=>{window.data.particles[e].hovered=!1,x()}),document.getElementById("particlesControl").appendChild(t)}function S(e,t){if(e==t)return!0;for(var o of window.data.constraints.rod)if(o.p1==e&&o.p2==t||o.p1==t&&o.p2==e||e==t)return!0;return!1}function _(e,t){const o=document.createElement("div");if(o.className="control-box",o.dataset.type=e,o.dataset.index=t,e==="rod")o.innerHTML=`Rod
                    <select name="p1" onchange="updateConstraint(this, 'rod', ${t}, 'p1')">
            	   ${window.data.particles.map((n,a)=>a).filter(n=>!S(window.data.constraints.rod[t].p2,n)||n==window.data.constraints.rod[t].p1).map(n=>`<option value="${n}" ${n===window.data.constraints.rod[t].p1?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                    <select name="p2" onchange="updateConstraint(this, 'rod', ${t}, 'p2')">
            	   ${window.data.particles.map((n,a)=>a).filter(n=>!S(window.data.constraints.rod[t].p1,n)||n==window.data.constraints.rod[t].p2).map(n=>`<option value="${n}" ${n===window.data.constraints.rod[t].p2?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                  <button onclick="deleteConstraint('rod', ${t})">Delete</button>
            			<input type="checkbox" oninput="window.data.constraints.rod[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.rod[t].oneway?"checked":""}></input>
                `;else if(e==="slider"){const n=window.data.constraints.slider[t];o.innerHTML=`
                  <label>
            		Slider
                    <select name="p" onchange="updateConstraint(this, 'slider', ${t}, 'p')">
                      ${window.data.particles.map((a,i)=>`<option value="${i}" ${i===n.p?"selected":""}>P ${i+1}</option>`).join("")}
                    </select>
                  </label>
                  <label>Normal X: <input type="range" name="normalX" min="-1" max="1" step="0.1" value="${n.normal.x}" oninput="updateConstraint(this, 'slider', ${t}, 'normalX')"></label>
                  <label>Normal Y: <input type="range" name="normalY" min="-1" max="1" step="0.1" value="${n.normal.y}" oninput="updateConstraint(this, 'slider', ${t}, 'normalY')"></label>
                  <button onclick="deleteConstraint('slider', ${t})">Delete</button>
            			<input type="checkbox" oninput="window.data.constraints.slider[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.slider[t].oneway?"checked":""}></input>
                `}else e==="colinear"?o.innerHTML=`Roller Track1
                    <select name="reference" onchange="updateConstraint(this, 'colinear', ${t}, 'reference')">
            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.colinear[t].reference?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Slide
                    <select name="slider" onchange="updateConstraint(this, 'colinear', ${t}, 'slider')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.colinear[t].slider?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Track2
                    <select name="base" onchange="updateConstraint(this, 'colinear', ${t}, 'base')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.colinear[t].base?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                  <button onclick="deleteConstraint('colinear', ${t})">Delete</button>
            			<input type="checkbox" oninput="window.data.constraints.colinear[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.colinear[t].oneway?"checked":""}></input>
                `:e==="f2k"?o.innerHTML=`F2k Arm Tip
                    <select name="reference" onchange="updateConstraint(this, 'f2k', ${t}, 'reference')">
            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.f2k[t].reference?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Roller 
                    <select name="slider" onchange="updateConstraint(this, 'f2k', ${t}, 'slider')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.f2k[t].slider?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Arm Base
                    <select name="base" onchange="updateConstraint(this, 'f2k', ${t}, 'base')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.f2k[t].base?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                  <button onclick="deleteConstraint('f2k', ${t})">Delete</button>
            			<input type="checkbox" oninput="window.data.constraints.f2k[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.f2k[t].oneway?"checked":""}></input>
                `:e==="rope"&&(o.innerHTML=`Rope and pulley.
Fixed end:

                    <select name="p1" onchange="updateConstraint(this, 'rope', ${t}, 'p1')">
            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.rope[t].p1?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Pulley:
                    <select name="p2" onchange="updateConstraint(this, 'rope', ${t}, 'p2')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.rope[t].p2?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    Fixed end:
                    <select name="p3" onchange="updateConstraint(this, 'rope', ${t}, 'p3')">

            	   ${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.rope[t].p3?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                  <button onclick="deleteConstraint('rope', ${t})">Delete</button>
            			<input type="checkbox" oninput="window.data.constraints.rope[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.rope[t].oneway?"checked":""}></input>
                `);o.addEventListener("mouseenter",()=>{window.data.constraints[e][t].hovered=!0,x()}),o.addEventListener("mouseleave",()=>{window.data.constraints[e][t].hovered=!1,x()}),document.getElementById("constraintsControl").appendChild(o)}let M=null;function G(e,t){return window.data.particles.findIndex(o=>{const n=Math.sqrt((o.x-e)**2+(o.y-t)**2),a=Math.cbrt(o.mass)*10;return n<a})}u.addEventListener("mousedown",function(e){const t=u.getBoundingClientRect(),o=u.width/t.width,n=u.height/t.height,a=(e.clientX-t.left)*o,i=(e.clientY-t.top)*n,s=G(a,i);s!==-1?(M=s,u.style.cursor="move"):(q=e.clientX-u.offsetLeft,R=e.clientY-u.offsetTop)});let k=1;const Pe=.001;u.addEventListener("wheel",function(e){e.preventDefault(),k+=e.deltaY*-Pe,k=Math.min(Math.max(.125,k),4),d.setTransform(k,0,0,k,0,0),x()});let X=!1,q=0,R=0;u.addEventListener("mousemove",function(e){if(X){const t=e.clientX-u.offsetLeft,o=e.clientY-u.offsetTop,n=t-q,a=o-R;d.translate(n,a),x(),q=t,R=o}});u.addEventListener("mouseup",function(e){X=!1});u.addEventListener("mouseleave",function(e){X=!1});u.addEventListener("mousemove",function(e){if(M!==null){const t=u.getBoundingClientRect(),o=u.width/t.width,n=u.height/t.height,a=(e.clientX-t.left)*o,i=(e.clientY-t.top)*n;window.data.particles[M].x=a,window.data.particles[M].y=i,x()}});u.addEventListener("mouseup",function(e){M!==null&&(b(),M=null,u.style.cursor="default")});u.addEventListener("mouseleave",function(e){M!==null&&(b(),M=null,u.style.cursor="default")});function Q(){localStorage.setItem("mechanismData",JSON.stringify(window.data))}function ee(){const e=localStorage.getItem("mechanismData");e?(window.data=JSON.parse(e),b()):V({value:"Hinged Counterweight"})}window.addEventListener("resize",Y);window.onload=()=>{ee(),Y()};presets={"Hinged Counterweight":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":588,"y":440.7,"mass":10},{"x":668,"y":673.6,"mass":1},{"x":586,"y":533.7,"mass":100}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Fixed Counterweight":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":668,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Floating Arm Trebuchet":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":487.0,"y":517.0,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":589,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',F2k:'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.6,"duration":35,"particles":[{"x":454,"y":516,"mass":1},{"x":436.6,"y":513.0,"mass":4},{"x":560.3,"y":211.5,"mass":100},{"x":652.9,"y":621.8,"mass":1}],"constraints":{"rod":[{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":1,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":0,"normal":{"x":0,"y":1}}],"colinear":[],"f2k":[{"reference":1,"slider":0,"base":2}],"rope":[]}}',"Floating Arm Whipper (NASAW)":'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":37,"particles":[{"x":496.3,"y":477.6,"mass":1},{"x":677.5,"y":471.0,"mass":4},{"x":468.0,"y":453.5,"mass":10},{"x":557.0,"y":431.8,"mass":1},{"x":563.0,"y":340.7,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":4,"normal":{"x":0.6,"y":0}}],"colinear":[]}}',Whipper:'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3,"duration":60,"particles":[{"x":536,"y":472.7,"mass":1},{"x":759,"y":451,"mass":4},{"x":483,"y":498,"mass":10},{"x":551,"y":434,"mass":1},{"x":560,"y":368,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":0}}]}}',Fiffer:'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":20,"particles":[{"x":536,"y":472.7,"mass":1},{"x":484,"y":656,"mass":4},{"x":504,"y":433,"mass":10},{"x":644,"y":661,"mass":1},{"x":653,"y":451,"mass":10},{"x":749,"y":428,"mass":1},{"x":749,"y":483,"mass":500},{"x":566,"y":505,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":7,"p2":6},{"p1":6,"p2":4},{"p1":4,"p2":5}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":7,"normal":{"x":0.7,"y":1}},{"p":7,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0.7,"y":1}}]}}',"Floating Arm King Arthur":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":40,"particles":[{"x":536,"y":472.7,"mass":1},{"x":527,"y":610,"mass":4},{"x":534,"y":418,"mass":10},{"x":698,"y":608,"mass":1},{"x":560,"y":331,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":-0.5,"y":0},"oneway":true},{"p":1,"normal":{"x":0.7,"y":0},"oneway":true},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Launch Ness Monster":'{"projectile":3,"mainaxle":2,"armtip":1,"axleheight":8,"timestep":0.3,"duration":80,"particles":[{"x":600.7,"y":746.2,"mass":10},{"x":559.1,"y":774.0,"mass":4},{"x":660.2,"y":530.0,"mass":100},{"x":703.9,"y":796.7,"mass":1},{"x":810,"y":530,"mass":10},{"x":552,"y":500,"mass":10},{"x":458,"y":666,"mass":10},{"x":886.1,"y":662.4,"mass":10}],"constraints":{"rod":[{"p1":2,"p2":1},{"p1":3,"p2":1,"hovered":true},{"p1":6,"p2":5},{"p1":5,"p2":2},{"p1":4,"p2":2},{"p1":4,"p2":7},{"p1":5,"p2":4}],"slider":[{"p":0,"normal":{"x":1,"y":2.1}},{"p":0,"normal":{"x":-0.6,"y":1.6}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":6,"normal":{"x":0.6,"y":1}},{"p":6,"normal":{"x":0,"y":1}},{"p":7,"normal":{"x":1,"y":1}},{"p":7,"normal":{"x":0,"y":1}}],"colinear":[{"reference":1,"slider":0,"base":2}]}}',"Pulley Sling":'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":35,"particles":[{"x":546.3,"y":584.3,"mass":1},{"x":285.6,"y":791.6,"mass":4},{"x":560.6,"y":481.2,"mass":10},{"x":1000.9,"y":742.8,"mass":1},{"x":645.5,"y":541.0,"mass":500},{"x":72.7,"y":730.2,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":true},{"p1":0,"p2":2},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":5,"normal":{"x":1,"y":1}},{"p":5,"normal":{"x":0,"y":1}}],"colinear":[],"rope":[{"p1":5,"p2":1,"p3":3}]}}'};let L=!1;var J=0;async function ke(){if(L){L=!1,document.getElementById("optimize").innerText="Optimize",console.log(J);return}document.getElementById("optimize").innerText="Stop",L=!0;for(var e=500,t=e,o=40;L;){J+=1;var n=+document.getElementById("range").innerText,a=JSON.stringify(window.data);for(var i of window.data.particles)Math.random()>.5&&(i.x=i.x+o*(.5-Math.random()),i.y=i.y+o*(.5-Math.random()));var[s,r]=K();t%20==0&&await xe();var l=r;l>n?(t=e,x()):(window.data=JSON.parse(a),t-=1,t==0&&(t=e,o*=.6))}x()}function Ie(){const e=new Blob([JSON.stringify(window.data)],{type:"application/json"}),t=prompt("Enter a filename for your window.data:","window.data.json");if(!t){alert("Save cancelled.");return}const o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download=t,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(o)}function Le(){const e=document.createElement("input");e.type="file",e.onchange=t=>{console.log("asf");const o=t.target.files[0],n=new FileReader;n.onload=a=>{try{window.data=JSON.parse(a.target.result),b()}catch{alert("Error parsing JSON!")}},n.readAsText(o)},document.body.appendChild(e),e.click(),document.body.removeChild(e)}window.doAnimate=ge;window.terminate=D;window.drawMechanism=x;window.createParticle=be;window.updateParticle=$e;window.deleteParticle=Ce;window.createConstraint=Me;window.updateConstraint=Ee;window.deleteConstraint=_e;window.resizeCanvas=Y;window.updateUI=b;window.loadPreset=V;window.createParticleControlBox=Z;window.constraintExists=S;window.createConstraintControlBox=_;window.getParticleAtPosition=G;window.saveMechanism=Q;window.loadMechanism=ee;window.optimize=ke;window.save=Ie;window.load=Le;
