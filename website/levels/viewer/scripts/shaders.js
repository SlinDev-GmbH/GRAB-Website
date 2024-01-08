export const skyVS = `
	varying vec3 vWorldPosition;

	void main()
	{
		vec3 rotatedPosition = (modelViewMatrix * vec4(position, 0.0)).xyz;
		gl_Position = projectionMatrix * vec4(rotatedPosition, 0.0);
		gl_Position.z = gl_Position.w;

		vWorldPosition = position;
	}`

export const skyFS = `
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
		float sunGlowSize = sunSize;
		float sunFactor = clamp((sunGlowSize - sunAngle) / sunGlowSize, 0.0, 1.0);
		sunFactor *= sunFactor;
		if(sunAngle < sunSize) sunFactor = 1.5;
		color.rgb = mix(color.rgb, sunColor, sunFactor);

		gl_FragColor = color;
		#include <colorspace_fragment>
	}`

export const levelVS = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    uniform mat3 worldNormalMatrix;

    void main()
    {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;

        vNormal = worldNormalMatrix * normal;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`

export const levelFS = `
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
            color.rgb *= texture2D(colorTexture, vWorldPosition.zy * tileFactor).rgb;
        }
        else if(blendNormals.y > blendNormals.z)
        {
            color.rgb *= texture2D(colorTexture, vWorldPosition.xz * tileFactor).rgb;
        }
        else
        {
            color.rgb *= texture2D(colorTexture, vWorldPosition.xy * tileFactor).rgb;
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

        gl_FragColor = color;

   		#include <colorspace_fragment>
    }`


export const startFinishVS = `
	varying vec2 vTexcoord;

	void main()
	{
		vTexcoord = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`

export const startFinishFS = `
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
	}`

export const signVS = `
	varying vec2 vTexcoord;
	varying vec3 vNormal;

	void main()
	{
		vec4 worldNormal = modelMatrix * vec4(normal, 0.0);
		vNormal = worldNormal.xyz;
		vTexcoord = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`

export const signFS = `
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
		#include <colorspace_fragment>
	}`
