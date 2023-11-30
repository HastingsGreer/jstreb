(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=o(a);fetch(a.href,i)}})();function V(e,t){const o=e.length,n=e[0].length,a=new Array(o).fill(0).map(()=>new Array(o));for(let l=0;l<o;l++){var i=e[l];for(let d=0;d<o;d++){var r=0,s=t[d];for(let u=0;u<n;u++)r+=i[u]*s[u];a[l][d]=r}}return a}function q(e,t){const o=e.length,n=e[0].length,a=new Array(o).fill(0).map(()=>new Array(n));for(let i=0;i<o;i++){let r=a[i],s=e[i];for(let l=0;l<n;l++)r[l]=s[l]/t[l]}return a}function _(e,t){const o=new Array(t.length);for(var n=0;n<t.length;n++)o[n]=t[n]*e;return o}function E(e){const t=new Array(e[0].length);for(var o=0;o<e[0].length;o++){for(var n=0,a=0;a<e.length;a++)n+=e[a][o];t[o]=n}return t}function C(e,t){return[e[0]-t[0],e[1]-t[1]]}function Z(e,t){return new Array(e.length).fill(0).map((o,n)=>e[n]-t[n])}function ee(e,t){const o=e.length,n=e[0].length,a=t.length,i=t[0].length;n!=a&&(console.log(n),console.log(a),assert(n==a));const r=new Array(o).fill(0).map(()=>new Array(i).fill(0));for(let s=0;s<o;s++)for(let l=0;l<i;l++)for(let d=0;d<n;d++)r[s][l]+=e[s][d]*t[d][l];return r}function te(e,t){const o=e.length;for(let a=0;a<o;a++){let i=Math.abs(e[a][a]),r=a;for(let d=a+1;d<o;d++)Math.abs(e[d][a])>i&&(i=Math.abs(e[d][a]),r=d);const s=e[r];e[r]=e[a],e[a]=s;const l=t[r];t[r]=t[a],t[a]=l;for(let d=a+1;d<o;d++){const u=-e[d][a]/e[a][a];for(let w=a;w<o;w++)a===w?e[d][w]=0:e[d][w]+=u*e[a][w];t[d]+=u*t[a]}}const n=new Array(o).fill(0);for(let a=o-1;a>-1;a--){n[a]=t[a]/e[a][a];for(let i=a-1;i>-1;i--)t[i]-=e[i][a]*n[a]}return n}function X(e){var t=Math.sqrt(e[0]*e[0]+e[1]*e[1]);return[e[0]/t,e[1]/t]}function U(e,t){return e[0]*t[1]-e[1]*t[0]}function p(e,t){return[e[2*t],e[2*t+1]]}function b(e,t,o){e[2*o]=t[0],e[2*o+1]=t[1]}function j(e,t,o){this.p1=e,this.p2=t,this.oneway=o}function B(e,t,o){this.p1=e,this.p2=t,this.p3=o}function A(e,t,o){this.reference=e,this.slide=t,this.base=o,this.fatmode=!1}function O(e,t,o,n){this.reference=e,this.slide=t,this.base=o,this.oneway=n}function N(e,t,o){this.p=e,this.n=X(t),this.oneway=o}function ae(e,t,o,n){this.forces=Array(t.length).fill([0,-1]).flat(),this.constraints=e,this.masses=t.flatMap(a=>[a,a]),this.positions=o,this.velocities=n}function D(e,t,o,n,a){var i=Date.now();let r=[],s=[],l=[];for(var d of e)r.push(d.mass),s.push(d.x),s.push(d.y);for(var u of t.rod)l.push(new j(u.p1,u.p2,u.oneway));for(var w of t.slider)l.push(new N(w.p,[w.normal.x,w.normal.y],w.oneway));for(var h of t.colinear)l.push(new O(h.reference,h.slider,h.base,h.oneway));for(var v of t.f2k)l.push(new A(v.reference,v.slider,v.base));for(var m of t.rope)l.push(new B(m.p1,m.pulleys.slice(),m.p3));var y=new ae(l,r,s,new Array(s.length).fill(0));y.terminate=a;let g=y.positions.concat(y.velocities),k=ne(y,g,o,n);var S=Date.now();return document.getElementById("simtime").innerText=S-i,k}function ne(e,t,o,n){for(var a=t,i=0,r=o,s=[],l=!1;i<n&&!l;){i+=r;var[d,h]=T(e,a),[u,h]=T(e,E([a,_(r/2,d)])),[w,h]=T(e,E([a,_(r/2,u)])),[v,l]=T(e,E([a,_(r,w)]));a=E([a,_(r/6,E([d,_(2,u),_(2,w),v]))]),s.push(a)}return s}function oe(e){var t=e.constraints.map(s=>{if(s instanceof j)return ie(s,e);if(s instanceof N)return re(s,e);if(s instanceof O)return pe(s,e);if(s instanceof A)return ue(s,e);if(s instanceof B)return le(s,e)}),o=q(t,e.masses);o=V(o,t);var n=e.constraints.map(s=>{if(s instanceof j)return se(s,e);if(s instanceof N)return ce(s,e);if(s instanceof O)return we(s,e);if(s instanceof A)return fe(s,e);if(s instanceof B)return de(s,e)});let a=te(o,n),i=Z(q(ee([a],t),e.masses)[0],e.forces);for(var r=0;r<a.length;r++)if(a[r]>0&&e.constraints[r].oneway===!0){e.constraints.splice(r,1);break}return[i,!1]}function T(e,t){e.positions=t.slice(0,e.positions.length),e.velocities=t.slice(e.positions.length,t.length);let[o,n]=oe(e);if(e.terminate(t)){for(var a=window.data.projectile,i=0;i<e.constraints.length;i++)if(e.constraints[i].p1===a||e.constraints[i].p2===a||e.constraints[i].p3===a){e.constraints.splice(i,1);break}}return[e.velocities.concat(o),!1]}function ie(e,t){let o=X(C(p(t.positions,e.p1),p(t.positions,e.p2))),n=new Array(t.positions.length).fill(0);return b(n,o,e.p2),b(n,[-o[0],-o[1]],e.p1),n}function re(e,t){let o=new Array(t.positions.length).fill(0);return b(o,e.n,e.p),o}function se(e,t){let o=C(p(t.positions,e.p1),p(t.positions,e.p2)),n=C(p(t.velocities,e.p1),p(t.velocities,e.p2)),a=Math.sqrt(o[0]*o[0]+o[1]*o[1]);return(n[0]*n[0]+n[1]*n[1])/a}function le(e,t){var o=[];o.push(e.p1);for(var n of e.p2)o.push(n.idx);o.push(e.p3);for(var a=1;a<o.length-1;a++){var i=p(t.positions,o[a-1]),r=p(t.positions,o[a]),s=p(t.positions,o[a+1]),l=U(C(i,r),C(r,s));if(l>0&&e.p2[a-1].wrapping=="ccw"||l<0&&e.p2[a-1].wrapping=="cw"){e.p2.splice(a-1,1);break}}o=[],o.push(e.p1);for(var n of e.p2)o.push(n.idx);o.push(e.p3);let d=new Array(t.positions.length).fill(0);for(var a=0;a<o.length-1;a++){let w=o[a],h=o[a+1],v=X(C(p(t.positions,w),p(t.positions,h))),m=p(d,w);b(d,C(m,v),w),b(d,v,h)}return d}function de(e,t){var o=0,n=[];n.push(e.p1);for(var a of e.p2)n.push(a.idx);n.push(e.p3);for(var i=0;i<n.length-1;i++){let r=n[i],s=n[i+1],l=C(p(t.positions,r),p(t.positions,s)),d=C(p(t.velocities,r),p(t.velocities,s)),u=Math.sqrt(l[0]*l[0]+l[1]*l[1]);o+=Math.pow(U(l,d),2)/(u*u*u)}return o}function ce(e,t){var o=p(t.forces,e.p);return e.n[0]*o[0]+e.n[1]*o[1]}function pe(e,t){var[o,n]=p(t.positions,e.slide);p(t.velocities,e.slide);var[a,i]=p(t.positions,e.reference);p(t.velocities,e.reference);var[r,s]=p(t.positions,e.base);p(t.velocities,e.base),o=o-r,n=n-s,a=a-r,i=i-s;var l=Math.sqrt(a*a+i*i),d=l*l*l,u=-i/l,w=a/l,h=(o*a*i+n*i*i)/d,v=-(o*a*a+a*n*i)/d,m=-u-h,y=-w-v;let g=new Array(t.positions.length).fill(0);return b(g,[u,w],e.slide),b(g,[h,v],e.reference),b(g,[m,y],e.base),g}function we(e,t){var[o,n]=p(t.positions,e.slide),[a,i]=p(t.velocities,e.slide),[r,s]=p(t.positions,e.reference),[l,d]=p(t.velocities,e.reference),[u,w]=p(t.positions,e.base),[h,v]=p(t.velocities,e.base);o=o-u,n=n-w,a=a-h,i=i-v,r=r-u,s=s-w,l=l-h,d=d-v;var m=Math.sqrt(r*r+s*s),y=r/m,g=s/m,k=(d*y-l*g)*(((2*l*o-d*n)*y*y+(d*o+l*n)*3*y*g+(2*d*n-l*o)*g*g)/(m*m)-2*(a*y+i*g)/m);return-k}function ue(e,t){var[o,n]=p(t.positions,e.slide);p(t.velocities,e.slide);var[a,i]=p(t.positions,e.reference);p(t.velocities,e.reference);var[r,s]=p(t.positions,e.base);p(t.velocities,e.base),o=o-r,n=n-s,a=a-r,i=i-s;let l=new Array(t.positions.length).fill(0);if(i<0){if(!e.fatmode){var d=o,u=a-o;e.ratio=d/u}e.fatmode=!0}if(e.fatmode)return b(l,[0,1],e.base),b(l,[0,e.ratio],e.reference),l;var w=Math.sqrt(a*a+i*i),h=w*w*w,v=-i/w,m=a/w,y=(o*a*i+n*i*i)/h,g=-(o*a*a+a*n*i)/h,k=-v-y,S=-m-g;return b(l,[v,m],e.slide),b(l,[y,g],e.reference),b(l,[k,S],e.base),l}function fe(e,t){if(e.fatmode)return-1-e.ratio;var[o,n]=p(t.positions,e.slide),[a,i]=p(t.velocities,e.slide),[r,s]=p(t.positions,e.reference),[l,d]=p(t.velocities,e.reference),[u,w]=p(t.positions,e.base),[h,v]=p(t.velocities,e.base);o=o-u,n=n-w,a=a-h,i=i-v,r=r-u,s=s-w,l=l-h,d=d-v;var m=Math.sqrt(r*r+s*s),y=(2*l*o*r*r-2*a*r*r*r-d*r*r*n+3*d*o*r*s-2*i*r*r*s+3*l*r*n*s-l*o*s*s-2*a*r*s*s+2*d*n*s*s-2*i*s*s*s)*(d*r-l*s)/(m*m*m*m*m);return-y}const f=document.getElementById("mechanism"),c=f.getContext("2d");window.data={duration:50,timestep:1,projectile:3,mainaxle:0,armtip:1,axleheight:8,particles:[{x:100,y:100,mass:1,hovered:!1}],constraints:{rod:[],slider:[]}};async function he(){return new Promise(e=>{setTimeout(()=>{e()},1)})}async function me(){await new Promise(e=>{requestAnimationFrame(()=>{e()})})}async function ve(){if(window.data.timestep!=0){var e=JSON.stringify(window.data),t=D(window.data.particles,window.data.constraints,window.data.timestep,window.data.duration,F);window.data.timestep=0;for(var o of[window.data.constraints.rod,window.data.constraints.slider])for(var n=o.length,a=0;a<n;a++)o[a].oneway&&(o.splice(a,1),a-=1,n-=1);for(var i of t){for(var a=0;a<window.data.particles.length;a++)window.data.particles[a].x=i[2*a],window.data.particles[a].y=i[2*a+1];$(),await me()}window.data=JSON.parse(e),$()}}function F(e){e[2*window.data.armtip]-e[2*window.data.projectile],e[2*window.data.armtip+1]-e[2*window.data.projectile+1],e[2*window.data.armtip]-e[2*window.data.mainaxle],e[2*window.data.armtip+1]-e[2*window.data.mainaxle+1];var t=e[2*window.data.projectile+2*window.data.particles.length],o=e[2*window.data.projectile+2*window.data.particles.length+1];return t>40&&o>-15}function Y(){const e=D(window.data.particles,window.data.constraints,window.data.timestep,window.data.duration,F);var t=-window.data.particles[window.data.mainaxle].y,o=-window.data.particles[window.data.mainaxle].y,n=0;for(var a of e){for(var i=0;i<window.data.particles.length;i++)a[2*i]<2e3&&(o=Math.min(o,-a[2*i+1])),t=Math.max(t,-a[2*window.data.mainaxle+1]);n=Math.max(n,2*Math.max(0,-a[2*window.data.particles.length+2*window.data.projectile+1])*a[2*window.data.particles.length+2*window.data.projectile])}var r=t-o,s=Math.sqrt(Math.pow(window.data.particles[window.data.armtip].x-window.data.particles[window.data.mainaxle].x,2)+Math.pow(window.data.particles[window.data.armtip].y-window.data.particles[window.data.projectile].y,2));return n=n/Math.max(r,.75*s)*window.data.axleheight,[e,n]}function $(){if(K(),c.save(),c.setTransform(1,0,0,1,0,0),c.clearRect(0,0,f.width,f.height),c.restore(),c.setTransform(1,0,0,1,0,0),window.data.particles.length>1&&window.data.constraints.rod.length+window.data.constraints.slider.length>1&&window.data.timestep>0&&typeof window.data.timestep=="number"){var[e,t]=Y();document.getElementById("range").innerText=t,e.forEach(o=>{for(let i=0;i<window.data.constraints.rod.length;i++)if(window.data.constraints.rod[i].oneway!=!0){const r=window.data.constraints.rod[i],s=r.p1*2,l=r.p2*2;c.beginPath(),c.moveTo(o[s],o[s+1]),c.lineTo(o[l],o[l+1]),c.strokeStyle="rgba(255, 0, 0, 0.2)",c.stroke()}for(let i=0;i<window.data.constraints.rope.length;i++)if(window.data.constraints.rope[i].oneway!=!0){const r=window.data.constraints.rope[i],s=r.p1*2,l=r.p3*2;c.beginPath(),c.moveTo(o[s],o[s+1]);for(var n of window.data.constraints.rope[i].pulleys){var a=n.idx*2;c.lineTo(o[a],o[a+1])}c.lineTo(o[l],o[l+1]),c.strokeStyle="rgba(255, 0, 0, 0.2)",c.stroke()}}),c.strokeStyle="black"}window.data.particles.forEach((o,n)=>{const a=Math.cbrt(o.mass)*4;c.beginPath(),c.arc(o.x,o.y,a,0,Math.PI*2),c.fillStyle=o.hovered?"yellow":"black",c.strokeStyle="black",c.fill(),c.stroke(),c.font="18px Arial",c.textAlign="center",c.textBaseline="middle",c.fillStyle="black",c.fillText(`P${n+1}`,o.x,o.y-a-10)}),c.lineWidth=3,window.data.constraints.rod.forEach(o=>{const n=window.data.particles[o.p1],a=window.data.particles[o.p2];c.beginPath(),c.moveTo(n.x,n.y),c.lineTo(a.x,a.y),c.strokeStyle=o.hovered?"yellow":"black",c.stroke()}),window.data.constraints.rope.forEach(o=>{const n=window.data.particles[o.p1],a=window.data.particles[o.p3];c.setLineDash([8,8]),c.beginPath(),c.moveTo(n.x,n.y);for(var i of o.pulleys){const r=window.data.particles[i.idx];c.lineTo(r.x,r.y)}c.lineTo(a.x,a.y),c.strokeStyle=o.hovered?"yellow":"black",c.stroke(),c.setLineDash([])}),window.data.constraints.slider.forEach(o=>{const n=window.data.particles[o.p],a=40,i=Math.atan2(o.normal.y,o.normal.x)+Math.PI/2;c.beginPath(),c.moveTo(n.x-a*Math.cos(i),n.y-a*Math.sin(i)),c.lineTo(n.x+a*Math.cos(i),n.y+a*Math.sin(i)),c.strokeStyle=o.hovered?"yellow":"black",c.stroke()}),window.data.constraints.colinear.concat(window.data.constraints.f2k).forEach(o=>{const n=window.data.particles[o.base],a=window.data.particles[o.reference],i=window.data.particles[o.slider],r=Math.sqrt((n.x-a.x)*(n.x-a.x)+(n.y-a.y)*(n.y-a.y)),s=(n.x-a.x)/r,l=(n.y-a.y)/r,d=Math.abs(s*(n.y-i.y)-l*(n.x-i.x));c.beginPath(),c.arc(i.x,i.y,d,0,Math.PI*2),c.strokeStyle="grey",c.stroke()}),c.lineWidth=1}function ye(){const e={x:100,y:100,mass:1,hovered:!1};window.data.particles.push(e),x()}function xe(e,t,o){window.data.particles[e][t]=Number(o),$()}function ge(e){window.data.particles.splice(e,1),x()}function be(e){let t={};if(e==="rod"){if(window.data.particles.length<2){alert("At least two particles are required to create a rod constraint.");return}var o=[];for(let n=0;n<window.data.particles.length;n++)for(let a=0;a<window.data.particles.length;a++)L(n,a)||o.push([n,a]);t={p1:o[0][0],p2:o[0][1],hovered:!1},window.data.constraints.rod.push(t)}else if(e==="slider"){if(window.data.particles.length<1){alert("At least one particle is required to create a slider constraint.");return}t={p:0,normal:{x:0,y:1},hovered:!1},window.data.constraints.slider.push(t)}else if(e==="colinear")t={reference:0,slider:1,base:2},window.data.constraints.colinear.push(t);else if(e==="f2k")t={reference:0,slider:1,base:2},window.data.constraints.f2k.push(t);else if(e==="rope")t={p1:0,pulleys:[],p3:2},window.data.constraints.rope.push(t);else{console.error("Unknown constraint type:",e);return}x()}function $e(e,t,o){const n=+e.value,a=window.data.constraints.rope[t];a.pulleys[o].idx=n,x()}function Ce(e,t,o){const n=e.value,a=window.data.constraints.rope[t];a.pulleys[o].wrapping=n,x()}function Pe(e){window.data.constraints.rope[e].pulleys.push({idx:0,wrapping:"both"}),x()}function _e(e,t,o,n){const a=n.includes("normal")?parseFloat(e.value):parseInt(e.value),i=window.data.constraints[t][o];n==="p1"||n==="p2"||n==="p"?(i[n]=a,x()):n==="normalX"||n==="normalY"?(i.normal[n.slice(-1).toLowerCase()]=a,$()):(i[n]=a,x())}function Me(e,t){window.data.constraints[e].splice(t,1),x()}function R(){var e=window.innerWidth;e>1040&&(e-=440),e=Math.min(e,window.innerHeight-90),f.width=600*1.9,f.height=600*1.9,f.style.width=e+"px",f.style.height=e+"px",x()}function x(){$(),document.getElementById("timestep").value=window.data.timestep,document.getElementById("duration").value=window.data.duration;const e=document.getElementById("particlesControl");for(;e.children.length>1;)e.removeChild(e.lastChild);window.data.particles.forEach((l,d)=>J(d));const t=document.getElementById("constraintsControl");for(;t.children.length>5;)t.removeChild(t.lastChild);window.data.constraints.rod.forEach((l,d)=>M("rod",d)),window.data.constraints.slider.forEach((l,d)=>M("slider",d)),window.data.constraints.colinear.forEach((l,d)=>M("colinear",d)),window.data.constraints.f2k.forEach((l,d)=>M("f2k",d)),window.data.constraints.rope.forEach((l,d)=>M("rope",d));const o=document.getElementById("presets");for(;o.children.length>0;)o.removeChild(o.lastChild);const n=document.createElement("option");n.selected="true",n.innerHTML="Presets",o.appendChild(n);for(var a of Object.keys(Q)){const l=document.createElement("option");l.innerHTML=a,l.value=a,o.appendChild(l)}for(var i of["armtip","projectile","mainaxle"]){for(var r=document.getElementById(i);r.children.length>0;)r.removeChild(r.lastChild);for(var s=0;s<window.data.particles.length;s++){const l=document.createElement("option");l.selected=window.data[i]==s,l.innerHTML=`P ${s+1}`,l.value=s,r.appendChild(l)}}document.getElementById("axleheight").value=window.data.axleheight}function z(e){window.data=JSON.parse(Q[e.value]),window.data.constraints.colinear===void 0&&(window.data.constraints.colinear=[]),window.data.constraints.f2k===void 0&&(window.data.constraints.f2k=[]),window.data.constraints.rope===void 0&&(window.data.constraints.rope=[]),x()}function J(e){const t=document.createElement("div");t.className="control-box",t.innerHTML=`
                <label>Mass: <input type="text" min="1" max="500" value="${window.data.particles[e].mass}" oninput="updateParticle(${e}, 'mass', this.value)"></label>
                <label>X: <input type="text" min="0" max="${f.width}" value="${window.data.particles[e].x}" oninput="updateParticle(${e}, 'x', this.value)"></label>
                <label>Y: <input type="text" min="0" max="${f.height}" value="${window.data.particles[e].y}" oninput="updateParticle(${e}, 'y', this.value)"></label>
                <button class=delete onclick="deleteParticle(${e})">X</button>
              `,t.addEventListener("mouseenter",()=>{window.data.particles[e].hovered=!0,$()}),t.addEventListener("mouseleave",()=>{window.data.particles[e].hovered=!1,$()}),document.getElementById("particlesControl").appendChild(t)}function L(e,t){if(e==t)return!0;for(var o of window.data.constraints.rod)if(o.p1==e&&o.p2==t||o.p1==t&&o.p2==e||e==t)return!0;return!1}function M(e,t){const o=document.createElement("div");if(o.className="control-box",o.dataset.type=e,o.dataset.index=t,e==="rod")o.innerHTML=`Rod
                    <select name="p1" onchange="updateConstraint(this, 'rod', ${t}, 'p1')">
            	   ${window.data.particles.map((n,a)=>a).filter(n=>!L(window.data.constraints.rod[t].p2,n)||n==window.data.constraints.rod[t].p1).map(n=>`<option value="${n}" ${n===window.data.constraints.rod[t].p1?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
                    <select name="p2" onchange="updateConstraint(this, 'rod', ${t}, 'p2')">
            	   ${window.data.particles.map((n,a)=>a).filter(n=>!L(window.data.constraints.rod[t].p1,n)||n==window.data.constraints.rod[t].p2).map(n=>`<option value="${n}" ${n===window.data.constraints.rod[t].p2?"selected":""}>P ${n+1}</option>`).join("")}
                    </select>
		    One way:
            			<input type="checkbox" oninput="window.data.constraints.rod[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.rod[t].oneway?"checked":""}></input>
                  <button class=delete onclick="deleteConstraint('rod', ${t})">X</button>
                `;else if(e==="slider"){const n=window.data.constraints.slider[t];o.innerHTML=`
                  <label>
            		Slider
                    <select name="p" onchange="updateConstraint(this, 'slider', ${t}, 'p')">
                      ${window.data.particles.map((a,i)=>`<option value="${i}" ${i===n.p?"selected":""}>P ${i+1}</option>`).join("")}
                    </select>
                  </label>
                  <label>Normal X: <input type="range" name="normalX" min="-1" max="1" step="0.1" value="${n.normal.x}" oninput="updateConstraint(this, 'slider', ${t}, 'normalX')"></label>
                  <label>Normal Y: <input type="range" name="normalY" min="-1" max="1" step="0.1" value="${n.normal.y}" oninput="updateConstraint(this, 'slider', ${t}, 'normalY')"></label>
		  One way:
            			<input type="checkbox" oninput="window.data.constraints.slider[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.slider[t].oneway?"checked":""}></input>
                  <button class=delete onclick="deleteConstraint('slider', ${t})">X</button>
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
            			<input type="checkbox" oninput="window.data.constraints.colinear[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.colinear[t].oneway?"checked":""}></input>
                  <button class=delete onclick="deleteConstraint('colinear', ${t})">X</button>
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
		    One way:
            			<input type="checkbox" oninput="window.data.constraints.f2k[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.f2k[t].oneway?"checked":""}></input>
                  <button class=delete onclick="deleteConstraint('f2k', ${t})">X</button>
                `:e==="rope"&&(o.innerHTML=`Rope and pulley.
Fixed end:
<select name="p1" onchange="updateConstraint(this, 'rope', ${t}, 'p1')">
${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.rope[t].p1?"selected":""}>P ${n+1}</option>`).join("")}
</select>
<button onclick="addPulley(${t})">+</button>
<button onclick="removePulley(${t})">-</button>
${window.data.constraints.rope[t].pulleys.map((n,a)=>`
Pulley:
<select name="p2" onchange="updatePulley(this, ${t}, ${a})">

${window.data.particles.map((i,r)=>r).map(i=>`<option value="${i}" ${i===n.idx?"selected":""}>P ${i+1}</option>`).join("")}
</select>
<select onchange="updatePulleyDirection(this, ${t}, ${a})">
${["both","cw","ccw"].map(i=>`<option value=${i} ${i==n.wrapping?"selected":""}>${i}</option>`).join("")}
</select>
`).join("")}
Fixed end:
<select name="p3" onchange="updateConstraint(this, 'rope', ${t}, 'p3')">

${window.data.particles.map((n,a)=>a).map(n=>`<option value="${n}" ${n===window.data.constraints.rope[t].p3?"selected":""}>P ${n+1}</option>`).join("")}
</select>
<button class=delete onclick="deleteConstraint('rope', ${t})">X</button>
<input type="checkbox" oninput="window.data.constraints.rope[${t}].oneway=this.checked;updateUI()" ${window.data.constraints.rope[t].oneway?"checked":""}></input>
`);o.addEventListener("mouseenter",()=>{window.data.constraints[e][t].hovered=!0,$()}),o.addEventListener("mouseleave",()=>{window.data.constraints[e][t].hovered=!1,$()}),document.getElementById("constraintsControl").appendChild(o)}let P=null;function W(e,t){return window.data.particles.findIndex(o=>{const n=Math.sqrt((o.x-e)**2+(o.y-t)**2),a=Math.cbrt(o.mass)*10;return n<a})}f.addEventListener("mousedown",function(e){const t=f.getBoundingClientRect(),o=f.width/t.width,n=f.height/t.height,a=(e.clientX-t.left)*o,i=(e.clientY-t.top)*n,r=W(a,i);r!==-1?(P=r,f.style.cursor="move"):(startX=e.clientX-f.offsetLeft,startY=e.clientY-f.offsetTop)});f.addEventListener("mousemove",function(e){if(P!==null){const t=f.getBoundingClientRect(),o=f.width/t.width,n=f.height/t.height,a=(e.clientX-t.left)*o,i=(e.clientY-t.top)*n;window.data.particles[P].x=a,window.data.particles[P].y=i,$()}});f.addEventListener("mouseup",function(e){P!==null&&(x(),P=null,f.style.cursor="default")});f.addEventListener("mouseleave",function(e){P!==null&&(x(),P=null,f.style.cursor="default")});function K(){localStorage.setItem("mechanismData",JSON.stringify(window.data))}function G(){const e=localStorage.getItem("mechanismData");if(e){window.data=JSON.parse(e);try{x()}catch{z({value:"Hinged Counterweight"})}}else z({value:"Hinged Counterweight"})}window.addEventListener("resize",R);window.onload=()=>{G(),R(),fetch("https://apj.hgreer.com/jstreb",{method:"GET",cache:"no-store"})};var Q={"Hinged Counterweight":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":588,"y":440.7,"mass":10},{"x":668,"y":673.6,"mass":1},{"x":586,"y":533.7,"mass":100}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Fixed Counterweight":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":668,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Floating Arm Trebuchet":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":487.0,"y":517.0,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":589,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',F2k:'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.6,"duration":35,"particles":[{"x":454,"y":516,"mass":1},{"x":436.6,"y":513.0,"mass":4},{"x":560.3,"y":211.5,"mass":100},{"x":652.9,"y":621.8,"mass":1}],"constraints":{"rod":[{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":1,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":0,"normal":{"x":0,"y":1}}],"colinear":[],"f2k":[{"reference":1,"slider":0,"base":2}],"rope":[]}}',"Floating Arm Whipper (NASAW)":'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":37,"particles":[{"x":496.3,"y":477.6,"mass":1},{"x":677.5,"y":471.0,"mass":4},{"x":468.0,"y":453.5,"mass":10},{"x":557.0,"y":431.8,"mass":1},{"x":563.0,"y":340.7,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":4,"normal":{"x":0.6,"y":0}}],"colinear":[]}}',Whipper:'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3,"duration":60,"particles":[{"x":536,"y":472.7,"mass":1},{"x":759,"y":451,"mass":4},{"x":483,"y":498,"mass":10},{"x":551,"y":434,"mass":1},{"x":560,"y":368,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":0}}]}}',Fiffer:'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":20,"particles":[{"x":536,"y":472.7,"mass":1},{"x":484,"y":656,"mass":4},{"x":504,"y":433,"mass":10},{"x":644,"y":661,"mass":1},{"x":653,"y":451,"mass":10},{"x":749,"y":428,"mass":1},{"x":749,"y":483,"mass":500},{"x":566,"y":505,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":7,"p2":6},{"p1":6,"p2":4},{"p1":4,"p2":5}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":7,"normal":{"x":0.7,"y":1}},{"p":7,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0.7,"y":1}}]}}',"Floating Arm King Arthur":'{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":40,"particles":[{"x":536,"y":472.7,"mass":1},{"x":527,"y":610,"mass":4},{"x":534,"y":418,"mass":10},{"x":698,"y":608,"mass":1},{"x":560,"y":331,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":-0.5,"y":0},"oneway":true},{"p":1,"normal":{"x":0.7,"y":0},"oneway":true},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',"Launch Ness Monster":'{"projectile":3,"mainaxle":2,"armtip":1,"axleheight":8,"timestep":0.3,"duration":80,"particles":[{"x":600.7,"y":746.2,"mass":10},{"x":559.1,"y":774.0,"mass":4},{"x":660.2,"y":530.0,"mass":100},{"x":703.9,"y":796.7,"mass":1},{"x":810,"y":530,"mass":10},{"x":552,"y":500,"mass":10},{"x":458,"y":666,"mass":10},{"x":886.1,"y":662.4,"mass":10}],"constraints":{"rod":[{"p1":2,"p2":1},{"p1":3,"p2":1,"hovered":true},{"p1":6,"p2":5},{"p1":5,"p2":2},{"p1":4,"p2":2},{"p1":4,"p2":7},{"p1":5,"p2":4}],"slider":[{"p":0,"normal":{"x":1,"y":2.1}},{"p":0,"normal":{"x":-0.6,"y":1.6}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":6,"normal":{"x":0.6,"y":1}},{"p":6,"normal":{"x":0,"y":1}},{"p":7,"normal":{"x":1,"y":1}},{"p":7,"normal":{"x":0,"y":1}}],"colinear":[{"reference":1,"slider":0,"base":2}]}}',"Pulley Sling":'{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":35,"particles":[{"x":546.3,"y":584.3,"mass":1},{"x":285.6,"y":791.6,"mass":4},{"x":560.6,"y":481.2,"mass":10},{"x":1000.9,"y":742.8,"mass":1},{"x":645.5,"y":541.0,"mass":500},{"x":72.7,"y":730.2,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":true},{"p1":0,"p2":2},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":5,"normal":{"x":1,"y":1}},{"p":5,"normal":{"x":0,"y":1}}],"colinear":[],"rope":[{"p1":5,"pulleys":[{"idx":1,"wrapping":"both"}],"p3":3}]}}'};let I=!1;var H=0;async function ke(){if(I){I=!1,document.getElementById("optimize").innerText="Optimize",console.log(H);return}document.getElementById("optimize").innerText="Stop",I=!0;for(var e=500,t=e,o=40;I;){H+=1;var n=+document.getElementById("range").innerText,a=JSON.stringify(window.data);for(var i of window.data.particles)Math.random()>.5&&(i.x=i.x+o*(.5-Math.random()),i.y=i.y+o*(.5-Math.random()));var[r,s]=Y();t%20==0&&await he();var l=s;l>n?(t=e,$()):(window.data=JSON.parse(a),t-=1,t==0&&(t=e,o*=.6))}$()}function Ee(){const e=new Blob([JSON.stringify(window.data)],{type:"application/json"}),t=prompt("Enter a filename for your window.data:","window.data.json");if(!t){alert("Save cancelled.");return}const o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download=t,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(o)}function Te(){const e=document.createElement("input");e.type="file",e.onchange=t=>{console.log("asf");const o=t.target.files[0],n=new FileReader;n.onload=a=>{try{window.data=JSON.parse(a.target.result),x()}catch{alert("Error parsing JSON!")}},n.readAsText(o)},document.body.appendChild(e),e.click(),document.body.removeChild(e)}window.doAnimate=ve;window.terminate=F;window.drawMechanism=$;window.createParticle=ye;window.updateParticle=xe;window.deleteParticle=ge;window.createConstraint=be;window.updateConstraint=_e;window.deleteConstraint=Me;window.resizeCanvas=R;window.updateUI=x;window.loadPreset=z;window.createParticleControlBox=J;window.constraintExists=L;window.createConstraintControlBox=M;window.getParticleAtPosition=W;window.saveMechanism=K;window.loadMechanism=G;window.optimize=ke;window.save=Ee;window.load=Te;window.updatePulley=$e;window.updatePulleyDirection=Ce;window.addPulley=Pe;
