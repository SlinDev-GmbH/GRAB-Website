import"./modulepreload-polyfill-3cfb730f.js";import*as i from"https://cdn.skypack.dev/three@v0.132.0";import{GLTFLoader as Fe}from"https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js";import{GLTFExporter as Re}from"https://cdn.skypack.dev/three@v0.132.0/examples/jsm//exporters/GLTFExporter.js";const Ve=`
	varying vec3 vWorldPosition;

	void main()
	{
		vec3 rotatedPosition = (modelViewMatrix * vec4(position, 0.0)).xyz;
		gl_Position = projectionMatrix * vec4(rotatedPosition, 0.0);
		gl_Position.z = gl_Position.w;

		vWorldPosition = position;
	}`,_e=`
	varying vec3 vWorldPosition;

	uniform vec3 cameraFogColor0;
	uniform vec3 cameraFogColor1;
	uniform float sunSize;

	uniform vec3 sunColor;
	uniform vec3 sunDirection;

	void main()
	{
		vec3 cameraToVertex = normalize(vWorldPosition);

		float horizonFactor = 1.0 - clamp(abs(cameraToVertex.y) / 0.8, 0.0, 1.0);
		vec3 fogColor = mix(cameraFogColor1.rgb, cameraFogColor0.rgb, horizonFactor * horizonFactor);
		vec4 color = vec4(fogColor, 1.0);

		float sunAngle = acos(dot(sunDirection, -cameraToVertex));
		float sunSize = 0.05 * sunSize;
		float sunGlowSize = sunSize * 40.0;
		float sunFactor = clamp((sunGlowSize - sunAngle) / sunGlowSize, 0.0, 1.0);
		sunFactor *= sunFactor;
		if(sunAngle < sunSize) sunFactor = 1.5;
		color.rgb = mix(color.rgb, sunColor, sunFactor);

		gl_FragColor = LinearTosRGB(color);
	}`,E=`
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    uniform mat3 worldNormalMatrix;

    void main()
    {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;

        vNormal = worldNormalMatrix * normal;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,C=`
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    uniform sampler2D colorTexture;
    uniform float tileFactor;
    uniform vec3 diffuseColor;
    uniform float neonEnabled;
    uniform float fogEnabled;

    uniform vec2 cameraFogDistance;
    uniform vec3 cameraFogColor0;
	uniform vec3 cameraFogColor1;
	uniform float sunSize;
	uniform vec3 sunColor;
	uniform vec3 sunDirection;

    void main()
    {
        vec3 lightDirection = normalize(-sunDirection);

        float lightFactor = neonEnabled > 0.5 ? 1.0 : 0.5 + dot(normalize(vNormal), lightDirection) * 0.5 + 0.5;
        vec4 color = vec4(lightFactor, lightFactor, lightFactor, 1.0);

        vec3 blendNormals = abs(vNormal);
        if(blendNormals.x > blendNormals.y && blendNormals.x > blendNormals.z)
        {
            color.rgb *= sRGBToLinear(texture2D(colorTexture, vWorldPosition.zy * tileFactor)).rgb;
        }
        else if(blendNormals.y > blendNormals.z)
        {
            color.rgb *= sRGBToLinear(texture2D(colorTexture, vWorldPosition.xz * tileFactor)).rgb;
        }
        else
        {
            color.rgb *= sRGBToLinear(texture2D(colorTexture, vWorldPosition.xy * tileFactor)).rgb;
        }

        color.rgb *= diffuseColor;

        if(fogEnabled > 0.5)
        {
            vec3 cameraToVertex = vWorldPosition - cameraPosition;
            float distanceToCamera = length(cameraToVertex);
            cameraToVertex = normalize(cameraToVertex);

            float horizonFactor = 1.0 - clamp(abs(cameraToVertex.y) / 0.8, 0.0, 1.0);
            vec3 fogColor = mix(cameraFogColor1.rgb, cameraFogColor0.rgb, horizonFactor * horizonFactor);

            float sunAngle = acos(dot(sunDirection, -cameraToVertex));
            float sunSize_ = 0.05 * sunSize;
            float sunGlowSize = sunSize;
            float sunFactor = clamp((sunGlowSize - sunAngle) / sunGlowSize, 0.0, 1.0);
            sunFactor *= sunFactor;
            fogColor = mix(fogColor, sunColor, sunFactor);

            float fogAmount = clamp((1.0 - exp(-distanceToCamera * cameraFogDistance.x)) * cameraFogDistance.y, 0.0, 1.0);
            color.rgb = mix(color.rgb, fogColor, fogAmount * fogAmount);
        }

        gl_FragColor = LinearTosRGB(color);
    }`,me=`
	varying vec2 vTexcoord;

	void main()
	{
		vTexcoord = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`,he=`
	varying vec2 vTexcoord;

	uniform vec4 diffuseColor;

	void main()
	{
		vec4 color = diffuseColor;
		float factor = vTexcoord.y;
		factor *= factor * factor;
		factor = clamp(factor, 0.0, 1.0);
		color.a = factor;

		gl_FragColor = color;
	}`,Pe=`
	varying vec2 vTexcoord;
	varying vec3 vNormal;

	void main()
	{
		vec4 worldNormal = modelMatrix * vec4(normal, 0.0);
		vNormal = worldNormal.xyz;
		vTexcoord = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`,De=`
	varying vec2 vTexcoord;
	varying vec3 vNormal;
	uniform sampler2D colorTexture;
	uniform vec3 sunDirection;

	void main()
	{
		vec3 lightDirection = normalize(sunDirection);
		lightDirection = normalize(lightDirection);
		float lightFactor = 0.5 + dot(normalize(vNormal), -lightDirection) * 0.5 + 0.5;

		gl_FragColor = texture2D(colorTexture, vTexcoord) * lightFactor;
	}`,Ae={type:"change"};class Ie extends i.EventDispatcher{constructor(l,b){super(),b===void 0&&(console.warn('FreeControls: The second parameter "domElement" is now mandatory.'),b=document),this.object=l,this.domElement=b,this.movementSpeed=10,this.rollSpeed=.01,this.isMouseActive=!1;const r=this,h=1e-6,s=new i.Quaternion,j=new i.Vector3;this.moveState={left:0,right:0,forward:0,back:0,up:0,down:0,pitchUp:0,pitchDown:0,yawLeft:0,yawRight:0},this.moveVector=new i.Vector3(0,0,0),this.rotationVector=new i.Vector3(0,0,0),this.eulerVector=new i.Euler(0,0,0,"YXZ"),this.movementSpeedMultiplier=1,this.touchCount=0,this.touchPosition=new i.Vector3(0,0,0),this.keydown=function(a){if(!a.altKey){switch(a.code){case"ShiftLeft":case"ShiftRight":this.movementSpeedMultiplier=10;break;case"KeyC":this.movementSpeedMultiplier=100;break;case"KeyW":this.moveState.forward=1;break;case"KeyS":this.moveState.back=1;break;case"KeyA":this.moveState.left=1;break;case"KeyD":this.moveState.right=1;break;case"KeyE":this.moveState.up=1;break;case"KeyQ":this.moveState.down=1;break;case"ArrowUp":this.moveState.pitchUp=1;break;case"ArrowDown":this.moveState.pitchDown=1;break;case"ArrowLeft":this.moveState.yawLeft=1;break;case"ArrowRight":this.moveState.yawRight=1;break}this.updateMovementVector(),this.updateRotationVector()}},this.keyup=function(a){switch(a.code){case"ShiftLeft":case"ShiftRight":this.movementSpeedMultiplier=1;break;case"KeyC":this.movementSpeedMultiplier=1;break;case"KeyW":this.moveState.forward=0;break;case"KeyS":this.moveState.back=0;break;case"KeyA":this.moveState.left=0;break;case"KeyD":this.moveState.right=0;break;case"KeyE":this.moveState.up=0;break;case"KeyQ":this.moveState.down=0;break;case"ArrowUp":this.moveState.pitchUp=0;break;case"ArrowDown":this.moveState.pitchDown=0;break;case"ArrowLeft":this.moveState.yawLeft=0;break;case"ArrowRight":this.moveState.yawRight=0;break}this.updateMovementVector(),this.updateRotationVector()},this.mousedown=function(a){if(this.isMouseActive){switch(a.button){case 0:this.moveState.forward=1;break;case 2:this.moveState.back=1;break}this.updateMovementVector()}},this.mousemove=function(a){this.isMouseActive&&(this.moveState.yawLeft=-a.movementX,this.moveState.pitchDown=a.movementY,this.updateRotationVector())},this.mouseup=function(a){if(this.isMouseActive){switch(a.button){case 0:this.moveState.forward=0;break;case 2:this.moveState.back=0;break}this.updateMovementVector()}},this.touchstart=function(a){this.touchCount=a.targetTouches.length,this.touchPosition.x=a.targetTouches[0].screenX,this.touchPosition.y=a.targetTouches[0].screenY,console.log("start: "+this.touchCount),this.moveState.forward=this.touchCount>1?1:0,this.movementSpeedMultiplier=this.touchCount>2?10:1,this.updateMovementVector()},this.touchend=function(a){this.touchCount=a.targetTouches.length,console.log("end: "+this.touchCount),this.moveState.forward=this.touchCount>1?1:0,this.movementSpeedMultiplier=this.touchCount>2?10:1,this.updateMovementVector()},this.touchcancel=function(a){this.touchCount=a.targetTouches.length,console.log("cancel: "+this.touchCount),this.moveState.forward=this.touchCount>1?1:0,this.movementSpeedMultiplier=this.touchCount>2?10:1,this.updateMovementVector()},this.touchmove=function(a){this.touchCount>0&&(this.moveState.yawLeft=a.targetTouches[0].screenX-this.touchPosition.x,this.moveState.pitchDown=this.touchPosition.y-a.targetTouches[0].screenY,this.touchPosition.x=a.targetTouches[0].screenX,this.touchPosition.y=a.targetTouches[0].screenY,this.updateRotationVector())},this.update=function(a){const W=a*r.movementSpeed*r.movementSpeedMultiplier,G=r.rollSpeed;r.object.translateX(r.moveVector.x*W),r.object.position.y+=r.moveVector.y*W,r.object.translateZ(r.moveVector.z*W),r.eulerVector.x+=r.rotationVector.x*G,r.eulerVector.y+=r.rotationVector.y*G,r.eulerVector.z=0,r.object.quaternion.setFromEuler(r.eulerVector),r.rotationVector.x=0,r.rotationVector.y=0,r.rotationVector.z=0,(j.distanceToSquared(r.object.position)>h||8*(1-s.dot(r.object.quaternion))>h)&&(r.dispatchEvent(Ae),s.copy(r.object.quaternion),j.copy(r.object.position))},this.updateMovementVector=function(){this.moveVector.x=-this.moveState.left+this.moveState.right,this.moveVector.y=-this.moveState.down+this.moveState.up,this.moveVector.z=-this.moveState.forward+this.moveState.back},this.updateRotationVector=function(){this.rotationVector.x=-this.moveState.pitchDown+this.moveState.pitchUp,this.rotationVector.y=-this.moveState.yawRight+this.moveState.yawLeft,this.moveState.pitchDown=0,this.moveState.pitchUp=0,this.moveState.yawRight=0,this.moveState.yawLeft=0},this.getContainerDimensions=function(){return this.domElement!=document?{size:[this.domElement.offsetWidth,this.domElement.offsetHeight],offset:[this.domElement.offsetLeft,this.domElement.offsetTop]}:{size:[window.innerWidth,window.innerHeight],offset:[0,0]}},this.dispose=function(){this.domElement.removeEventListener("contextmenu",ve),this.domElement.removeEventListener("mousedown",L),this.domElement.removeEventListener("mousemove",U),this.domElement.removeEventListener("mouseup",T),this.domElement.removeEventListener("touchstart",O),this.domElement.removeEventListener("touchend",P),this.domElement.removeEventListener("touchcancel",A),this.domElement.removeEventListener("touchmove",v),window.removeEventListener("keydown",I),window.removeEventListener("keyup",H)};const U=this.mousemove.bind(this),L=this.mousedown.bind(this),T=this.mouseup.bind(this),O=this.touchstart.bind(this),P=this.touchend.bind(this),A=this.touchcancel.bind(this),v=this.touchmove.bind(this),I=this.keydown.bind(this),H=this.keyup.bind(this);this.domElement.addEventListener("contextmenu",ve),this.domElement.addEventListener("mousemove",U),this.domElement.addEventListener("mousedown",L),this.domElement.addEventListener("mouseup",T),this.domElement.addEventListener("touchstart",O,!1),this.domElement.addEventListener("touchend",P,!1),this.domElement.addEventListener("touchcancel",A,!1),this.domElement.addEventListener("touchmove",v,!1),window.addEventListener("keydown",I),window.addEventListener("keyup",H),this.updateMovementVector(),this.updateRotationVector()}}function ve(n){n.preventDefault()}let Y,fe,V,_,x,J,ge,be,Z=[],X=[],y=[],z=[],te=!0;He();function pe(n){let l=n+"=",r=decodeURIComponent(document.cookie).split(";");for(let h=0;h<r.length;h++){let s=r[h];for(;s.charAt(0)==" ";)s=s.substring(1);if(s.indexOf(l)==0)return s.substring(l.length,s.length)}return""}function S(n,l,b,r,h=0){let s=new i.ShaderMaterial;return s.vertexShader=b,s.fragmentShader=r,s.flatShading=!0,s.uniforms={colorTexture:{value:null},tileFactor:{value:l},diffuseColor:{value:[1,1,1]},worldNormalMatrix:{value:new i.Matrix3},neonEnabled:{value:h},fogEnabled:{value:1}},s.uniforms.colorTexture.value=ge.load(n),s.uniforms.colorTexture.value.wrapS=s.uniforms.colorTexture.value.wrapT=i.RepeatWrapping,s}function D(n){return new Promise(l=>{be.load(n,l)}).then(function(l){return l.scene.children[0].geometry})}function He(){document.getElementById("back-button").addEventListener("click",Ue),document.getElementById("copy-button").addEventListener("click",Oe),document.getElementById("download-button").addEventListener("click",Qe),document.getElementById("fog-button").addEventListener("click",qe),x=new i.WebGLRenderer({antialias:!0}),x.setSize(window.innerWidth,window.innerHeight),x.outputEncoding=i.sRGBEncoding,x.setClearColor(new i.Color(143/255,182/255,221/255),1),x.setAnimationLoop(Be),x.domElement.id="canvas",document.body.appendChild(x.domElement),window.addEventListener("resize",We),document.addEventListener("pointerlockchange",je,!1),x.domElement.onclick=function(){x.domElement.requestPointerLock()},ge=new i.TextureLoader,be=new Fe;let n=[];n.push(D(VIEWER_PATH+"models/cube.gltf")),n.push(D(VIEWER_PATH+"models/sphere.gltf")),n.push(D(VIEWER_PATH+"models/cylinder.gltf")),n.push(D(VIEWER_PATH+"models/pyramid.gltf")),n.push(D(VIEWER_PATH+"models/prism.gltf"));let l=Promise.all(n).then(function(L){for(let T of L)Z.push(T)}),b=[];b.push(D(VIEWER_PATH+"models/start_end.gltf")),b.push(D(VIEWER_PATH+"models/sign.gltf"));let r=Promise.all(b).then(function(L){for(let T of L)X.push(T)});y.push(S(VIEWER_PATH+"textures/default.png",1,E,C)),y.push(S(VIEWER_PATH+"textures/grabbable.png",1,E,C)),y.push(S(VIEWER_PATH+"textures/ice.png",.1,E,C)),y.push(S(VIEWER_PATH+"textures/lava.png",.1,E,C)),y.push(S(VIEWER_PATH+"textures/wood.png",1,E,C)),y.push(S(VIEWER_PATH+"textures/grapplable.png",.1,E,C)),y.push(S(VIEWER_PATH+"textures/grapplable_lava.png",.1,E,C)),y.push(S(VIEWER_PATH+"textures/grabbable_crumbling.png",1,E,C)),y.push(S(VIEWER_PATH+"textures/default_colored.png",1,E,C)),y.push(S(VIEWER_PATH+"textures/bouncing.png",1,E,C));let h=new i.ShaderMaterial;h.vertexShader=me,h.fragmentShader=he,h.flatShading=!0,h.transparent=!0,h.depthWrite=!1,h.uniforms={diffuseColor:{value:[0,1,0,1]}},z.push(h);let s=new i.ShaderMaterial;s.vertexShader=me,s.fragmentShader=he,s.flatShading=!0,s.transparent=!0,s.depthWrite=!1,s.uniforms={diffuseColor:{value:[1,0,0,1]}},z.push(s),z.push(S(VIEWER_PATH+"textures/wood.png",1,Pe,De)),z.push(S(VIEWER_PATH+"textures/default_colored.png",1,E,C,1)),fe=new i.Clock,_=new i.Scene,V=new i.PerspectiveCamera(70,window.innerWidth/window.innerHeight,.1,5e3);const j=new i.AmbientLight(4210752);_.add(j);const U=new i.DirectionalLight(16777215,.5);_.add(U),J=new Ie(V,x.domElement),protobuf.load(VIEWER_PATH+"proto/level.proto",function(L,T){if(L)throw L;const O=T.lookupType("COD.Level.Level");(async()=>{let P=pe("access_token"),A=pe("user_info"),v;A&&A.length>0&&(v=JSON.parse(A));var I=document.getElementById("title"),H=document.getElementById("creators"),a=document.getElementById("description"),W=document.getElementById("complexity"),G=document.getElementById("checkpoints"),oe=document.getElementById("date");let F=new URLSearchParams(window.location.search).get("level"),B=F.split(":"),we=B.length===3;F=B.join("/");let N=await(await fetch(SERVER_URL+"details/"+F)).json();if(Y=B[0],console.log(Y),N.hidden===!0&&(!v||!("is_admin"in v)||v.is_admin===!1)){I.innerHTML="<b>NOT AVAILABLE</b>",H.innerHTML="",a.innerHTML="",W.innerHTML="",G.innerHTML="",oe.innerHTML="";return}we||(F=N.data_key.split(":"),F.splice(0,1),F=F.join("/"));let ye=await(await fetch(SERVER_URL+"download/"+F)).arrayBuffer(),Se=new Uint8Array(ye),c=O.decode(Se);var xe=document.getElementById("fullscreen");xe.onclick=Ge;let q=document.getElementById("moderationcontainer");if(v&&"is_moderator"in v&&v.is_moderator===!0){let d=document.createElement("form");q.appendChild(d),d.innerHTML='<fieldset><legend>Tags:</legend><input type="checkbox" value="ok">ok <input type="submit" value="Submit" /></fieldset>';let u=d.childNodes[0],p=[];for(const o of u.childNodes)if(o.type==="checkbox"&&(p.push(o),"tags"in N&&N.tags.length>0))for(const m of N.tags)m===o.value&&(o.checked=!0);d.onsubmit=function(o){let m="";for(const t of p)t.checked&&(m+=t.value+",");return(async()=>{let t=await fetch(SERVER_URL+"tag/"+B[0]+"/"+B[1]+"?tags="+m+"&access_token="+P),f=await t.text();console.log(f),confirm("Result: "+f),t.status!=200&&P&&f==="Not authorized!"&&logout()})(),!1};let e=document.createElement("br");q.appendChild(e)}if(v&&"is_admin"in v&&v.is_admin===!0){let d=document.createElement("button");q.appendChild(d),d.innerHTML="<b>MAKE CREATOR</b>",d.onclick=function(){(async()=>{let p=await fetch(SERVER_URL+"set_user_info_admin/"+B[0]+"?access_token="+P+"&is_creator=true"),e=await p.text();console.log(e),confirm("Result: "+e),p.status!=200&&P&&e==="Not authorized!"&&logout()})()};let u=document.createElement("br");q.appendChild(u),u=document.createElement("br"),q.appendChild(u)}await l,await r;let g=new i.ShaderMaterial;g.vertexShader=Ve,g.fragmentShader=_e,g.flatShading=!1,g.depthWrite=!1,g.side=i.BackSide;let ie=new i.Euler(i.MathUtils.degToRad(-45),i.MathUtils.degToRad(315),0);c.ambienceSettings?(ie=new i.Euler(-i.MathUtils.degToRad(c.ambienceSettings.sunAltitude),i.MathUtils.degToRad(c.ambienceSettings.sunAzimuth),0),g.uniforms.cameraFogColor0={value:[c.ambienceSettings.skyHorizonColor.r,c.ambienceSettings.skyHorizonColor.g,c.ambienceSettings.skyHorizonColor.b]},g.uniforms.cameraFogColor1={value:[c.ambienceSettings.skyZenithColor.r,c.ambienceSettings.skyZenithColor.g,c.ambienceSettings.skyZenithColor.b]},g.uniforms.sunSize={value:c.ambienceSettings.sunSize}):(g.uniforms.cameraFogColor0={value:[.916,.9574,.9574]},g.uniforms.cameraFogColor1={value:[.28,.476,.73]},g.uniforms.sunSize={value:1});const ne=new i.Vector3(0,0,1);ne.applyEuler(ie);const k=ne.clone();k.x=-k.x,k.y=-k.y,k.z=-k.z,g.uniforms.sunDirection={value:k},g.uniforms.sunColor={value:[1,1,1]};const $=new i.Mesh(Z[1],g);$.frustumCulled=!1,$.renderOrder=1e3,_.add($);for(let d of y){let u=0;c.ambienceSettings?(d.uniforms.cameraFogColor0={value:[c.ambienceSettings.skyHorizonColor.r,c.ambienceSettings.skyHorizonColor.g,c.ambienceSettings.skyHorizonColor.b]},d.uniforms.cameraFogColor1={value:[c.ambienceSettings.skyZenithColor.r,c.ambienceSettings.skyZenithColor.g,c.ambienceSettings.skyZenithColor.b]},d.uniforms.sunSize={value:c.ambienceSettings.sunSize},u=c.ambienceSettings.fogDDensity):(d.uniforms.cameraFogColor0={value:[.916,.9574,.9574]},d.uniforms.cameraFogColor1={value:[.28,.476,.73]},d.uniforms.sunSize={value:1}),d.uniforms.sunDirection={value:k},d.uniforms.sunColor={value:[1,1,1]};let p=u*u*u*u,e=.5*p+1e-6*(1-p),o=1/(1-Math.exp(-1500*e));d.uniforms.cameraFogDistance={value:[e,o]}}for(let d of z)d.uniforms.sunDirection={value:k};let K=new i.Quaternion;K.setFromAxisAngle(new i.Vector3(0,1,0),Math.PI);let re=0,Q=0;const ae=function(d,u){for(let e of d)if(e.levelNodeGroup){let o=new i.Object3D;u.add(o),o.position.x=e.levelNodeGroup.position.x,o.position.y=e.levelNodeGroup.position.y,o.position.z=e.levelNodeGroup.position.z,o.scale.x=e.levelNodeGroup.scale.x,o.scale.y=e.levelNodeGroup.scale.y,o.scale.z=e.levelNodeGroup.scale.z,o.quaternion.x=e.levelNodeGroup.rotation.x,o.quaternion.y=e.levelNodeGroup.rotation.y,o.quaternion.z=e.levelNodeGroup.rotation.z,o.quaternion.w=e.levelNodeGroup.rotation.w,ae(e.levelNodeGroup.childNodes,o)}else if(e.levelNodeStatic){let o=y[e.levelNodeStatic.material];e.levelNodeStatic.material===T.COD.Types.LevelNodeMaterial.DEFAULT_COLORED&&e.levelNodeStatic.isNeon&&(o=z[3]);let m=o.clone();m.uniforms.colorTexture=o.uniforms.colorTexture,e.levelNodeStatic.material==T.COD.Types.LevelNodeMaterial.DEFAULT_COLORED&&e.levelNodeStatic.color&&(m.uniforms.diffuseColor.value=[e.levelNodeStatic.color.r,e.levelNodeStatic.color.g,e.levelNodeStatic.color.b]);let t=new i.Mesh(Z[e.levelNodeStatic.shape-1e3],m);u.add(t),t.position.x=e.levelNodeStatic.position.x,t.position.y=e.levelNodeStatic.position.y,t.position.z=e.levelNodeStatic.position.z,t.scale.x=e.levelNodeStatic.scale.x,t.scale.y=e.levelNodeStatic.scale.y,t.scale.z=e.levelNodeStatic.scale.z,t.quaternion.x=e.levelNodeStatic.rotation.x,t.quaternion.y=e.levelNodeStatic.rotation.y,t.quaternion.z=e.levelNodeStatic.rotation.z,t.quaternion.w=e.levelNodeStatic.rotation.w;{let ee=t.quaternion.multiply(K);t.setRotationFromQuaternion(ee)}let f=new i.Vector3,w=new i.Quaternion,M=new i.Matrix4;M.compose(t.getWorldPosition(f),t.getWorldQuaternion(w),t.getWorldScale(f));let R=new i.Matrix3;R.getNormalMatrix(M),m.uniforms.worldNormalMatrix.value=R,Q+=2}else if(e.levelNodeCrumbling){let o=y[e.levelNodeCrumbling.material],m=o.clone();m.uniforms.colorTexture=o.uniforms.colorTexture;let t=new i.Mesh(Z[e.levelNodeCrumbling.shape-1e3],m);u.add(t),t.position.x=e.levelNodeCrumbling.position.x,t.position.y=e.levelNodeCrumbling.position.y,t.position.z=e.levelNodeCrumbling.position.z,t.scale.x=e.levelNodeCrumbling.scale.x,t.scale.y=e.levelNodeCrumbling.scale.y,t.scale.z=e.levelNodeCrumbling.scale.z,t.quaternion.x=e.levelNodeCrumbling.rotation.x,t.quaternion.y=e.levelNodeCrumbling.rotation.y,t.quaternion.z=e.levelNodeCrumbling.rotation.z,t.quaternion.w=e.levelNodeCrumbling.rotation.w;{let ee=t.quaternion.multiply(K);t.setRotationFromQuaternion(ee)}let f=new i.Vector3,w=new i.Quaternion,M=new i.Matrix4;M.compose(t.getWorldPosition(f),t.getWorldQuaternion(w),t.getWorldScale(f));let R=new i.Matrix3;R.getNormalMatrix(M),m.uniforms.worldNormalMatrix.value=R,Q+=3}else if(e.levelNodeStart){let o=new i.Mesh(X[0],z[0]);u.add(o),o.position.x=e.levelNodeStart.position.x,o.position.y=e.levelNodeStart.position.y,o.position.z=e.levelNodeStart.position.z,o.scale.x=e.levelNodeStart.radius*2,o.scale.z=e.levelNodeStart.radius*2,V.position.set(o.position.x,o.position.y+2,o.position.z)}else if(e.levelNodeFinish){let o=new i.Mesh(X[0],z[1]);u.add(o),o.position.x=e.levelNodeFinish.position.x,o.position.y=e.levelNodeFinish.position.y,o.position.z=e.levelNodeFinish.position.z,o.scale.x=e.levelNodeFinish.radius*2,o.scale.z=e.levelNodeFinish.radius*2;var p=document.getElementById("go to finish");p.innerHTML="Go to Finish",p.onclick=function(){V.position.set(o.position.x,o.position.y+2,o.position.z)}}else if(e.levelNodeSign){let o=z[2],m=o.clone();m.uniforms.colorTexture=o.uniforms.colorTexture;let t=new i.Mesh(X[1],m);u.add(t),t.position.x=e.levelNodeSign.position.x,t.position.y=e.levelNodeSign.position.y,t.position.z=e.levelNodeSign.position.z,t.quaternion.x=e.levelNodeSign.rotation.x,t.quaternion.y=e.levelNodeSign.rotation.y,t.quaternion.z=e.levelNodeSign.rotation.z,t.quaternion.w=e.levelNodeSign.rotation.w;{let w=t.quaternion.multiply(K);t.setRotationFromQuaternion(w)}let f=e.levelNodeSign.text;if(v&&"is_admin"in v&&v.is_admin===!0&&f&&f.length>0){let w=document.createElement("div");const M=document.createTextNode("Sign "+re+": "+f);w.appendChild(M),w.appendChild(document.createElement("br")),w.appendChild(document.createElement("br")),w.onclick=function(){V.position.set(t.position.x,t.position.y+1,t.position.z)},q.appendChild(w)}re+=1,Q+=5}};ae(c.levelNodes,_);const Ee=document.createTextNode("title: ");I.appendChild(Ee);const le=document.createElement("b");I.appendChild(le);const Ce=document.createTextNode(c.title);le.appendChild(Ce);const Te=document.createTextNode("creators: ");H.appendChild(Te);const se=document.createElement("i");H.appendChild(se);const Ne=document.createTextNode(c.creators);se.appendChild(Ne);const Le=document.createTextNode("description: "+c.description);a.appendChild(Le);const ke=document.createTextNode("complexity: "+c.complexity+" (real: "+Q+")");W.appendChild(ke);const Me=document.createTextNode("checkpoints: "+c.maxCheckpointCount);G.appendChild(Me);const ce=new Date(N.creation_timestamp),de=new Date(N.update_timestamp);let ue="created: "+ce.toDateString();ce.toDateString()!==de.toDateString()&&(ue+=" (updated: "+de.toDateString()+")");const ze=document.createTextNode(ue);if(oe.appendChild(ze),"tags"in N&&N.tags.length>0){for(const d of N.tags)if(d==="ok"){const u=document.getElementById("info");let p=document.createElement("img");p.className="info-stamp-ok",p.src="/src/assets/stamp_ok.png",u.appendChild(p);break}}(async()=>{let u=new URLSearchParams(window.location.search).get("level");u=u.split(":").join("/");let e=await(await fetch(SERVER_URL+"statistics/"+u)).json();var o=document.getElementById("total played count");o.innerHTML="total played count: <b>"+e.total_played_count+"</b>";var m=document.getElementById("total finished count");m.innerHTML="total finished count: <b>"+e.total_finished_count+"</b>";var t=document.getElementById("players played count");t.innerHTML="players played count: <b>"+e.played_count+"</b>";var f=document.getElementById("players finished count");f.innerHTML="players finished count: <b>"+e.finished_count+"</b>";var w=document.getElementById("players rated count");w.innerHTML="players rated count: <b>"+e.rated_count+"</b>";var M=document.getElementById("players liked count");M.innerHTML="players liked count: <b>"+e.liked_count+"</b>";var R=document.getElementById("average time");e.average_time?R.innerHTML="average time: <b>"+e.average_time+"</b>":R.innerHTML="average time: <b>N/a</b>"})()})()})}function We(){let n=window.innerHeight,l=window.innerWidth;V.aspect=l/n,V.updateProjectionMatrix(),x.setSize(l,n)}function Be(n){const l=fe.getDelta();J.update(l),x.render(_,V)}function qe(){te=!te;let n=te?1:0;_.traverse(function(l){l instanceof i.Mesh&&"material"in l&&"fogEnabled"in l.material.uniforms&&(l.material.uniforms.fogEnabled.value=n)})}function Ge(){let n=document.getElementById("canvas");n.requestFullscreen?n.requestFullscreen():n.mozRequestFullScreen?n.mozRequestFullScreen():n.webkitRequestFullscreen?n.webkitRequestFullscreen():n.msRequestFullscreen&&n.msRequestFullscreen(),n.style.width="100%",n.style.height="100%"}function je(){document.pointerLockElement===canvas?J.isMouseActive=!0:J.isMouseActive=!1}function Ue(){let n=new URL(window.location);n.pathname="/levels",Y!==void 0?n.search="?tab=user&user_id="+Y:n.search="",window.location.href=n.href}async function Oe(){await navigator.clipboard.writeText(window.location.href)}function Ke(n,l){const b=new Blob([l],{type:"text/json"});if(window.navigator.msSaveOrOpenBlob)window.navigator.msSaveBlob(b,n);else{const r=window.document.createElement("a");r.href=window.URL.createObjectURL(b),r.download=n,document.body.appendChild(r),r.click(),document.body.removeChild(r)}}function Qe(){new Re().parse(_,function(l){console.log(l),Ke("test.gltf",JSON.stringify(l))},function(l){console.log("An error happened")},{})}
